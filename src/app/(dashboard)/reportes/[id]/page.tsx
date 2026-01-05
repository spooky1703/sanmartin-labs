import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    ArrowLeft,
    FileText,
    Download,
    User,
    Calendar,
    QrCode,
    Clock,
    CheckCircle,
    XCircle,
    Mail,
    MessageCircle,
} from "lucide-react";
import { formatDate, isReportExpired } from "@/lib/utils";
import { PrintButton } from "@/components/reportes/PrintButton";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ReporteDetailPage({ params }: PageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;

    const reporte = await prisma.reporte.findFirst({
        where: {
            id,
            laboratorioId: session.user.laboratorioId,
        },
        include: {
            paciente: true,
            laboratorio: true,
            usuario: {
                select: { id: true, nombre: true, apellido: true },
            },
            estudios: {
                include: {
                    estudio: {
                        include: {
                            parametros: { orderBy: { orden: "asc" } },
                        },
                    },
                },
            },
        },
    });

    if (!reporte) {
        notFound();
    }

    const getNombreCompleto = () => {
        return `${reporte.paciente.nombre} ${reporte.paciente.apellidoPaterno} ${reporte.paciente.apellidoMaterno || ""}`.trim();
    };

    const isExpired = isReportExpired(reporte.fechaExpiracion);
    const isValid = reporte.vigente && !isExpired;

    const getStatusBadge = () => {
        if (!reporte.vigente) {
            return (
                <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    Invalidado
                </Badge>
            );
        }
        if (isExpired) {
            return (
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Clock className="mr-1 h-3 w-3" />
                    Expirado
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                <CheckCircle className="mr-1 h-3 w-3" />
                Vigente
            </Badge>
        );
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

    const consultaUrl = `/consulta/${reporte.codigoAcceso}`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Link href="/reportes">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-light text-foreground flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-muted">
                                <FileText className="h-5 w-5" />
                            </div>
                            Reporte de Resultados
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge()}
                            <span className="text-muted-foreground text-sm">
                                Código: {reporte.codigoAcceso}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <PrintButton pdfUrl={`/api/reportes/${reporte.id}/pdf`} />
                    <Button asChild>
                        <a href={`/api/reportes/${reporte.id}/pdf`} target="_blank">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </a>
                    </Button>
                    {reporte.paciente.email && (
                        <Button
                            asChild
                            variant="outline"
                        >
                            <a
                                href={`mailto:${reporte.paciente.email}?subject=${encodeURIComponent(`Resultados de Laboratorio - ${reporte.laboratorio.nombre}`)}&body=${encodeURIComponent(`Estimado(a) ${getNombreCompleto()},\n\nLe informamos que sus resultados de laboratorio están listos.\n\n📋 Folio: ${reporte.paciente.folio}\n\nPuede consultar y descargar sus resultados en línea en el siguiente enlace:\n${process.env.NEXTAUTH_URL || 'https://sanmartin-labs-production.up.railway.app'}${consultaUrl}\n\nPara acceder, necesitará su número de folio: ${reporte.paciente.folio}\n\nSaludos cordiales,\n${reporte.laboratorio.nombre}`)}`}
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                Email
                            </a>
                        </Button>
                    )}
                    {reporte.paciente.telefono && (
                        <Button
                            asChild
                            variant="outline"
                            className="border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/10"
                        >
                            <a
                                href={`https://wa.me/${reporte.paciente.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(`🔬 *${reporte.laboratorio.nombre}*\n\nEstimado(a) ${getNombreCompleto()},\n\nSus resultados de laboratorio están listos.\n\n📋 *Folio:* ${reporte.paciente.folio}\n\n🔗 *Consultar resultados:*\n${process.env.NEXTAUTH_URL || 'https://sanmartin-labs-production.up.railway.app'}${consultaUrl}\n\nPara acceder necesita su folio: *${reporte.paciente.folio}*`)}`}
                                target="_blank"
                            >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                WhatsApp
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Patient & Report Info */}
                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-muted">
                                <User className="h-4 w-4" />
                            </div>
                            Información del Paciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Nombre</p>
                            <p className="text-foreground font-medium">{getNombreCompleto()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Folio</p>
                            <Badge
                                variant="outline"
                                className="font-mono"
                            >
                                {reporte.paciente.folio}
                            </Badge>
                        </div>
                        <div className="pt-4 border-t border-border">
                            <p className="text-xs text-muted-foreground">Fecha de Emisión</p>
                            <p className="text-muted-foreground">{formatDate(reporte.fechaEmision)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Válido hasta</p>
                            <p className={isExpired ? "text-destructive" : "text-muted-foreground"}>
                                {formatDate(reporte.fechaExpiracion)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Emitido por</p>
                            <p className="text-muted-foreground">
                                {reporte.usuario.nombre} {reporte.usuario.apellido}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* QR Code Info */}
                <Card className="card-elevated lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-muted">
                                <QrCode className="h-4 w-4" />
                            </div>
                            Consulta en Línea
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground mb-2">
                                    El paciente puede consultar sus resultados en línea usando:
                                </p>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">URL de consulta</p>
                                        <code className="text-primary text-sm break-all">
                                            {typeof window !== "undefined" ? window.location.origin : ""}{consultaUrl}
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Folio para validación</p>
                                        <code className="text-foreground">{reporte.paciente.folio}</code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Studies */}
            {reporte.estudios.map((re: any, idx: number) => (
                <Card key={idx} className="card-elevated">
                    <CardHeader className="bg-primary/5 border-b border-border">
                        <CardTitle className="text-foreground flex items-center justify-between">
                            <span>{re.estudio.nombreEstudio}</span>
                            <Badge variant="outline" className="text-muted-foreground">
                                <Calendar className="mr-1 h-3 w-3" />
                                {formatDate(re.estudio.fechaRealizacion)}
                            </Badge>
                        </CardTitle>
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
                                {re.estudio.parametros.map((param: any, pIdx: number) => (
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
                        {re.estudio.observaciones && (
                            <div className="p-4 bg-amber-500/10 border-t border-border">
                                <p className="text-sm text-amber-600 dark:text-amber-400">
                                    <strong>Observaciones:</strong> {re.estudio.observaciones}
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
        </div>
    );
}

