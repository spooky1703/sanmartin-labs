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
                <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                    Invalidado
                </Badge>
            );
        }
        if (isReportExpired(reporte.fechaExpiracion)) {
            return (
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Expirado
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                Vigente
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-light text-foreground flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                            <FileText className="h-6 w-6" />
                        </div>
                        Reportes
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {total} reporte{total !== 1 ? "s" : ""} emitido{total !== 1 ? "s" : ""}
                    </p>
                </div>
                {["ADMIN", "SUPERVISOR"].includes(session.user.rol) && (
                    <Button asChild>
                        <Link href="/reportes/nuevo">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Reporte
                        </Link>
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground">Paciente</TableHead>
                            <TableHead className="text-muted-foreground hidden md:table-cell">Estudios</TableHead>
                            <TableHead className="text-muted-foreground hidden md:table-cell">Fecha</TableHead>
                            <TableHead className="text-muted-foreground">Estado</TableHead>
                            <TableHead className="text-muted-foreground hidden lg:table-cell">Emitido por</TableHead>
                            <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportes.map((reporte: any) => (
                            <TableRow key={reporte.id} className="border-border hover:bg-muted/50">
                                <TableCell>
                                    <div>
                                        <p className="text-foreground font-medium">
                                            {reporte.paciente.nombre} {reporte.paciente.apellidoPaterno}
                                        </p>
                                        <Badge
                                            variant="outline"
                                            className="font-mono text-xs"
                                        >
                                            {reporte.paciente.folio}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground hidden md:table-cell">
                                    {reporte._count.estudios} estudio{reporte._count.estudios !== 1 ? "s" : ""}
                                </TableCell>
                                <TableCell className="text-muted-foreground hidden md:table-cell">
                                    {formatDate(reporte.fechaEmision)}
                                </TableCell>
                                <TableCell>{getStatusBadge(reporte)}</TableCell>
                                <TableCell className="text-muted-foreground hidden lg:table-cell">
                                    {reporte.usuario.nombre} {reporte.usuario.apellido}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <Link href={`/reportes/${reporte.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                            className="text-muted-foreground hover:text-foreground"
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
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-lg">No hay reportes emitidos</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {page > 1 && (
                        <Button variant="outline" asChild>
                            <Link href={`/reportes?page=${page - 1}`}>Anterior</Link>
                        </Button>
                    )}
                    <span className="flex items-center px-4 text-muted-foreground">
                        Página {page} de {totalPages}
                    </span>
                    {page < totalPages && (
                        <Button variant="outline" asChild>
                            <Link href={`/reportes?page=${page + 1}`}>Siguiente</Link>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

