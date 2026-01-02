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
                        className="text-slate-400 hover:text-white"
                    >
                        <Link href="/pacientes">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <User className="h-6 w-6 text-emerald-500" />
                            {getNombreCompleto()}
                        </h1>
                        <Badge
                            variant="outline"
                            className="mt-1 font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                        >
                            Folio: {paciente.folio}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        asChild
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    >
                        <a href={`/pacientes/${id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </a>
                    </Button>
                    <Button
                        variant="outline"
                        asChild
                        className="border-slate-700 hover:bg-slate-800"
                    >
                        <Link href={`/pacientes/${id}/estudios/nuevo`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Estudio
                        </Link>
                    </Button>
                    <Button
                        asChild
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                        <Link href={`/reportes/nuevo?pacienteId=${id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Emitir Reporte
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Patient Info */}
                <Card className="bg-slate-900 border-slate-800 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                            Información Personal
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-white"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-300">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <div>
                                <p className="text-xs text-slate-500">Fecha de Nacimiento</p>
                                <p>
                                    {paciente.fechaNacimiento
                                        ? `${formatDate(paciente.fechaNacimiento)} (${calculateAge(paciente.fechaNacimiento)} años)`
                                        : "No especificada"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-300">
                            <User className="h-4 w-4 text-slate-500" />
                            <div>
                                <p className="text-xs text-slate-500">Género</p>
                                <p>{getGeneroLabel()}</p>
                            </div>
                        </div>

                        {paciente.telefono && (
                            <div className="flex items-center gap-3 text-slate-300">
                                <Phone className="h-4 w-4 text-slate-500" />
                                <div>
                                    <p className="text-xs text-slate-500">Teléfono</p>
                                    <p>{paciente.telefono}</p>
                                </div>
                            </div>
                        )}

                        {paciente.email && (
                            <div className="flex items-center gap-3 text-slate-300">
                                <Mail className="h-4 w-4 text-slate-500" />
                                <div>
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p>{paciente.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-800">
                            <p className="text-xs text-slate-500">Registrado</p>
                            <p className="text-slate-300">{formatDate(paciente.createdAt)}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Studies */}
                <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-blue-500" />
                            Estudios Clínicos
                            <Badge variant="secondary" className="ml-2">
                                {paciente.estudios.length}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {paciente.estudios.length === 0 ? (
                            <div className="text-center py-8">
                                <ClipboardList className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                                <p className="text-slate-400">No hay estudios registrados</p>
                                <Button
                                    variant="outline"
                                    asChild
                                    className="mt-4 border-slate-700"
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
                                        className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-white">
                                                    {estudio.nombreEstudio}
                                                </h3>
                                                <p className="text-sm text-slate-400">
                                                    {formatDate(estudio.fechaRealizacion)}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-slate-400 border-slate-600">
                                                {estudio.parametros.length} parámetros
                                            </Badge>
                                        </div>
                                        {estudio.observaciones && (
                                            <p className="mt-2 text-sm text-slate-400">
                                                {estudio.observaciones}
                                            </p>
                                        )}

                                        {/* Parameters Preview */}
                                        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {estudio.parametros.slice(0, 6).map((param: any) => (
                                                <div
                                                    key={param.id}
                                                    className="text-xs bg-slate-900 px-2 py-1 rounded"
                                                >
                                                    <span className="text-slate-500">{param.nombreParametro}:</span>
                                                    <span className="ml-1 text-white">{param.valor}</span>
                                                    <span className="text-slate-600 ml-1">{param.unidad}</span>
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
