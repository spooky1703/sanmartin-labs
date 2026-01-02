import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consultaSchema } from "@/schemas/reporte.schema";

interface Params {
    params: Promise<{ codigoAcceso: string }>;
}

// POST /api/consulta/[codigoAcceso] - Validate folio and return report data
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { codigoAcceso } = await params;
        const body = await request.json();
        const parsed = consultaSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: "Acceso denegado" },
                { status: 403 }
            );
        }

        const { folio } = parsed.data;

        // Find report by access code
        const reporte = await prisma.reporte.findUnique({
            where: { codigoAcceso },
            include: {
                paciente: {
                    select: {
                        folio: true,
                        nombre: true,
                        apellidoPaterno: true,
                        apellidoMaterno: true,
                    },
                },
                laboratorio: {
                    select: {
                        nombre: true,
                        direccion: true,
                        telefono: true,
                        logo: true,
                    },
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

        // Generic error for security - don't reveal if code exists
        if (!reporte) {
            return NextResponse.json(
                { success: false, error: "Acceso denegado" },
                { status: 403 }
            );
        }

        // Validate folio matches
        if (reporte.paciente.folio.toLowerCase() !== folio.toLowerCase()) {
            return NextResponse.json(
                { success: false, error: "Acceso denegado" },
                { status: 403 }
            );
        }

        // Check if report is still valid
        if (!reporte.vigente) {
            return NextResponse.json(
                { success: false, error: "Este reporte ha sido invalidado" },
                { status: 403 }
            );
        }

        // Check expiration
        if (new Date() > new Date(reporte.fechaExpiracion)) {
            return NextResponse.json(
                { success: false, error: "Este reporte ha expirado" },
                { status: 403 }
            );
        }

        // Return sanitized data
        return NextResponse.json({
            success: true,
            data: {
                paciente: reporte.paciente,
                laboratorio: reporte.laboratorio,
                fechaEmision: reporte.fechaEmision,
                fechaExpiracion: reporte.fechaExpiracion,
                estudios: reporte.estudios.map((re: any) => ({
                    nombreEstudio: re.estudio.nombreEstudio,
                    fechaRealizacion: re.estudio.fechaRealizacion,
                    observaciones: re.estudio.observaciones,
                    parametros: re.estudio.parametros.map((p: any) => ({
                        nombreParametro: p.nombreParametro,
                        valor: p.valor,
                        unidad: p.unidad,
                        valorRefMin: p.valorRefMin,
                        valorRefMax: p.valorRefMax,
                    })),
                })),
            },
        });
    } catch (error) {
        console.error("Error validating consultation:", error);
        return NextResponse.json(
            { success: false, error: "Error en la consulta" },
            { status: 500 }
        );
    }
}
