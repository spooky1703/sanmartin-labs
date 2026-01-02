"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Users,
    FileText,
    ClipboardList,
    LayoutDashboard,
    FlaskConical,
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Pacientes", href: "/pacientes", icon: Users },
    { name: "Estudios", href: "/estudios", icon: ClipboardList },
    { name: "Reportes", href: "/reportes", icon: FileText },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
            <div className="flex min-h-0 flex-1 flex-col bg-slate-900 border-r border-slate-800">
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                            <FlaskConical className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">LabSystem</span>
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
                                                ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border-l-2 border-blue-500"
                                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                "h-5 w-5 shrink-0 transition-colors",
                                                isActive ? "text-blue-400" : "text-slate-500 group-hover:text-white"
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
                <div className="px-4 py-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500 text-center">
                        © 2024 LabSystem
                    </p>
                </div>
            </div>
        </div>
    );
}
