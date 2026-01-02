import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Contraseña", type: "password" },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials);

                if (!parsed.success) {
                    return null;
                }

                const { email, password } = parsed.data;

                const usuario = await prisma.usuario.findUnique({
                    where: { email },
                    include: { laboratorio: true },
                });

                if (!usuario || !usuario.activo) {
                    return null;
                }

                const passwordMatch = await bcrypt.compare(password, usuario.password);

                if (!passwordMatch) {
                    return null;
                }

                return {
                    id: usuario.id,
                    email: usuario.email,
                    name: `${usuario.nombre} ${usuario.apellido}`,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    rol: usuario.rol,
                    laboratorioId: usuario.laboratorioId,
                    laboratorioNombre: usuario.laboratorio.nombre,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
                token.nombre = user.nombre as string;
                token.apellido = user.apellido as string;
                token.rol = user.rol;
                token.laboratorioId = user.laboratorioId as string;
                token.laboratorioNombre = user.laboratorioNombre as string;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.nombre = token.nombre as string;
                session.user.apellido = token.apellido as string;
                session.user.rol = token.rol as "ADMIN" | "SUPERVISOR" | "TECNICO";
                session.user.laboratorioId = token.laboratorioId as string;
                session.user.laboratorioNombre = token.laboratorioNombre as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    trustHost: true,
});
