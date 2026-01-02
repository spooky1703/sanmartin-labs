"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Menu, FlaskConical } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Users,
    FileText,
    ClipboardList,
    LayoutDashboard,
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Pacientes", href: "/pacientes", icon: Users },
    { name: "Estudios", href: "/estudios", icon: ClipboardList },
    { name: "Reportes", href: "/reportes", icon: FileText },
];

export function Navbar() {
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const handleSignOut = () => {
        signOut({ callbackUrl: "/login" });
    };

    const getInitials = (nombre?: string, apellido?: string) => {
        const n = nombre?.charAt(0) || "";
        const a = apellido?.charAt(0) || "";
        return (n + a).toUpperCase() || "U";
    };

    const getRolLabel = (rol?: string) => {
        switch (rol) {
            case "ADMIN":
                return "Administrador";
            case "SUPERVISOR":
                return "Supervisor";
            case "TECNICO":
                return "Técnico";
            default:
                return "Usuario";
        }
    };

    const getRolColor = (rol?: string) => {
        switch (rol) {
            case "ADMIN":
                return "bg-red-500/20 text-red-400 border-red-500/30";
            case "SUPERVISOR":
                return "bg-amber-500/20 text-amber-400 border-amber-500/30";
            case "TECNICO":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500/30";
        }
    };

    return (
        <>
            <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Mobile menu button */}
                        <div className="flex lg:hidden">
                            <button
                                type="button"
                                className="text-slate-400 hover:text-white"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Lab name - visible on mobile */}
                        <div className="flex lg:hidden items-center gap-2">
                            <FlaskConical className="h-5 w-5 text-blue-500" />
                            <span className="font-semibold text-white text-sm truncate max-w-[150px]">
                                {session?.user?.laboratorioNombre || "Laboratorio"}
                            </span>
                        </div>

                        {/* Lab name - visible on desktop */}
                        <div className="hidden lg:flex items-center">
                            <h1 className="text-lg font-semibold text-white">
                                {session?.user?.laboratorioNombre || "Sistema de Laboratorio"}
                            </h1>
                        </div>

                        {/* User menu */}
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className={cn("hidden sm:inline-flex", getRolColor(session?.user?.rol))}>
                                {getRolLabel(session?.user?.rol)}
                            </Badge>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-10 w-10 rounded-full ring-2 ring-slate-700 hover:ring-blue-500/50 transition-all"
                                    >
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium">
                                                {getInitials(session?.user?.nombre, session?.user?.apellido)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56 bg-slate-800 border-slate-700"
                                    align="end"
                                >
                                    <DropdownMenuLabel className="text-slate-200">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium">
                                                {session?.user?.nombre} {session?.user?.apellido}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {session?.user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-slate-700" />
                                    <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-white cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Mi Perfil</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-700" />
                                    <DropdownMenuItem
                                        className="text-red-400 focus:bg-red-500/20 focus:text-red-400 cursor-pointer"
                                        onClick={handleSignOut}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Cerrar Sesión</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile navigation menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <FlaskConical className="h-6 w-6 text-blue-500" />
                                <span className="font-bold text-white">LabSystem</span>
                            </div>
                            <button
                                type="button"
                                className="text-slate-400 hover:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="text-2xl">×</span>
                            </button>
                        </div>
                        <nav className="flex-1 px-4 py-6">
                            <ul className="space-y-2">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href ||
                                        (item.href !== "/" && pathname.startsWith(item.href));

                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                                                    isActive
                                                        ? "bg-blue-500/20 text-blue-400"
                                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                                )}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                {item.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
