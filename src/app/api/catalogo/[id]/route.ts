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

// PUT - Actualizar estudio del catálogo
export async function PUT(
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

        if (session.user.rol !== "ADMIN") {
            return NextResponse.json(
                { error: "Solo administradores pueden editar el catálogo" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { nombre, descripcion, categoria, parametros } = body;

        if (!nombre?.trim()) {
            return NextResponse.json(
                { error: "El nombre es requerido" },
                { status: 400 }
            );
        }

        // Verificar que existe
        const existe = await prisma.catalogoEstudio.findUnique({
            where: { id }
        });

        if (!existe) {
            return NextResponse.json(
                { error: "Estudio no encontrado" },
                { status: 404 }
            );
        }

        // Verificar nombre duplicado
        const duplicado = await prisma.catalogoEstudio.findFirst({
            where: {
                nombre: nombre.trim(),
                id: { not: id }
            }
        });

        if (duplicado) {
            return NextResponse.json(
                { error: "Ya existe otro estudio con ese nombre" },
                { status: 400 }
            );
        }

        // Actualizar en transacción: borrar parámetros viejos y crear nuevos
        const estudio = await prisma.$transaction(async (tx) => {
            // Eliminar parámetros existentes
            await tx.plantillaParametro.deleteMany({
                where: { catalogoId: id }
            });

            // Actualizar estudio y crear nuevos parámetros
            return tx.catalogoEstudio.update({
                where: { id },
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
        });

        return NextResponse.json({ success: true, data: estudio });
    } catch (error) {
        console.error("Error al actualizar estudio:", error);
        return NextResponse.json(
            { error: "Error al actualizar estudio" },
            { status: 500 }
        );
    }
}

