import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar todos los estudios del catálogo
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        const catalogo = await prisma.catalogoEstudio.findMany({
            where: { activo: true },
            orderBy: [
                { categoria: "asc" },
                { nombre: "asc" },
            ],
            select: {
                id: true,
                nombre: true,
                descripcion: true,
                categoria: true,
            },
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

        return NextResponse.json({
            catalogo,
            agrupado,
        });
    } catch (error) {
        console.error("Error al obtener catálogo:", error);
        return NextResponse.json(
            { error: "Error al obtener catálogo" },
            { status: 500 }
        );
    }
}
