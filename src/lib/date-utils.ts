import { addDays, format, parseISO, isAfter, isBefore, differenceInYears } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formatea una fecha en formato largo en español
 */
export function formatDateLong(date: Date | string): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "d 'de' MMMM 'de' yyyy", { locale: es });
}

/**
 * Formatea una fecha en formato corto
 */
export function formatDateShort(date: Date | string): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "dd/MM/yyyy", { locale: es });
}

/**
 * Formatea fecha y hora
 */
export function formatDateTime(date: Date | string): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "dd/MM/yyyy HH:mm", { locale: es });
}

/**
 * Obtiene la fecha de expiración por defecto (15 días)
 */
export function getDefaultExpirationDate(): Date {
    return addDays(new Date(), 15);
}

/**
 * Verifica si una fecha ha expirado
 */
export function isExpired(date: Date | string): boolean {
    const d = typeof date === "string" ? parseISO(date) : date;
    return isBefore(d, new Date());
}

/**
 * Verifica si una fecha es futura
 */
export function isFutureDate(date: Date | string): boolean {
    const d = typeof date === "string" ? parseISO(date) : date;
    return isAfter(d, new Date());
}

/**
 * Calcula la edad a partir de la fecha de nacimiento
 */
export function calculateAge(birthDate: Date | string): number {
    const d = typeof birthDate === "string" ? parseISO(birthDate) : birthDate;
    return differenceInYears(new Date(), d);
}

/**
 * Formatea fecha para input type="date"
 */
export function formatForInput(date: Date | string): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "yyyy-MM-dd");
}
