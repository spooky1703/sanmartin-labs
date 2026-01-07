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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Menu, X, Mail, Building2, Shield } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Users,
    FileText,
    ClipboardList,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navigation = [
    { name: "Pacientes", href: "/pacientes", icon: Users },
    { name: "Estudios", href: "/estudios", icon: ClipboardList },
    { name: "Reportes", href: "/reportes", icon: FileText },
];

export function Navbar() {
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
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

    return (
        <>
            <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Mobile menu button */}
                        <div className="flex lg:hidden">
                            <button
                                type="button"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Lab name - visible on mobile */}
                        <div className="flex lg:hidden items-center gap-2">
                            <div className="relative h-6 w-6 overflow-hidden rounded-md border border-border">
                                <Image
                                    src="/icon.png"
                                    alt="Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="font-medium text-foreground text-sm truncate max-w-[150px]">
                                {session?.user?.laboratorioNombre || "Laboratorio"}
                            </span>
                        </div>

                        {/* Lab name - visible on desktop */}
                        <div className="hidden lg:flex items-center">
                            <h1 className="text-base font-medium text-foreground">
                                {session?.user?.laboratorioNombre || "Sistema de Laboratorio"}
                            </h1>
                        </div>

                        {/* Right side: Theme toggle + User menu */}
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="hidden sm:inline-flex border-border text-muted-foreground">
                                {getRolLabel(session?.user?.rol)}
                            </Badge>

                            <ThemeToggle />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-9 w-9 rounded-full border border-border hover:border-foreground/20 transition-all"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                                                {getInitials(session?.user?.nombre, session?.user?.apellido)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56 bg-popover border-border"
                                    align="end"
                                >
                                    <DropdownMenuLabel className="text-foreground">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium">
                                                {session?.user?.nombre} {session?.user?.apellido}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {session?.user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-border" />
                                    <DropdownMenuItem
                                        className="text-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                                        onClick={() => setProfileOpen(true)}
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Mi Perfil</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border" />
                                    <DropdownMenuItem
                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
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
                <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <div className="relative h-8 w-8 overflow-hidden rounded-md border border-border">
                                    <Image
                                        src="/icon.png"
                                        alt="Logo"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <span className="font-medium text-foreground">San Martin Labs</span>
                            </div>
                            <button
                                type="button"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <X className="h-6 w-6" />
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
                                                        ? "bg-primary text-primary-foreground"
                                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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

            {/* Profile Dialog */}
            <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Mi Perfil</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {/* Avatar and name */}
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                                    {getInitials(session?.user?.nombre, session?.user?.apellido)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    {session?.user?.nombre} {session?.user?.apellido}
                                </h3>
                                <Badge variant="secondary" className="mt-1">
                                    {getRolLabel(session?.user?.rol)}
                                </Badge>
                            </div>
                        </div>

                        {/* User details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Correo electrónico</p>
                                    <p className="text-sm font-medium text-foreground">{session?.user?.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Laboratorio</p>
                                    <p className="text-sm font-medium text-foreground">{session?.user?.laboratorioNombre}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Rol en el sistema</p>
                                    <p className="text-sm font-medium text-foreground">{getRolLabel(session?.user?.rol)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
