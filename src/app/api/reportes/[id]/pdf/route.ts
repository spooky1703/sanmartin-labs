import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportePDF } from "@/lib/pdf-generator";
import { generateQRCode, getConsultaUrl } from "@/lib/qr-generator";

interface Params {
    params: Promise<{ id: string }>;
}

// GET /api/reportes/[id]/pdf - Generate PDF for a report
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

        // Generate QR code
        const consultaUrl = getConsultaUrl(reporte.codigoAcceso);
        const qrDataUrl = await generateQRCode(consultaUrl);

        // Generate PDF
        const pdfBuffer = await renderToBuffer(
            ReportePDF({
                laboratorio: reporte.laboratorio,
                paciente: reporte.paciente,
                estudios: reporte.estudios.map((re: typeof reporte.estudios[number]) => ({
                    nombreEstudio: re.estudio.nombreEstudio,
                    fechaRealizacion: re.estudio.fechaRealizacion,
                    observaciones: re.estudio.observaciones,
                    parametros: re.estudio.parametros,
                })),
                fechaEmision: reporte.fechaEmision,
                codigoAcceso: reporte.codigoAcceso,
                qrDataUrl,
                emitidoPor: reporte.emitidoPor,
            })
        );

        // Return PDF as response
        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="reporte-${reporte.paciente.folio}-${reporte.id.slice(-6)}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Error generating PDF:", error);
        return NextResponse.json(
            { success: false, error: "Error al generar PDF" },
            { status: 500 }
        );
    }
}
