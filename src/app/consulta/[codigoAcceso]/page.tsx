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
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Base gradient mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

            {/* Aurora effect - large ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Primary aurora waves */}
                <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-full blur-[120px] animate-aurora-1" />
                <div className="absolute -bottom-[30%] -right-[20%] w-[70%] h-[70%] bg-gradient-to-tl from-primary/15 via-muted/10 to-transparent rounded-full blur-[100px] animate-aurora-2" />
                <div className="absolute top-[20%] -right-[10%] w-[50%] h-[60%] bg-gradient-to-bl from-muted/20 via-primary/8 to-transparent rounded-full blur-[80px] animate-aurora-3" />

                {/* Secondary ambient glow */}
                <div className="absolute top-[50%] left-[30%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-glow" />
            </div>

            {/* Geometric elements layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating orbs with glass effect */}
                <div className="absolute top-[8%] left-[8%] w-32 h-32 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm animate-float-orbit-1" />
                <div className="absolute bottom-[12%] right-[12%] w-24 h-24 rounded-full border border-muted-foreground/15 bg-muted/10 backdrop-blur-sm animate-float-orbit-2" />
                <div className="absolute top-[60%] left-[5%] w-20 h-20 rounded-full bg-gradient-to-br from-primary/15 to-transparent animate-float-orbit-3" />

                {/* Elegant rotating frames */}
                <div className="absolute top-[15%] right-[10%] w-40 h-40">
                    <div className="absolute inset-0 border-2 border-primary/15 rotate-45 animate-spin-elegant" />
                    <div className="absolute inset-4 border border-muted-foreground/10 rotate-45 animate-spin-elegant-reverse" />
                </div>

                <div className="absolute bottom-[20%] left-[12%] w-32 h-32">
                    <div className="absolute inset-0 border-2 border-muted-foreground/15 rotate-12 animate-spin-elegant" />
                    <div className="absolute inset-3 border border-primary/10 rotate-12 animate-spin-elegant-reverse" />
                </div>

                {/* Floating diamonds */}
                <div className="absolute top-[35%] right-[25%] w-8 h-8 bg-gradient-to-br from-primary/25 to-primary/5 rotate-45 animate-float-diamond" />
                <div className="absolute bottom-[40%] left-[20%] w-6 h-6 bg-gradient-to-tl from-muted-foreground/20 to-transparent rotate-45 animate-float-diamond-delay" />
                <div className="absolute top-[70%] right-[35%] w-4 h-4 bg-primary/30 rotate-45 animate-float-diamond" />

                {/* Glowing dots constellation */}
                <div className="absolute top-[25%] left-[35%] w-2 h-2 bg-primary/50 rounded-full animate-twinkle" />
                <div className="absolute top-[28%] left-[38%] w-1.5 h-1.5 bg-primary/40 rounded-full animate-twinkle-delay" />
                <div className="absolute top-[30%] left-[33%] w-1 h-1 bg-primary/60 rounded-full animate-twinkle" />

                <div className="absolute bottom-[35%] right-[28%] w-2 h-2 bg-muted-foreground/40 rounded-full animate-twinkle-delay" />
                <div className="absolute bottom-[32%] right-[32%] w-1.5 h-1.5 bg-primary/35 rounded-full animate-twinkle" />
                <div className="absolute bottom-[38%] right-[25%] w-1 h-1 bg-muted-foreground/50 rounded-full animate-twinkle-delay" />

                {/* Elegant lines */}
                <div className="absolute top-[45%] left-0 w-[20%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-line-slide" />
                <div className="absolute top-[55%] right-0 w-[25%] h-px bg-gradient-to-l from-transparent via-muted-foreground/15 to-transparent animate-line-slide-delay" />

                {/* Corner accents */}
                <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-primary/15 animate-corner-pulse" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-primary/15 animate-corner-pulse-delay" />
            </div>

            <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl relative z-10">
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

            {/* Animation styles */}
            <style jsx>{`
                @keyframes aurora-1 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
                    33% { transform: translate(5%, 3%) scale(1.05); opacity: 0.8; }
                    66% { transform: translate(-3%, 5%) scale(0.95); opacity: 0.5; }
                }
                @keyframes aurora-2 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
                    50% { transform: translate(-5%, -3%) scale(1.1); opacity: 0.7; }
                }
                @keyframes aurora-3 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.4; }
                    50% { transform: translate(3%, 5%) rotate(5deg); opacity: 0.6; }
                }
                @keyframes glow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.2); }
                }
                @keyframes float-orbit-1 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(20px, -30px) rotate(5deg); }
                    50% { transform: translate(40px, -10px) rotate(0deg); }
                    75% { transform: translate(20px, 20px) rotate(-5deg); }
                }
                @keyframes float-orbit-2 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(-30px, 20px) rotate(-8deg); }
                    66% { transform: translate(-15px, -25px) rotate(5deg); }
                }
                @keyframes float-orbit-3 {
                    0%, 100% { transform: translate(0, 0); opacity: 0.4; }
                    50% { transform: translate(25px, -35px); opacity: 0.7; }
                }
                @keyframes spin-elegant {
                    from { transform: rotate(45deg); }
                    to { transform: rotate(405deg); }
                }
                @keyframes spin-elegant-reverse {
                    from { transform: rotate(45deg); }
                    to { transform: rotate(-315deg); }
                }
                @keyframes float-diamond {
                    0%, 100% { transform: rotate(45deg) translateY(0); opacity: 0.5; }
                    50% { transform: rotate(45deg) translateY(-20px); opacity: 0.9; }
                }
                @keyframes float-diamond-delay {
                    0%, 100% { transform: rotate(45deg) translateY(0); opacity: 0.4; }
                    50% { transform: rotate(45deg) translateY(-15px); opacity: 0.8; }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.5); }
                }
                @keyframes twinkle-delay {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.2; transform: scale(0.8); }
                }
                @keyframes line-slide {
                    0%, 100% { opacity: 0; transform: translateX(-100%); }
                    50% { opacity: 1; transform: translateX(100%); }
                }
                @keyframes line-slide-delay {
                    0%, 100% { opacity: 0; transform: translateX(100%); }
                    50% { opacity: 1; transform: translateX(-100%); }
                }
                @keyframes corner-pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.8; }
                }
                @keyframes corner-pulse-delay {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.2; }
                }
                .animate-aurora-1 { animation: aurora-1 15s ease-in-out infinite; }
                .animate-aurora-2 { animation: aurora-2 12s ease-in-out infinite; }
                .animate-aurora-3 { animation: aurora-3 18s ease-in-out infinite; }
                .animate-glow { animation: glow 8s ease-in-out infinite; }
                .animate-float-orbit-1 { animation: float-orbit-1 12s ease-in-out infinite; }
                .animate-float-orbit-2 { animation: float-orbit-2 10s ease-in-out infinite; }
                .animate-float-orbit-3 { animation: float-orbit-3 8s ease-in-out infinite; }
                .animate-spin-elegant { animation: spin-elegant 30s linear infinite; }
                .animate-spin-elegant-reverse { animation: spin-elegant-reverse 25s linear infinite; }
                .animate-float-diamond { animation: float-diamond 4s ease-in-out infinite; }
                .animate-float-diamond-delay { animation: float-diamond-delay 5s ease-in-out infinite 0.5s; }
                .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
                .animate-twinkle-delay { animation: twinkle-delay 3s ease-in-out infinite 1s; }
                .animate-line-slide { animation: line-slide 8s ease-in-out infinite; }
                .animate-line-slide-delay { animation: line-slide-delay 10s ease-in-out infinite 2s; }
                .animate-corner-pulse { animation: corner-pulse 4s ease-in-out infinite; }
                .animate-corner-pulse-delay { animation: corner-pulse-delay 4s ease-in-out infinite 2s; }
            `}</style>
        </div>
    );
}



