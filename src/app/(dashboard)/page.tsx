import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, FileText, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getStats(laboratorioId: string) {
    const [pacientesCount, estudiosCount, reportesCount, reportesRecientes] = await Promise.all([
        prisma.paciente.count({ where: { laboratorioId } }),
        prisma.estudio.count({
            where: { paciente: { laboratorioId } },
        }),
        prisma.reporte.count({ where: { laboratorioId } }),
        prisma.reporte.count({
            where: {
                laboratorioId,
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
        }),
    ]);

    return { pacientesCount, estudiosCount, reportesCount, reportesRecientes };
}

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const stats = await getStats(session.user.laboratorioId);

    const statCards = [
        {
            title: "Pacientes",
            value: stats.pacientesCount,
            icon: Users,
            href: "/pacientes",
        },
        {
            title: "Estudios",
            value: stats.estudiosCount,
            icon: ClipboardList,
            href: "/estudios",
        },
        {
            title: "Reportes Totales",
            value: stats.reportesCount,
            icon: FileText,
            href: "/reportes",
        },
        {
            title: "Esta Semana",
            value: stats.reportesRecientes,
            icon: TrendingUp,
            href: "/reportes",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-light text-foreground tracking-tight">
                    Bienvenido, <span className="font-medium">{session.user.nombre}</span>
                </h1>
                <p className="text-muted-foreground mt-1">
                    Panel de control del laboratorio
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <Card className="card-elevated cursor-pointer group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <stat.icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-light text-foreground">{stat.value}</div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    Acciones Rápidas
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="/pacientes/nuevo">
                        <Card className="card-elevated cursor-pointer group">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-foreground font-medium">
                                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    Nuevo Paciente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground">
                                    Registra un nuevo paciente en el sistema
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/estudios">
                        <Card className="card-elevated cursor-pointer group">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-foreground font-medium">
                                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <ClipboardList className="h-4 w-4" />
                                    </div>
                                    Capturar Estudio
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground">
                                    Captura resultados de un estudio clínico
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/reportes/nuevo">
                        <Card className="card-elevated cursor-pointer group">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-foreground font-medium">
                                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    Emitir Reporte
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground">
                                    Genera un reporte oficial con PDF y QR
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}

