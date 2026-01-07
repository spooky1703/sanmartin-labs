import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obtener un estudio del catálogo con sus parámetros
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const estudio = await prisma.catalogoEstudio.findUnique({
            where: { id },
            include: {
                parametros: {
                    orderBy: { orden: "asc" },
                },
            },
        });

        if (!estudio) {
            return NextResponse.json(
                { error: "Estudio no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(estudio);
    } catch (error) {
        console.error("Error al obtener estudio del catálogo:", error);
        return NextResponse.json(
            { error: "Error al obtener estudio" },
            { status: 500 }
        );
    }
}
