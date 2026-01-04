import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reporteSchema } from "@/schemas/reporte.schema";
import { auditarAccion } from "@/lib/audit-service";

// GET /api/reportes - List all reports for the laboratory
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
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const where = {
            laboratorioId: session.user.laboratorioId,
        };

        const [reportes, total] = await Promise.all([
            prisma.reporte.findMany({
                where,
                orderBy: { fechaEmision: "desc" },
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
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                        },
                    },
                    _count: {
                        select: { estudios: true },
                    },
                },
            }),
            prisma.reporte.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                reportes,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json(
            { success: false, error: "Error al obtener reportes" },
            { status: 500 }
        );
    }
}

// POST /api/reportes - Create a new report
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "No autorizado" },
                { status: 401 }
            );
        }

        // Only supervisors and admins can create reports
        if (!["ADMIN", "SUPERVISOR"].includes(session.user.rol)) {
            return NextResponse.json(
                { success: false, error: "No tienes permisos para emitir reportes" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const parsed = reporteSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: "Datos inválidos", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        // Verify patient belongs to the laboratory
        const paciente = await prisma.paciente.findFirst({
            where: {
                id: parsed.data.pacienteId,
                laboratorioId: session.user.laboratorioId,
            },
        });

        if (!paciente) {
            return NextResponse.json(
                { success: false, error: "Paciente no encontrado" },
                { status: 404 }
            );
        }

        // Verify all studies belong to the patient
        const estudios = await prisma.estudio.findMany({
            where: {
                id: { in: parsed.data.estudiosIds },
                pacienteId: parsed.data.pacienteId,
            },
        });

        if (estudios.length !== parsed.data.estudiosIds.length) {
            return NextResponse.json(
                { success: false, error: "Algunos estudios no son válidos" },
                { status: 400 }
            );
        }

        // Create report
        const reporte = await prisma.reporte.create({
            data: {
                pacienteId: parsed.data.pacienteId,
                laboratorioId: session.user.laboratorioId,
                usuarioId: session.user.id,
                fechaExpiracion: new Date(parsed.data.fechaExpiracion),
                emitidoPor: parsed.data.emitidoPor,
                estudios: {
                    create: parsed.data.estudiosIds.map((estudioId) => ({
                        estudioId,
                    })),
                },
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

        // Register audit log
        await auditarAccion(
            session,
            "CREAR",
            "REPORTE",
            `Reporte emitido para paciente ${paciente.nombre} ${paciente.apellidoPaterno} (${paciente.folio})`,
            reporte.id,
            { estudiosCount: parsed.data.estudiosIds.length }
        );

        return NextResponse.json(
            {
                success: true,
                data: reporte,
                message: "Reporte emitido exitosamente",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating report:", error);
        return NextResponse.json(
            { success: false, error: "Error al crear reporte" },
            { status: 500 }
        );
    }
}
