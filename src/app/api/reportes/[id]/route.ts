import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{ id: string }>;
}

// GET /api/reportes/[id] - Get a single report
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

        const reporte = await prisma.reporte.findFirst({
            where: {
                id,
                laboratorioId: session.user.laboratorioId,
            },
            include: {
                paciente: true,
                laboratorio: true,
                usuario: {
                    select: { id: true, nombre: true, apellido: true },
                },
                estudios: {
                    include: {
                        estudio: {
                            include: {
                                parametros: { orderBy: { orden: "asc" } },
                            },
                        },
                    },
                },
            },
        });

        if (!reporte) {
            return NextResponse.json(
                { success: false, error: "Reporte no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: reporte });
    } catch (error) {
        console.error("Error fetching report:", error);
        return NextResponse.json(
            { success: false, error: "Error al obtener reporte" },
            { status: 500 }
        );
    }
}

// PATCH /api/reportes/[id] - Update report (e.g., invalidate)
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "No autorizado" },
                { status: 401 }
            );
        }

        // Only admins and supervisors can update reports
        if (!["ADMIN", "SUPERVISOR"].includes(session.user.rol)) {
            return NextResponse.json(
                { success: false, error: "No tienes permisos para modificar reportes" },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Verify report exists and belongs to the laboratory
        const existingReport = await prisma.reporte.findFirst({
            where: {
                id,
                laboratorioId: session.user.laboratorioId,
            },
        });

        if (!existingReport) {
            return NextResponse.json(
                { success: false, error: "Reporte no encontrado" },
                { status: 404 }
            );
        }

        const reporte = await prisma.reporte.update({
            where: { id },
            data: {
                vigente: body.vigente !== undefined ? body.vigente : existingReport.vigente,
            },
        });

        return NextResponse.json({
            success: true,
            data: reporte,
            message: "Reporte actualizado exitosamente",
        });
    } catch (error) {
        console.error("Error updating report:", error);
        return NextResponse.json(
            { success: false, error: "Error al actualizar reporte" },
            { status: 500 }
        );
    }
}
