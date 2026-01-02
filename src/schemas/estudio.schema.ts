import { z } from "zod";

export const parametroSchema = z.object({
    nombreParametro: z
        .string()
        .min(1, "El nombre del parámetro es requerido")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    valor: z
        .string()
        .min(1, "El valor es requerido")
        .max(50, "El valor no puede exceder 50 caracteres"),
    unidad: z
        .string()
        .min(1, "La unidad es requerida")
        .max(30, "La unidad no puede exceder 30 caracteres"),
    valorRefMin: z
        .string()
        .max(30, "El valor mínimo no puede exceder 30 caracteres")
        .optional()
        .or(z.literal("")),
    valorRefMax: z
        .string()
        .max(30, "El valor máximo no puede exceder 30 caracteres")
        .optional()
        .or(z.literal("")),
    orden: z.number().int().min(0).optional(),
});

export const estudioSchema = z.object({
    nombreEstudio: z
        .string()
        .min(2, "El nombre del estudio debe tener al menos 2 caracteres")
        .max(150, "El nombre del estudio no puede exceder 150 caracteres"),
    fechaRealizacion: z
        .string()
        .min(1, "La fecha de realización es requerida")
        .refine((val) => !isNaN(Date.parse(val)), "Fecha inválida"),
    observaciones: z
        .string()
        .max(500, "Las observaciones no pueden exceder 500 caracteres")
        .optional()
        .or(z.literal("")),
    parametros: z
        .array(parametroSchema)
        .min(1, "Debe agregar al menos un parámetro"),
});

export const estudioUpdateSchema = estudioSchema.partial();

export type ParametroSchemaType = z.infer<typeof parametroSchema>;
export type EstudioSchemaType = z.infer<typeof estudioSchema>;
