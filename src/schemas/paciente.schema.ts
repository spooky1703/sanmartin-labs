import { z } from "zod";

export const pacienteSchema = z.object({
    folio: z
        .string()
        .min(1, "El folio es requerido")
        .max(50, "El folio no puede exceder 50 caracteres"),
    nombre: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    apellidoPaterno: z
        .string()
        .min(2, "El apellido paterno debe tener al menos 2 caracteres")
        .max(100, "El apellido paterno no puede exceder 100 caracteres"),
    apellidoMaterno: z
        .string()
        .max(100, "El apellido materno no puede exceder 100 caracteres")
        .optional()
        .or(z.literal("")),
    fechaNacimiento: z
        .string()
        .optional()
        .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Fecha de nacimiento inválida"
        ),
    genero: z
        .string()
        .optional(),
    telefono: z
        .string()
        .max(20, "El teléfono no puede exceder 20 caracteres")
        .optional()
        .or(z.literal("")),
    email: z
        .string()
        .email("Email inválido")
        .optional()
        .or(z.literal("")),
});

export const pacienteUpdateSchema = pacienteSchema.partial();

export type PacienteSchemaType = z.infer<typeof pacienteSchema>;
