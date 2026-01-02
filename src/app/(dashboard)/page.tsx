import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, FileText, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

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
            gradient: "from-blue-500 to-blue-600",
            bgGradient: "from-blue-500/10 to-blue-600/10",
        },
        {
            title: "Estudios",
            value: stats.estudiosCount,
            icon: ClipboardList,
            gradient: "from-emerald-500 to-teal-600",
            bgGradient: "from-emerald-500/10 to-teal-600/10",
        },
        {
            title: "Reportes Totales",
            value: stats.reportesCount,
            icon: FileText,
            gradient: "from-purple-500 to-purple-600",
            bgGradient: "from-purple-500/10 to-purple-600/10",
        },
        {
            title: "Reportes Esta Semana",
            value: stats.reportesRecientes,
            icon: TrendingUp,
            gradient: "from-amber-500 to-orange-600",
            bgGradient: "from-amber-500/10 to-orange-600/10",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">
                    Bienvenido, {session.user.nombre}
                </h1>
                <p className="text-slate-400 mt-1">
                    Panel de control del laboratorio
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card
                        key={stat.title}
                        className={`bg-gradient-to-br ${stat.bgGradient} border-slate-800 hover:border-slate-700 transition-all duration-300 hover:scale-[1.02]`}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                                <stat.icon className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-slate-900 border-slate-800 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white group-hover:text-emerald-400 transition-colors">
                            <Users className="h-5 w-5" />
                            Nuevo Paciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-400">
                            Registra un nuevo paciente en el sistema
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white group-hover:text-blue-400 transition-colors">
                            <ClipboardList className="h-5 w-5" />
                            Capturar Estudio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-400">
                            Captura resultados de un estudio clínico
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white group-hover:text-purple-400 transition-colors">
                            <FileText className="h-5 w-5" />
                            Emitir Reporte
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-400">
                            Genera un reporte oficial con PDF y QR
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
