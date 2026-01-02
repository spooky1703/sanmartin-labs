// Types for the application - defined locally to avoid Prisma client import issues

// Enum for user roles
export type RolUsuario = "ADMIN" | "SUPERVISOR" | "TECNICO";

// Base entity types (matching Prisma schema)
export interface Laboratorio {
    id: string;
    nombre: string;
    direccion?: string | null;
    telefono?: string | null;
    email?: string | null;
    logo?: string | null;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Usuario {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    password: string;
    rol: RolUsuario;
    laboratorioId: string;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Paciente {
    id: string;
    folio: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string | null;
    fechaNacimiento?: Date | null;
    genero?: string | null;
    telefono?: string | null;
    email?: string | null;
    laboratorioId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Estudio {
    id: string;
    pacienteId: string;
    nombreEstudio: string;
    fechaRealizacion: Date;
    observaciones?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ParametroEstudio {
    id: string;
    estudioId: string;
    nombreParametro: string;
    valor: string;
    unidad: string;
    valorRefMin?: string | null;
    valorRefMax?: string | null;
    orden: number;
}

export interface Reporte {
    id: string;
    pacienteId: string;
    laboratorioId: string;
    usuarioId: string;
    codigoAcceso: string;
    fechaEmision: Date;
    fechaExpiracion: Date;
    vigente: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReporteEstudio {
    id: string;
    reporteId: string;
    estudioId: string;
}

// Extended types with relations
export type UsuarioWithLaboratorio = Usuario & {
    laboratorio: Laboratorio;
};

export type PacienteWithEstudios = Paciente & {
    estudios: EstudioWithParametros[];
};

export type EstudioWithParametros = Estudio & {
    parametros: ParametroEstudio[];
};

export type ReporteWithRelations = Reporte & {
    paciente: Paciente;
    laboratorio: Laboratorio;
    usuario: Usuario;
    estudios: {
        estudio: EstudioWithParametros;
    }[];
};

export type ReporteCompleto = Reporte & {
    paciente: Paciente;
    laboratorio: Laboratorio;
    usuario: Pick<Usuario, "id" | "nombre" | "apellido">;
    estudios: {
        estudio: EstudioWithParametros;
    }[];
};

// Form types
export type PacienteFormData = {
    folio: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    fechaNacimiento?: string;
    genero?: string;
    telefono?: string;
    email?: string;
};

export type EstudioFormData = {
    nombreEstudio: string;
    fechaRealizacion: string;
    observaciones?: string;
    parametros: ParametroFormData[];
};

export type ParametroFormData = {
    nombreParametro: string;
    valor: string;
    unidad: string;
    valorRefMin?: string;
    valorRefMax?: string;
    orden?: number;
};

export type ReporteFormData = {
    pacienteId: string;
    estudiosIds: string[];
    fechaExpiracion: string;
};

// API Response types
export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};

// Session user type
export type SessionUser = {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: RolUsuario;
    laboratorioId: string;
    laboratorioNombre: string;
};

// Consulta pública types
export type ConsultaValidacion = {
    codigoAcceso: string;
    folio: string;
};

export type ResultadoConsulta = {
    paciente: {
        nombre: string;
        apellidoPaterno: string;
        apellidoMaterno?: string;
        folio: string;
    };
    laboratorio: {
        nombre: string;
        direccion?: string;
        telefono?: string;
        logo?: string;
    };
    fechaEmision: Date;
    fechaExpiracion: Date;
    estudios: {
        nombreEstudio: string;
        fechaRealizacion: Date;
        observaciones?: string;
        parametros: {
            nombreParametro: string;
            valor: string;
            unidad: string;
            valorRefMin?: string;
            valorRefMax?: string;
        }[];
    }[];
};
