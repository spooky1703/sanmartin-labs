"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <SessionProvider>
            <div className="min-h-screen bg-slate-950">
                <Sidebar />
                <div className="lg:pl-64">
                    <Navbar />
                    <main className="py-6 px-4 sm:px-6 lg:px-8">
                        {children}
                    </main>
                </div>
            </div>
        </SessionProvider>
    );
}
