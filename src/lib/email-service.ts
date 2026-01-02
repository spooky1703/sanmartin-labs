import { Resend } from "resend";

// Initialize Resend client
const getResendClient = () => {
    if (!process.env.RESEND_API_KEY) return null;
    return new Resend(process.env.RESEND_API_KEY);
};

interface SendReportEmailParams {
    to: string;
    patientName: string;
    labName: string;
    folio: string;
    consultaUrl: string;
}

export async function enviarReportePorEmail({
    to,
    patientName,
    labName,
    folio,
    consultaUrl,
}: SendReportEmailParams): Promise<{ success: boolean; error?: string }> {
    const resend = getResendClient();

    if (!resend) {
        console.warn("❌ RESEND_API_KEY not configured - email not sent");
        return { success: false, error: "Email service not configured" };
    }

    console.log("� Sending email via Resend to:", to);

    try {
        const { data, error } = await resend.emails.send({
            from: `${labName} <onboarding@resend.dev>`, // Use your verified domain later
            to: [to],
            subject: `Resultados de Laboratorio - ${labName}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">🔬 ${labName}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Resultados de Laboratorio</p>
        </div>
        <div class="content">
            <p>Estimado(a) <strong>${patientName}</strong>,</p>
            
            <p>Le informamos que sus resultados de laboratorio están listos.</p>
            
            <div class="info-box">
                <p style="margin: 0;"><strong>📋 Folio:</strong> ${folio}</p>
            </div>
            
            <p>Puede consultar y descargar sus resultados en línea haciendo clic en el siguiente botón:</p>
            
            <p style="text-align: center;">
                <a href="${consultaUrl}" class="button">Ver Resultados en Línea</a>
            </p>
            
            <p style="color: #6b7280; font-size: 14px;">
                <strong>Nota:</strong> Para acceder a sus resultados, necesitará ingresar su número de folio: <strong>${folio}</strong>
            </p>
        </div>
        <div class="footer">
            <p>Este correo fue enviado automáticamente por ${labName}.</p>
            <p>Si tiene alguna duda, comuníquese con nosotros.</p>
        </div>
    </div>
</body>
</html>
            `,
        });

        if (error) {
            console.error("❌ Resend error:", error);
            return { success: false, error: error.message };
        }

        console.log("✅ Email sent successfully! ID:", data?.id);
        return { success: true };
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return { success: false, error: String(error) };
    }
}
