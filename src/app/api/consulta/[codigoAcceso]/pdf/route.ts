
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportePDF } from "@/lib/pdf-generator";
import { generateQRCode, getConsultaUrl } from "@/lib/qr-generator";

interface Params {
    params: Promise<{ codigoAcceso: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { codigoAcceso } = await params;

        const reporte = await prisma.reporte.findUnique({
            where: { codigoAcceso },
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

        // Validate report is still valid
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

        // Generate QR code
        const consultaUrl = getConsultaUrl(reporte.codigoAcceso);
        const qrDataUrl = await generateQRCode(consultaUrl);

        // Generate PDF
        const pdfBuffer = await renderToBuffer(
            ReportePDF({
                laboratorio: reporte.laboratorio,
                paciente: reporte.paciente,
                estudios: reporte.estudios.map((re: any) => ({
                    nombreEstudio: re.estudio.nombreEstudio,
                    fechaRealizacion: re.estudio.fechaRealizacion,
                    observaciones: re.estudio.observaciones,
                    parametros: re.estudio.parametros,
                })),
                fechaEmision: reporte.fechaEmision,
                codigoAcceso: reporte.codigoAcceso,
                qrDataUrl,
                emitidoPor: `${reporte.usuario.nombre} ${reporte.usuario.apellido}`,
            })
        );

        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="Resultados-${reporte.paciente.folio}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Error generating public PDF:", error);
        return NextResponse.json(
            { success: false, error: "Error al generar PDF" },
            { status: 500 }
        );
    }
}
