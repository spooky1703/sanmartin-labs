import { z } from "zod";

export const reporteSchema = z.object({
    pacienteId: z
        .string()
        .min(1, "Debe seleccionar un paciente"),
    estudiosIds: z
        .array(z.string())
        .min(1, "Debe seleccionar al menos un estudio"),
    fechaExpiracion: z
        .string()
        .min(1, "La fecha de expiración es requerida")
        .refine((val) => !isNaN(Date.parse(val)), "Fecha inválida")
        .refine((val) => new Date(val) > new Date(), "La fecha de expiración debe ser futura"),
});

export const consultaSchema = z.object({
    folio: z
        .string()
        .min(1, "El folio es requerido")
        .max(50, "Folio inválido"),
});

export type ReporteSchemaType = z.infer<typeof reporteSchema>;
export type ConsultaSchemaType = z.infer<typeof consultaSchema>;
