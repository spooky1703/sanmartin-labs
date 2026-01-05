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
import { ClipboardList, Eye, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function EstudiosPage({ searchParams }: PageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const [estudios, total] = await Promise.all([
        prisma.estudio.findMany({
            where: {
                paciente: {
                    laboratorioId: session.user.laboratorioId,
                },
            },
            orderBy: { fechaRealizacion: "desc" },
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
                _count: { select: { parametros: true } },
            },
        }),
        prisma.estudio.count({
            where: {
                paciente: {
                    laboratorioId: session.user.laboratorioId,
                },
            },
        }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-light text-foreground flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                            <ClipboardList className="h-6 w-6" />
                        </div>
                        Estudios
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {total} estudio{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground">Estudio</TableHead>
                            <TableHead className="text-muted-foreground">Paciente</TableHead>
                            <TableHead className="text-muted-foreground hidden md:table-cell">Fecha</TableHead>
                            <TableHead className="text-muted-foreground hidden md:table-cell">Parámetros</TableHead>
                            <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {estudios.map((estudio: any) => (
                            <TableRow key={estudio.id} className="border-border hover:bg-muted/50">
                                <TableCell>
                                    <p className="text-foreground font-medium">{estudio.nombreEstudio}</p>
                                    {estudio.observaciones && (
                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                            {estudio.observaciones}
                                        </p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-foreground">
                                                {estudio.paciente.nombre} {estudio.paciente.apellidoPaterno}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className="font-mono text-xs"
                                            >
                                                {estudio.paciente.folio}
                                            </Badge>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground hidden md:table-cell">
                                    {formatDate(estudio.fechaRealizacion)}
                                </TableCell>
                                <TableCell className="text-muted-foreground hidden md:table-cell">
                                    {estudio._count.parametros} parámetro{estudio._count.parametros !== 1 ? "s" : ""}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <Link href={`/pacientes/${estudio.paciente.id}`}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {estudios.length === 0 && (
                <div className="text-center py-12">
                    <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-lg">No hay estudios registrados</p>
                    <p className="text-muted-foreground/70 text-sm mt-1">
                        Los estudios se crean desde el perfil de cada paciente
                    </p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {page > 1 && (
                        <Button variant="outline" asChild>
                            <Link href={`/estudios?page=${page - 1}`}>Anterior</Link>
                        </Button>
                    )}
                    <span className="flex items-center px-4 text-muted-foreground">
                        Página {page} de {totalPages}
                    </span>
                    {page < totalPages && (
                        <Button variant="outline" asChild>
                            <Link href={`/estudios?page=${page + 1}`}>Siguiente</Link>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

