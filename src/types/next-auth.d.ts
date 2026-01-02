import { DefaultSession, DefaultUser } from "next-auth";
import { RolUsuario } from "@prisma/client";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            nombre: string;
            apellido: string;
            rol: RolUsuario;
            laboratorioId: string;
            laboratorioNombre: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        id: string;
        nombre: string;
        apellido: string;
        rol: RolUsuario;
        laboratorioId: string;
        laboratorioNombre: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        nombre: string;
        apellido: string;
        rol: RolUsuario;
        laboratorioId: string;
        laboratorioNombre: string;
    }
}
