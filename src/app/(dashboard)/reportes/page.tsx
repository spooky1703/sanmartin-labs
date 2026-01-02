import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FileText, Plus, Download, Eye, QrCode } from "lucide-react";
import { formatDate, isReportExpired } from "@/lib/utils";

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function ReportesPage({ searchParams }: PageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const [reportes, total] = await Promise.all([
        prisma.reporte.findMany({
            where: { laboratorioId: session.user.laboratorioId },
            orderBy: { fechaEmision: "desc" },
            skip,
            take: limit,
            include: {
                paciente: {
                    select: {
                        id: true,
                        folio: true,
                        nombre: true,
                        apellidoPaterno: true,
                    },
                },
                usuario: {
                    select: { nombre: true, apellido: true },
                },
                _count: { select: { estudios: true } },
            },
        }),
        prisma.reporte.count({ where: { laboratorioId: session.user.laboratorioId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const getStatusBadge = (reporte: typeof reportes[0]) => {
        if (!reporte.vigente) {
            return (
                <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400">
                    Invalidado
                </Badge>
            );
        }
        if (isReportExpired(reporte.fechaExpiracion)) {
            return (
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                    Expirado
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400">
                Vigente
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FileText className="h-8 w-8 text-purple-500" />
                        Reportes
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {total} reporte{total !== 1 ? "s" : ""} emitido{total !== 1 ? "s" : ""}
                    </p>
                </div>
                {["ADMIN", "SUPERVISOR"].includes(session.user.rol) && (
                    <Button
                        asChild
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    >
                        <Link href="/reportes/nuevo">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Reporte
                        </Link>
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="rounded-lg border border-slate-800 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-400">Paciente</TableHead>
                            <TableHead className="text-slate-400 hidden md:table-cell">Estudios</TableHead>
                            <TableHead className="text-slate-400 hidden md:table-cell">Fecha</TableHead>
                            <TableHead className="text-slate-400">Estado</TableHead>
                            <TableHead className="text-slate-400 hidden lg:table-cell">Emitido por</TableHead>
                            <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportes.map((reporte: any) => (
                            <TableRow key={reporte.id} className="border-slate-800 hover:bg-slate-900/50">
                                <TableCell>
                                    <div>
                                        <p className="text-white font-medium">
                                            {reporte.paciente.nombre} {reporte.paciente.apellidoPaterno}
                                        </p>
                                        <Badge
                                            variant="outline"
                                            className="font-mono text-xs text-blue-400 border-blue-500/30 bg-blue-500/10"
                                        >
                                            {reporte.paciente.folio}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-400 hidden md:table-cell">
                                    {reporte._count.estudios} estudio{reporte._count.estudios !== 1 ? "s" : ""}
                                </TableCell>
                                <TableCell className="text-slate-400 hidden md:table-cell">
                                    {formatDate(reporte.fechaEmision)}
                                </TableCell>
                                <TableCell>{getStatusBadge(reporte)}</TableCell>
                                <TableCell className="text-slate-400 hidden lg:table-cell">
                                    {reporte.usuario.nombre} {reporte.usuario.apellido}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                                        >
                                            <Link href={`/reportes/${reporte.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                                        >
                                            <a href={`/api/reportes/${reporte.id}/pdf`} target="_blank">
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {reportes.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400 text-lg">No hay reportes emitidos</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {page > 1 && (
                        <Button variant="outline" asChild className="border-slate-700 hover:bg-slate-800">
                            <Link href={`/reportes?page=${page - 1}`}>Anterior</Link>
                        </Button>
                    )}
                    <span className="flex items-center px-4 text-slate-400">
                        Página {page} de {totalPages}
                    </span>
                    {page < totalPages && (
                        <Button variant="outline" asChild className="border-slate-700 hover:bg-slate-800">
                            <Link href={`/reportes?page=${page + 1}`}>Siguiente</Link>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
