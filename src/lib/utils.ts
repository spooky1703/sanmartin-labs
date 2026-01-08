import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Genera un folio único basado en timestamp y caracteres aleatorios
 */
export function generateFolio(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${timestamp}-${random}`;
}

/**
 * Formatea una fecha para mostrar en la UI
 */
export function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/**
 * Formatea una fecha corta
 */
export function formatDateShort(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

/**
 * Calcula la edad a partir de la fecha de nacimiento
 */
export function calculateAge(birthDate: Date | string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

/**
 * Valida si un valor está dentro del rango de referencia
 */
export function isValueInRange(
    value: string,
    min?: string | null,
    max?: string | null
): "normal" | "alto" | "bajo" | "desconocido" {
    const numValue = parseFloat(value);

    if (isNaN(numValue)) return "desconocido";

    const numMin = min ? parseFloat(min) : null;
    const numMax = max ? parseFloat(max) : null;

    if (numMin !== null && numValue < numMin) return "bajo";
    if (numMax !== null && numValue > numMax) return "alto";
    if (numMin !== null || numMax !== null) return "normal";

    return "desconocido";
}

/**
 * Obtiene la fecha de expiración por defecto (15 días desde hoy)
 */
export function getDefaultExpirationDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date;
}

/**
 * Formatea fecha para input type="date"
 */
export function formatForInput(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
}

/**
 * Verifica si un reporte está expirado
 */
export function isReportExpired(expirationDate: Date | string): boolean {
    const expDate = new Date(expirationDate);
    return new Date() > expDate;
}
