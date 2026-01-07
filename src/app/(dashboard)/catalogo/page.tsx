import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Beaker, ChevronRight } from "lucide-react";

async function getCatalogo() {
    const catalogo = await prisma.catalogoEstudio.findMany({
        where: { activo: true },
        orderBy: [
            { categoria: "asc" },
            { nombre: "asc" },
        ],
        include: {
            _count: {
                select: { parametros: true }
            }
        }
    });

    // Agrupar por categoría
    const agrupado = catalogo.reduce((acc, estudio) => {
        const cat = estudio.categoria || "Otros";
        if (!acc[cat]) {
            acc[cat] = [];
        }
        acc[cat].push(estudio);
        return acc;
    }, {} as Record<string, typeof catalogo>);

    return { catalogo, agrupado };
}

export default async function CatalogoPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const { catalogo, agrupado } = await getCatalogo();
    const categorias = Object.keys(agrupado).sort();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-light text-foreground">
                            Catálogo de Estudios
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Administra los tipos de estudios y sus parámetros predefinidos
                        </p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/catalogo/nuevo">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Tipo de Estudio
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="card-elevated">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                                <Beaker className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-foreground">{catalogo.length}</p>
                                <p className="text-sm text-muted-foreground">Tipos de estudios</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="card-elevated">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-muted">
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-foreground">{categorias.length}</p>
                                <p className="text-sm text-muted-foreground">Categorías</p>
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
                                    {catalogo.reduce((acc, e) => acc + e._count.parametros, 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">Parámetros totales</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Catalog List by Category */}
            {categorias.length === 0 ? (
                <Card className="card-elevated">
                    <CardContent className="py-12 text-center">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            No hay estudios en el catálogo
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Empieza agregando tipos de estudios con sus parámetros predefinidos
                        </p>
                        <Button asChild>
                            <Link href="/catalogo/nuevo">
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Primer Estudio
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {categorias.map((categoria) => (
                        <Card key={categoria} className="card-elevated">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-foreground">
                                    {categoria}
                                </CardTitle>
                                <CardDescription>
                                    {agrupado[categoria].length} {agrupado[categoria].length === 1 ? 'estudio' : 'estudios'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="divide-y divide-border">
                                    {agrupado[categoria].map((estudio) => (
                                        <Link
                                            key={estudio.id}
                                            href={`/catalogo/${estudio.id}`}
                                            className="flex items-center justify-between py-4 hover:bg-muted/50 -mx-6 px-6 transition-colors first:pt-0 last:pb-0"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-medium text-foreground">
                                                    {estudio.nombre}
                                                </h4>
                                                {estudio.descripcion && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {estudio.descripcion}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary">
                                                    {estudio._count.parametros} parámetros
                                                </Badge>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
