"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { consultaSchema, type ConsultaSchemaType } from "@/schemas/reporte.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    FlaskConical,
    Loader2,
    AlertCircle,
    CheckCircle,
    Download,
    Calendar,
    User,
    ShieldCheck,
} from "lucide-react";

interface Parametro {
    nombreParametro: string;
    valor: string;
    unidad: string;
    valorRefMin?: string | null;
    valorRefMax?: string | null;
}

interface Estudio {
    nombreEstudio: string;
    fechaRealizacion: string;
    observaciones?: string | null;
    parametros: Parametro[];
}

interface ResultadoConsulta {
    paciente: {
        nombre: string;
        apellidoPaterno: string;
        apellidoMaterno?: string;
        folio: string;
    };
    laboratorio: {
        nombre: string;
        direccion?: string;
        telefono?: string;
        logo?: string;
    };
    fechaEmision: string;
    fechaExpiracion: string;
    estudios: Estudio[];
}

export default function ConsultaPage({
    params,
}: {
    params: Promise<{ codigoAcceso: string }>;
}) {
    const [codigoAcceso, setCodigoAcceso] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultado, setResultado] = useState<ResultadoConsulta | null>(null);

    useEffect(() => {
        const loadParams = async () => {
            const { codigoAcceso } = await params;
            setCodigoAcceso(codigoAcceso);
        };
        loadParams();
    }, [params]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ConsultaSchemaType>({
        resolver: zodResolver(consultaSchema),
    });

    const onSubmit = async (data: ConsultaSchemaType) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/consulta/${codigoAcceso}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Acceso denegado");
                return;
            }

            setResultado(result.data);
        } catch {
            setError("Error de conexión. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getNombreCompleto = (paciente: ResultadoConsulta["paciente"]) => {
        return `${paciente.nombre} ${paciente.apellidoPaterno} ${paciente.apellidoMaterno || ""}`.trim();
    };

    const getValueColor = (valor: string, min?: string | null, max?: string | null) => {
        const numValue = parseFloat(valor);
        if (isNaN(numValue)) return "text-slate-300";

        const numMin = min ? parseFloat(min) : null;
        const numMax = max ? parseFloat(max) : null;

        if (numMin !== null && numValue < numMin) return "text-blue-400 font-semibold";
        if (numMax !== null && numValue > numMax) return "text-red-400 font-semibold";
        if (numMin !== null || numMax !== null) return "text-blue-400";

        return "text-slate-300";
    };

    const getReferenceText = (min?: string | null, max?: string | null) => {
        if (min && max) return `${min} - ${max}`;
        if (min) return `> ${min}`;
        if (max) return `< ${max}`;
        return "-";
    };

    // Show results if validated
    if (resultado) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                                        <FlaskConical className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-white">
                                            {resultado.laboratorio.nombre}
                                        </h1>
                                        {resultado.laboratorio.direccion && (
                                            <p className="text-sm text-slate-400">{resultado.laboratorio.direccion}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 items-center">
                                    <Badge className="bg-blue-500 text-white h-10 px-4">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Resultados Verificados
                                    </Badge>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 h-10"
                                    >
                                        <a
                                            href={`/api/consulta/${codigoAcceso}/pdf`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Descargar PDF
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Patient Info */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-400" />
                                Información del Paciente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-slate-500">Nombre</p>
                                <p className="text-white font-medium">{getNombreCompleto(resultado.paciente)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Folio</p>
                                <Badge variant="outline" className="font-mono text-blue-400 border-blue-500/30 bg-blue-500/10">
                                    {resultado.paciente.folio}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Fecha de Emisión</p>
                                <p className="text-slate-300">{formatDate(resultado.fechaEmision)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Válido hasta</p>
                                <p className="text-slate-300">{formatDate(resultado.fechaExpiracion)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Studies */}
                    {resultado.estudios.map((estudio, idx) => (
                        <Card key={idx} className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="bg-blue-500/10 border-b border-slate-700">
                                <CardTitle className="text-white">{estudio.nombreEstudio}</CardTitle>
                                <CardDescription className="text-slate-400">
                                    <Calendar className="inline h-4 w-4 mr-1" />
                                    Realizado: {formatDate(estudio.fechaRealizacion)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-700 hover:bg-transparent">
                                            <TableHead className="text-slate-400">Parámetro</TableHead>
                                            <TableHead className="text-slate-400">Resultado</TableHead>
                                            <TableHead className="text-slate-400">Unidad</TableHead>
                                            <TableHead className="text-slate-400">Referencia</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {estudio.parametros.map((param, pIdx) => (
                                            <TableRow key={pIdx} className="border-slate-700">
                                                <TableCell className="text-white font-medium">
                                                    {param.nombreParametro}
                                                </TableCell>
                                                <TableCell className={getValueColor(param.valor, param.valorRefMin, param.valorRefMax)}>
                                                    {param.valor}
                                                </TableCell>
                                                <TableCell className="text-slate-400">{param.unidad}</TableCell>
                                                <TableCell className="text-slate-500">
                                                    {getReferenceText(param.valorRefMin, param.valorRefMax)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {estudio.observaciones && (
                                    <div className="p-4 bg-amber-500/10 border-t border-slate-700">
                                        <p className="text-sm text-amber-400">
                                            <strong>Observaciones:</strong> {estudio.observaciones}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {/* Legend */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="py-4">
                            <div className="flex flex-wrap gap-4 justify-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                                    <span className="text-slate-400">Normal</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <span className="text-slate-400">Alto</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                                    <span className="text-slate-400">Bajo</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="text-center text-sm text-slate-500">
                        <ShieldCheck className="inline h-4 w-4 mr-1" />
                        Este resultado es verificado y emitido por {resultado.laboratorio.nombre}
                    </div>
                </div>
            </div >
        );
    }

    // Show validation form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                        <FlaskConical className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-white">
                            Consulta de Resultados
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Ingresa tu folio para ver tus resultados
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <Alert variant="destructive" className="bg-red-900/50 border-red-800">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="folio" className="text-slate-300">
                                Folio del Paciente
                            </Label>
                            <Input
                                id="folio"
                                placeholder="Ingresa tu folio"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                                {...register("folio")}
                                disabled={isLoading}
                            />
                            {errors.folio && (
                                <p className="text-sm text-red-400">{errors.folio.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                "Ver Resultados"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
