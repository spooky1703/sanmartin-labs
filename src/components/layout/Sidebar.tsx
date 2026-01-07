"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Users,
    FileText,
    ClipboardList,
} from "lucide-react";

const navigation = [
    { name: "Pacientes", href: "/pacientes", icon: Users },
    { name: "Estudios", href: "/estudios", icon: ClipboardList },
    { name: "Reportes", href: "/reportes", icon: FileText },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
            <div className="flex min-h-0 flex-1 flex-col bg-background border-r border-border">
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border">
                            <Image
                                src="/icon.png"
                                alt="Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-lg font-medium text-foreground">San Martin Labs</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col px-4 py-6">
                    <ul className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/" && pathname.startsWith(item.href));

                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                "h-5 w-5 shrink-0 transition-colors",
                                                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                                            )}
                                        />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="px-4 py-4 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                        © 2026 San Martin Labs
                    </p>
                </div>
            </div>
        </div>
    );
}

