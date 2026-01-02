import QRCode from "qrcode";

/**
 * Generates a QR code as a data URL (base64 PNG)
 */
export async function generateQRCode(data: string): Promise<string> {
    try {
        const qrDataUrl = await QRCode.toDataURL(data, {
            width: 200,
            margin: 2,
            color: {
                dark: "#000000",
                light: "#ffffff",
            },
            errorCorrectionLevel: "M",
        });
        return qrDataUrl;
    } catch (error) {
        console.error("Error generating QR code:", error);
        throw new Error("Failed to generate QR code");
    }
}

/**
 * Generates the consultation URL for a report
 */
export function getConsultaUrl(codigoAcceso: string): string {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return `${baseUrl}/consulta/${codigoAcceso}`;
}
