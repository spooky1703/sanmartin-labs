import nodemailer from "nodemailer";

// Create reusable transporter object using the default SMTP transport
const createTransporter = () => {
    if (!process.env.SMTP_HOST) return null;

    const port = parseInt(process.env.SMTP_PORT || "465");
    const isSecure = port === 465 || process.env.SMTP_SECURE === "true";

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: isSecure, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000, // 10 seconds to connect
        socketTimeout: 15000,     // 15 seconds for socket operations
        tls: {
            rejectUnauthorized: false, // Allow self-signed certs
        },
    });
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
    // Diagnostic logging
    console.log("📧 Email attempt:", {
        to,
        smtpHost: process.env.SMTP_HOST ? "✅ configured" : "❌ missing",
        smtpPort: process.env.SMTP_PORT || "587 (default)",
        smtpUser: process.env.SMTP_USER ? "✅ configured" : "❌ missing",
        smtpPass: process.env.SMTP_PASS ? "✅ configured" : "❌ missing",
        smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER,
    });

    const transporter = createTransporter();

    if (!transporter) {
        console.error("❌ SMTP_HOST not configured - cannot create transporter");
        return { success: false, error: "SMTP service not configured" };
    }

    try {
        console.log("📤 Sending email to:", to);
        const info = await transporter.sendMail({
            from: `"${labName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: to,
            subject: `Resultados de Laboratorio - ${labName}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
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
            
            <a href="${consultaUrl}" class="button">Ver Resultados en Línea</a>
            
            <p style="color: #6b7280; font-size: 14px;">
                <strong>Nota:</strong> Para acceder a sus resultados en línea, necesitará ingresar su número de folio: <strong>${folio}</strong>
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

        console.log("Message sent: %s", info.messageId);
        return { success: true };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: String(error) };
    }
}
