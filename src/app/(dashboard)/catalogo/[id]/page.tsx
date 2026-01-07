import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Beaker } from "lucide-react";

async function getEstudio(id: string) {
    return prisma.catalogoEstudio.findUnique({
        where: { id },
        include: {
            parametros: {
                orderBy: { orden: "asc" }
            },
            _count: {
                select: { estudios: true }
            }
        }
    });
}

export default async function CatalogoDetallePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;
    const estudio = await getEstudio(id);

    if (!estudio) {
        notFound();
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-muted-foreground hover:text-foreground"
                >
                    <Link href="/catalogo">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-light text-foreground">
                            {estudio.nombre}
                        </h1>
                        {estudio.categoria && (
                            <Badge variant="outline">{estudio.categoria}</Badge>
                        )}
                    </div>
                    {estudio.descripcion && (
                        <p className="text-muted-foreground mt-1">{estudio.descripcion}</p>
                    )}
                </div>
                <Button variant="outline" asChild>
                    <Link href={`/catalogo/${id}/editar`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="card-elevated">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                                <Beaker className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-foreground">
                                    {estudio.parametros.length}
                                </p>
                                <p className="text-sm text-muted-foreground">Parámetros definidos</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="card-elevated">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-green-500/10">
                                <Beaker className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-foreground">
                                    {estudio._count.estudios}
                                </p>
                                <p className="text-sm text-muted-foreground">Estudios realizados</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Parameters Table */}
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle>Parámetros del Estudio</CardTitle>
                    <CardDescription>
                        Lista de parámetros con sus rangos de referencia para hombres y mujeres
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                                        #
                                    </th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                                        Parámetro
                                    </th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                                        Unidad
                                    </th>
                                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">
                                        Rango Hombres
                                    </th>
                                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">
                                        Rango Mujeres
                                    </th>
                                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">
                                        Valores Críticos
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {estudio.parametros.map((param, index) => (
                                    <tr key={param.id} className="border-b border-border/50 hover:bg-muted/30">
                                        <td className="py-3 px-2 text-sm text-muted-foreground">
                                            {index + 1}
                                        </td>
                                        <td className="py-3 px-2 font-medium text-foreground">
                                            {param.nombre}
                                        </td>
                                        <td className="py-3 px-2 text-sm text-muted-foreground">
                                            {param.unidad || "-"}
                                        </td>
                                        <td className="py-3 px-2 text-sm text-center">
                                            {param.valorRefMinH && param.valorRefMaxH ? (
                                                <span className="text-foreground">
                                                    {param.valorRefMinH} - {param.valorRefMaxH}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-2 text-sm text-center">
                                            {param.valorRefMinM && param.valorRefMaxM ? (
                                                <span className="text-foreground">
                                                    {param.valorRefMinM} - {param.valorRefMaxM}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-2 text-sm text-center">
                                            {param.valorCriticoMin || param.valorCriticoMax ? (
                                                <span className="text-red-500">
                                                    {param.valorCriticoMin ? `<${param.valorCriticoMin}` : ""}
                                                    {param.valorCriticoMin && param.valorCriticoMax ? " / " : ""}
                                                    {param.valorCriticoMax ? `>${param.valorCriticoMax}` : ""}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
