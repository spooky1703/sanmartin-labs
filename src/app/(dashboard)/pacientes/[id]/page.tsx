import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Edit,
    User,
    Phone,
    Mail,
    Calendar,
    ClipboardList,
    FileText,
    Plus,
} from "lucide-react";
import { formatDate, calculateAge } from "@/lib/utils";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PacienteDetailPage({ params }: PageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;

    const paciente = await prisma.paciente.findFirst({
        where: {
            id,
            laboratorioId: session.user.laboratorioId,
        },
        include: {
            estudios: {
                orderBy: { fechaRealizacion: "desc" },
                include: {
                    parametros: { orderBy: { orden: "asc" } },
                },
            },
            reportes: {
                orderBy: { fechaEmision: "desc" },
                take: 5,
            },
        },
    });

    if (!paciente) {
        notFound();
    }

    const getNombreCompleto = () => {
        return `${paciente.nombre} ${paciente.apellidoPaterno} ${paciente.apellidoMaterno || ""}`.trim();
    };

    const getGeneroLabel = () => {
        switch (paciente.genero) {
            case "M":
                return "Masculino";
            case "F":
                return "Femenino";
            case "O":
                return "Otro";
            default:
                return "No especificado";
        }
    };

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
                        <Link href="/pacientes">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-light text-foreground flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-muted">
                                <User className="h-5 w-5" />
                            </div>
                            {getNombreCompleto()}
                        </h1>
                        <Badge
                            variant="outline"
                            className="mt-1 font-mono"
                        >
                            Folio: {paciente.folio}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        asChild
                    >
                        <a href={`/pacientes/${id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </a>
                    </Button>
                    <Button
                        variant="outline"
                        asChild
                    >
                        <Link href={`/pacientes/${id}/estudios/nuevo`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Estudio
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/reportes/nuevo?pacienteId=${id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Emitir Reporte
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Patient Info */}
                <Card className="card-elevated lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center justify-between">
                            Información Personal
                            <a href={`/pacientes/${id}/editar`}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </a>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-foreground">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Fecha de Nacimiento</p>
                                <p>
                                    {paciente.fechaNacimiento
                                        ? `${formatDate(paciente.fechaNacimiento)} (${calculateAge(paciente.fechaNacimiento)} años)`
                                        : "No especificada"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-foreground">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Género</p>
                                <p>{getGeneroLabel()}</p>
                            </div>
                        </div>

                        {paciente.telefono && (
                            <div className="flex items-center gap-3 text-foreground">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Teléfono</p>
                                    <p>{paciente.telefono}</p>
                                </div>
                            </div>
                        )}

                        {paciente.email && (
                            <div className="flex items-center gap-3 text-foreground">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p>{paciente.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-border">
                            <p className="text-xs text-muted-foreground">Registrado</p>
                            <p className="text-foreground">{formatDate(paciente.createdAt)}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Studies */}
                <Card className="card-elevated lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-muted">
                                <ClipboardList className="h-4 w-4" />
                            </div>
                            Estudios Clínicos
                            <Badge variant="secondary" className="ml-2">
                                {paciente.estudios.length}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {paciente.estudios.length === 0 ? (
                            <div className="text-center py-8">
                                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">No hay estudios registrados</p>
                                <Button
                                    variant="outline"
                                    asChild
                                    className="mt-4"
                                >
                                    <Link href={`/pacientes/${id}/estudios/nuevo`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Agregar Estudio
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {paciente.estudios.map((estudio: any) => (
                                    <div
                                        key={estudio.id}
                                        className="p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-foreground">
                                                    {estudio.nombreEstudio}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(estudio.fechaRealizacion)}
                                                </p>
                                            </div>
                                            <Badge variant="outline">
                                                {estudio.parametros.length} parámetros
                                            </Badge>
                                        </div>
                                        {estudio.observaciones && (
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {estudio.observaciones}
                                            </p>
                                        )}

                                        {/* Parameters Preview */}
                                        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {estudio.parametros.slice(0, 6).map((param: any) => (
                                                <div
                                                    key={param.id}
                                                    className="text-xs bg-background px-2 py-1 rounded border border-border"
                                                >
                                                    <span className="text-muted-foreground">{param.nombreParametro}:</span>
                                                    <span className="ml-1 text-foreground">{param.valor}</span>
                                                    <span className="text-muted-foreground/70 ml-1">{param.unidad}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

