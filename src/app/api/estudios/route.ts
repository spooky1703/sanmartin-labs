import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estudioSchema } from "@/schemas/estudio.schema";

// GET /api/estudios - List all studies for the laboratory
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "No autorizado" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const pacienteId = searchParams.get("pacienteId");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const where = {
            paciente: {
                laboratorioId: session.user.laboratorioId,
            },
            ...(pacienteId && { pacienteId }),
        };

        const [estudios, total] = await Promise.all([
            prisma.estudio.findMany({
                where,
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
                            apellidoMaterno: true,
                        },
                    },
                    parametros: {
                        orderBy: { orden: "asc" },
                    },
                    _count: {
                        select: { reportes: true },
                    },
                },
            }),
            prisma.estudio.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                estudios,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching studies:", error);
        return NextResponse.json(
            { success: false, error: "Error al obtener estudios" },
            { status: 500 }
        );
    }
}

// POST /api/estudios - Create a new study
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "No autorizado" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { pacienteId, ...estudioData } = body;

        if (!pacienteId) {
            return NextResponse.json(
                { success: false, error: "Se requiere el ID del paciente" },
                { status: 400 }
            );
        }

        const parsed = estudioSchema.safeParse(estudioData);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: "Datos inválidos", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        // Verify patient belongs to the laboratory
        const paciente = await prisma.paciente.findFirst({
            where: {
                id: pacienteId,
                laboratorioId: session.user.laboratorioId,
            },
        });

        if (!paciente) {
            return NextResponse.json(
                { success: false, error: "Paciente no encontrado" },
                { status: 404 }
            );
        }

        const estudio = await prisma.estudio.create({
            data: {
                pacienteId,
                nombreEstudio: parsed.data.nombreEstudio,
                fechaRealizacion: new Date(parsed.data.fechaRealizacion),
                observaciones: parsed.data.observaciones || null,
                parametros: {
                    create: parsed.data.parametros.map((param, index) => ({
                        nombreParametro: param.nombreParametro,
                        valor: param.valor,
                        unidad: param.unidad,
                        valorRefMin: param.valorRefMin || null,
                        valorRefMax: param.valorRefMax || null,
                        orden: param.orden ?? index,
                    })),
                },
            },
            include: {
                parametros: {
                    orderBy: { orden: "asc" },
                },
            },
        });

        return NextResponse.json(
            { success: true, data: estudio, message: "Estudio creado exitosamente" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating study:", error);
        return NextResponse.json(
            { success: false, error: "Error al crear estudio" },
            { status: 500 }
        );
    }
}
