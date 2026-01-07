/**
 * Utilidad para evaluar valores de parámetros clínicos
 * Determina si un valor está dentro del rango normal, alto, bajo, o crítico
 */

export type EstadoParametro = "NORMAL" | "BAJO" | "ALTO" | "CRITICO_BAJO" | "CRITICO_ALTO";

interface RangosReferencia {
    valorRefMin?: string | null;
    valorRefMax?: string | null;
    valorCriticoMin?: string | null;
    valorCriticoMax?: string | null;
}

/**
 * Evalúa un valor numérico contra rangos de referencia
 * @param valor - El valor a evaluar (string o número)
 * @param rangos - Los rangos de referencia
 * @returns El estado del parámetro
 */
export function evaluarValor(
    valor: string | number,
    rangos: RangosReferencia
): EstadoParametro | null {
    // Intentar parsear el valor como número
    const valorNumerico = typeof valor === "string" ? parseFloat(valor) : valor;

    // Si no es un valor numérico válido, no podemos evaluar
    if (isNaN(valorNumerico)) {
        return null;
    }

    const min = rangos.valorRefMin ? parseFloat(rangos.valorRefMin) : null;
    const max = rangos.valorRefMax ? parseFloat(rangos.valorRefMax) : null;
    const criticoMin = rangos.valorCriticoMin ? parseFloat(rangos.valorCriticoMin) : null;
    const criticoMax = rangos.valorCriticoMax ? parseFloat(rangos.valorCriticoMax) : null;

    // Si no hay rangos definidos, no podemos evaluar
    if (min === null && max === null) {
        return null;
    }

    // Verificar valores críticos primero
    if (criticoMin !== null && valorNumerico < criticoMin) {
        return "CRITICO_BAJO";
    }
    if (criticoMax !== null && valorNumerico > criticoMax) {
        return "CRITICO_ALTO";
    }

    // Verificar si está fuera de rango normal
    if (min !== null && valorNumerico < min) {
        return "BAJO";
    }
    if (max !== null && valorNumerico > max) {
        return "ALTO";
    }

    return "NORMAL";
}

/**
 * Obtiene los rangos correctos según el género del paciente
 */
export function obtenerRangosPorGenero(
    parametro: {
        valorRefMinH?: string | null;
        valorRefMaxH?: string | null;
        valorRefMinM?: string | null;
        valorRefMaxM?: string | null;
        valorCriticoMin?: string | null;
        valorCriticoMax?: string | null;
    },
    genero?: string | null
): { valorRefMin: string | null; valorRefMax: string | null; valorCriticoMin: string | null; valorCriticoMax: string | null } {
    // Determinar qué rangos usar basado en género
    const esMujer = genero?.toLowerCase() === "femenino" || genero?.toLowerCase() === "f" || genero?.toLowerCase() === "mujer";

    // Si hay rangos específicos para el género, usarlos; si no, usar los de hombre como default
    const valorRefMin = esMujer && parametro.valorRefMinM
        ? parametro.valorRefMinM
        : parametro.valorRefMinH || null;

    const valorRefMax = esMujer && parametro.valorRefMaxM
        ? parametro.valorRefMaxM
        : parametro.valorRefMaxH || null;

    return {
        valorRefMin,
        valorRefMax,
        valorCriticoMin: parametro.valorCriticoMin || null,
        valorCriticoMax: parametro.valorCriticoMax || null,
    };
}

/**
 * Retorna la configuración de estilo para un estado dado
 */
export function getEstadoConfig(estado: EstadoParametro | null | undefined) {
    switch (estado) {
        case "NORMAL":
            return {
                label: "Normal",
                color: "text-green-600 dark:text-green-400",
                bgColor: "bg-green-100 dark:bg-green-900/30",
                borderColor: "border-green-500",
                icon: "✓",
            };
        case "BAJO":
            return {
                label: "Bajo",
                color: "text-amber-600 dark:text-amber-400",
                bgColor: "bg-amber-100 dark:bg-amber-900/30",
                borderColor: "border-amber-500",
                icon: "↓",
            };
        case "ALTO":
            return {
                label: "Alto",
                color: "text-amber-600 dark:text-amber-400",
                bgColor: "bg-amber-100 dark:bg-amber-900/30",
                borderColor: "border-amber-500",
                icon: "↑",
            };
        case "CRITICO_BAJO":
            return {
                label: "Crítico Bajo",
                color: "text-red-600 dark:text-red-400",
                bgColor: "bg-red-100 dark:bg-red-900/30",
                borderColor: "border-red-500",
                icon: "⚠↓",
            };
        case "CRITICO_ALTO":
            return {
                label: "Crítico Alto",
                color: "text-red-600 dark:text-red-400",
                bgColor: "bg-red-100 dark:bg-red-900/30",
                borderColor: "border-red-500",
                icon: "⚠↑",
            };
        default:
            return {
                label: "",
                color: "text-muted-foreground",
                bgColor: "",
                borderColor: "border-transparent",
                icon: "",
            };
    }
}
