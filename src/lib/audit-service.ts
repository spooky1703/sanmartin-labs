import { prisma } from "./prisma";
import { headers } from "next/headers";

export type AuditAction = "CREAR" | "EDITAR" | "ELIMINAR" | "CONSULTAR" | "LOGIN" | "LOGOUT";
export type AuditEntity = "PACIENTE" | "ESTUDIO" | "REPORTE" | "USUARIO" | "LABORATORIO" | "SISTEMA";

interface AuditLogParams {
    usuarioId?: string | null;
    usuarioEmail?: string | null;
    laboratorioId?: string | null;
    accion: AuditAction;
    entidad: AuditEntity;
    entidadId?: string | null;
    descripcion: string;
    metadata?: Record<string, unknown>;
}

export async function registrarAuditoria({
    usuarioId,
    usuarioEmail,
    laboratorioId,
    accion,
    entidad,
    entidadId,
    descripcion,
    metadata,
}: AuditLogParams): Promise<void> {
    try {
        // Get IP and User Agent from headers
        let ip: string | null = null;
        let userAgent: string | null = null;

        try {
            const headersList = await headers();
            ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || null;
            userAgent = headersList.get("user-agent") || null;
        } catch {
            // Headers not available (not in request context)
        }

        await prisma.auditoriaLog.create({
            data: {
                usuarioId,
                usuarioEmail,
                laboratorioId,
                accion,
                entidad,
                entidadId,
                descripcion,
                metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
                ip,
                userAgent,
            },
        });
    } catch (error) {
        // Don't throw error to avoid breaking the main operation
        console.error("Error registering audit log:", error);
    }
}

// Helper function for common audit scenarios
export async function auditarAccion(
    session: { user: { id: string; email: string; laboratorioId: string } } | null,
    accion: AuditAction,
    entidad: AuditEntity,
    descripcion: string,
    entidadId?: string | null,
    metadata?: Record<string, unknown>
): Promise<void> {
    await registrarAuditoria({
        usuarioId: session?.user?.id,
        usuarioEmail: session?.user?.email,
        laboratorioId: session?.user?.laboratorioId,
        accion,
        entidad,
        entidadId,
        descripcion,
        metadata,
    });
}
