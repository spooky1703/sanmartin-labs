import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PacientesList } from "@/components/pacientes/PacientesList";
import { UserPlus, Search, Users } from "lucide-react";

interface PageProps {
    searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function PacientesPage({ searchParams }: PageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const params = await searchParams;
    const search = params.search || "";
    const page = parseInt(params.page || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const where = {
        laboratorioId: session.user.laboratorioId,
        ...(search && {
            OR: [
                { folio: { contains: search, mode: "insensitive" as const } },
                { nombre: { contains: search, mode: "insensitive" as const } },
                { apellidoPaterno: { contains: search, mode: "insensitive" as const } },
                { apellidoMaterno: { contains: search, mode: "insensitive" as const } },
            ],
        }),
    };

    const [pacientes, total] = await Promise.all([
        prisma.paciente.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
                _count: {
                    select: { estudios: true, reportes: true },
                },
            },
        }),
        prisma.paciente.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-light text-foreground flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                            <Users className="h-5 w-5" />
                        </div>
                        Pacientes
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {total} paciente{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
                    </p>
                </div>
                <Button asChild>
                    <Link href="/pacientes/nuevo">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Nuevo Paciente
                    </Link>
                </Button>
            </div>

            {/* Search */}
            <Card className="card-elevated">
                <CardContent className="pt-6">
                    <form className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                name="search"
                                placeholder="Buscar por folio, nombre o apellido..."
                                defaultValue={search}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Buscar
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* List */}
            <PacientesList pacientes={pacientes} />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {page > 1 && (
                        <Button variant="outline" asChild>
                            <Link href={`/pacientes?search=${search}&page=${page - 1}`}>
                                Anterior
                            </Link>
                        </Button>
                    )}
                    <span className="flex items-center px-4 text-muted-foreground">
                        Página {page} de {totalPages}
                    </span>
                    {page < totalPages && (
                        <Button variant="outline" asChild>
                            <Link href={`/pacientes?search=${search}&page=${page + 1}`}>
                                Siguiente
                            </Link>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

