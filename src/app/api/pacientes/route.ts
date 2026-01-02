import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pacienteSchema } from "@/schemas/paciente.schema";
import { generateFolio } from "@/lib/utils";

// GET /api/pacientes - List all patients for the laboratory
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
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
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

        return NextResponse.json({
            success: true,
            data: {
                pacientes,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching patients:", error);
        return NextResponse.json(
            { success: false, error: "Error al obtener pacientes" },
            { status: 500 }
        );
    }
}

// POST /api/pacientes - Create a new patient
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

        // Auto-generate folio if not provided
        if (!body.folio) {
            body.folio = generateFolio();
        }

        const parsed = pacienteSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: "Datos inválidos", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        // Check if folio already exists in this laboratory
        const existingPatient = await prisma.paciente.findUnique({
            where: {
                laboratorioId_folio: {
                    laboratorioId: session.user.laboratorioId,
                    folio: parsed.data.folio,
                },
            },
        });

        if (existingPatient) {
            return NextResponse.json(
                { success: false, error: "Ya existe un paciente con este folio" },
                { status: 409 }
            );
        }

        const paciente = await prisma.paciente.create({
            data: {
                ...parsed.data,
                fechaNacimiento: parsed.data.fechaNacimiento
                    ? new Date(parsed.data.fechaNacimiento)
                    : null,
                laboratorioId: session.user.laboratorioId,
            },
        });

        return NextResponse.json(
            { success: true, data: paciente, message: "Paciente creado exitosamente" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating patient:", error);
        return NextResponse.json(
            { success: false, error: "Error al crear paciente" },
            { status: 500 }
        );
    }
}
