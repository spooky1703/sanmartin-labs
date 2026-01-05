"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { consultaSchema, type ConsultaSchemaType } from "@/schemas/reporte.schema";
import { Button } from "@/components/ui/button";
import { CONTACT_INFO } from "@/lib/constants";
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
        if (isNaN(numValue)) return "text-foreground";

        const numMin = min ? parseFloat(min) : null;
        const numMax = max ? parseFloat(max) : null;

        if (numMin !== null && numValue < numMin) return "text-primary font-semibold";
        if (numMax !== null && numValue > numMax) return "text-destructive font-semibold";
        if (numMin !== null || numMax !== null) return "text-primary";

        return "text-foreground";
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
            <div className="min-h-screen bg-background py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <Card className="card-elevated">
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-muted">
                                        <Image
                                            src="/icon.png"
                                            alt="Logo Laboratorio"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-medium text-foreground">
                                            {CONTACT_INFO.appName}
                                        </h1>
                                        <p className="text-sm text-muted-foreground">{CONTACT_INFO.address}</p>
                                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                                            Tel: {CONTACT_INFO.phone}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 items-center">
                                    <Badge className="h-10 px-4">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Resultados Verificados
                                    </Badge>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="h-10"
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
                    <Card className="card-elevated">
                        <CardHeader>
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-muted">
                                    <User className="h-4 w-4" />
                                </div>
                                Información del Paciente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Nombre</p>
                                <p className="text-foreground font-medium">{getNombreCompleto(resultado.paciente)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Folio</p>
                                <Badge variant="outline" className="font-mono">
                                    {resultado.paciente.folio}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Fecha de Emisión</p>
                                <p className="text-muted-foreground">{formatDate(resultado.fechaEmision)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Válido hasta</p>
                                <p className="text-muted-foreground">{formatDate(resultado.fechaExpiracion)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Studies */}
                    {resultado.estudios.map((estudio, idx) => (
                        <Card key={idx} className="card-elevated">
                            <CardHeader className="bg-primary/5 border-b border-border">
                                <CardTitle className="text-foreground">{estudio.nombreEstudio}</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    <Calendar className="inline h-4 w-4 mr-1" />
                                    Realizado: {formatDate(estudio.fechaRealizacion)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border hover:bg-transparent">
                                            <TableHead className="text-muted-foreground">Parámetro</TableHead>
                                            <TableHead className="text-muted-foreground">Resultado</TableHead>
                                            <TableHead className="text-muted-foreground">Unidad</TableHead>
                                            <TableHead className="text-muted-foreground">Referencia</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {estudio.parametros.map((param, pIdx) => (
                                            <TableRow key={pIdx} className="border-border">
                                                <TableCell className="text-foreground font-medium">
                                                    {param.nombreParametro}
                                                </TableCell>
                                                <TableCell className={getValueColor(param.valor, param.valorRefMin, param.valorRefMax)}>
                                                    {param.valor}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{param.unidad}</TableCell>
                                                <TableCell className="text-muted-foreground/70">
                                                    {getReferenceText(param.valorRefMin, param.valorRefMax)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {estudio.observaciones && (
                                    <div className="p-4 bg-amber-500/10 border-t border-border">
                                        <p className="text-sm text-amber-600 dark:text-amber-400">
                                            <strong>Observaciones:</strong> {estudio.observaciones}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {/* Legend */}
                    <Card className="card-elevated">
                        <CardContent className="py-4">
                            <div className="flex flex-wrap gap-4 justify-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary" />
                                    <span className="text-muted-foreground">Normal</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-destructive" />
                                    <span className="text-muted-foreground">Alto</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary" />
                                    <span className="text-muted-foreground">Bajo</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="space-y-2 text-center">
                        <div className="text-sm text-muted-foreground">
                            <ShieldCheck className="inline h-4 w-4 mr-1" />
                            Este resultado es verificado y emitido por {resultado.laboratorio.nombre}
                        </div>
                        <div className="text-xs text-muted-foreground/70">
                            <p>AV. BENITO JUAREZ No. 3 COL CENTRO TLAHUELILPAN. HGO</p>
                            <p className="mt-1">
                                Tel: 763 788 0910 • Urgencias: 773 124 5856
                            </p>
                        </div>
                    </div>
                </div>
            </div >
        );
    }

    // Show validation form with animated background
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Animated Geometric Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-muted/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute top-[60%] right-[10%] w-96 h-96 bg-muted/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute bottom-[20%] left-[20%] w-64 h-64 bg-muted/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute top-[15%] right-[15%] w-20 h-20 border border-border/50 rotate-45" />
                <div className="absolute bottom-[25%] left-[10%] w-16 h-16 border border-border/40 rounded-full" />
            </div>

            <Card className="w-full max-w-md card-elevated backdrop-blur-sm relative z-10">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg relative overflow-hidden shadow-lg">
                        <Image
                            src="/icon.png"
                            alt="Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-medium text-foreground">
                            Consulta de Resultados
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Ingresa tu folio para ver tus resultados
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="folio" className="text-foreground">
                                Folio del Paciente
                            </Label>
                            <Input
                                id="folio"
                                placeholder="Ingresa tu folio"
                                {...register("folio")}
                                disabled={isLoading}
                            />
                            {errors.folio && (
                                <p className="text-sm text-destructive">{errors.folio.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
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

