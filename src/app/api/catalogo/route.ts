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

// POST - Crear nuevo estudio en el catálogo
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        // Solo admins pueden crear estudios en el catálogo
        if (session.user.rol !== "ADMIN") {
            return NextResponse.json(
                { error: "Solo administradores pueden crear estudios en el catálogo" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { nombre, descripcion, categoria, parametros } = body;

        if (!nombre?.trim()) {
            return NextResponse.json(
                { error: "El nombre es requerido" },
                { status: 400 }
            );
        }

        // Verificar si ya existe
        const existe = await prisma.catalogoEstudio.findUnique({
            where: { nombre: nombre.trim() }
        });

        if (existe) {
            return NextResponse.json(
                { error: "Ya existe un estudio con ese nombre" },
                { status: 400 }
            );
        }

        // Crear estudio con parámetros
        const estudio = await prisma.catalogoEstudio.create({
            data: {
                nombre: nombre.trim(),
                descripcion: descripcion || null,
                categoria: categoria || null,
                parametros: {
                    create: parametros?.map((p: {
                        nombre: string;
                        unidad: string;
                        valorRefMinH?: string;
                        valorRefMaxH?: string;
                        valorRefMinM?: string;
                        valorRefMaxM?: string;
                        valorCriticoMin?: string;
                        valorCriticoMax?: string;
                        orden: number;
                    }) => ({
                        nombre: p.nombre,
                        unidad: p.unidad || "",
                        valorRefMinH: p.valorRefMinH || null,
                        valorRefMaxH: p.valorRefMaxH || null,
                        valorRefMinM: p.valorRefMinM || null,
                        valorRefMaxM: p.valorRefMaxM || null,
                        valorCriticoMin: p.valorCriticoMin || null,
                        valorCriticoMax: p.valorCriticoMax || null,
                        orden: p.orden || 0,
                    })) || [],
                },
            },
            include: {
                parametros: true,
            },
        });

        return NextResponse.json({ success: true, data: estudio }, { status: 201 });
    } catch (error) {
        console.error("Error al crear estudio en catálogo:", error);
        return NextResponse.json(
            { error: "Error al crear estudio" },
            { status: 500 }
        );
    }
}

