import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pacienteUpdateSchema } from "@/schemas/paciente.schema";

interface Params {
    params: Promise<{ id: string }>;
}

// GET /api/pacientes/[id] - Get a single patient with their studies
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "No autorizado" },
                { status: 401 }
            );
        }

        const paciente = await prisma.paciente.findFirst({
            where: {
                id,
                laboratorioId: session.user.laboratorioId,
            },
            include: {
                estudios: {
                    orderBy: { fechaRealizacion: "desc" },
                    include: {
                        parametros: {
                            orderBy: { orden: "asc" },
                        },
                    },
                },
                reportes: {
                    orderBy: { fechaEmision: "desc" },
                    take: 5,
                },
            },
        });

        if (!paciente) {
            return NextResponse.json(
                { success: false, error: "Paciente no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: paciente });
    } catch (error) {
        console.error("Error fetching patient:", error);
        return NextResponse.json(
            { success: false, error: "Error al obtener paciente" },
            { status: 500 }
        );
    }
}

// PUT /api/pacientes/[id] - Update a patient
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "No autorizado" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const parsed = pacienteUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: "Datos inválidos", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        // Check if patient exists and belongs to the laboratory
        const existingPatient = await prisma.paciente.findFirst({
            where: {
                id,
                laboratorioId: session.user.laboratorioId,
            },
        });

        if (!existingPatient) {
            return NextResponse.json(
                { success: false, error: "Paciente no encontrado" },
                { status: 404 }
            );
        }

        // If folio is being changed, check for duplicates
        if (parsed.data.folio && parsed.data.folio !== existingPatient.folio) {
            const duplicateFolio = await prisma.paciente.findUnique({
                where: {
                    laboratorioId_folio: {
                        laboratorioId: session.user.laboratorioId,
                        folio: parsed.data.folio,
                    },
                },
            });

            if (duplicateFolio) {
                return NextResponse.json(
                    { success: false, error: "Ya existe un paciente con este folio" },
                    { status: 409 }
                );
            }
        }

        const paciente = await prisma.paciente.update({
            where: { id },
            data: {
                ...parsed.data,
                fechaNacimiento: parsed.data.fechaNacimiento
                    ? new Date(parsed.data.fechaNacimiento)
                    : undefined,
            },
        });

        return NextResponse.json({
            success: true,
            data: paciente,
            message: "Paciente actualizado exitosamente",
        });
    } catch (error) {
        console.error("Error updating patient:", error);
        return NextResponse.json(
            { success: false, error: "Error al actualizar paciente" },
            { status: 500 }
        );
    }
}

// DELETE /api/pacientes/[id] - Delete a patient
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "No autorizado" },
                { status: 401 }
            );
        }

        // Only admins and supervisors can delete
        if (!["ADMIN", "SUPERVISOR"].includes(session.user.rol)) {
            return NextResponse.json(
                { success: false, error: "No tienes permisos para eliminar pacientes" },
                { status: 403 }
            );
        }

        // Check if patient exists and belongs to the laboratory
        const existingPatient = await prisma.paciente.findFirst({
            where: {
                id,
                laboratorioId: session.user.laboratorioId,
            },
        });

        if (!existingPatient) {
            return NextResponse.json(
                { success: false, error: "Paciente no encontrado" },
                { status: 404 }
            );
        }

        await prisma.paciente.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: "Paciente eliminado exitosamente",
        });
    } catch (error) {
        console.error("Error deleting patient:", error);
        return NextResponse.json(
            { success: false, error: "Error al eliminar paciente" },
            { status: 500 }
        );
    }
}
