"use client";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Animated Geometric Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating shapes */}
                <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-muted/30 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute top-[60%] right-[10%] w-96 h-96 bg-muted/20 rounded-full blur-3xl animate-float-medium" />
                <div className="absolute bottom-[20%] left-[20%] w-64 h-64 bg-muted/25 rounded-full blur-3xl animate-float-fast" />

                {/* Geometric shapes */}
                <div className="absolute top-[15%] right-[15%] w-20 h-20 border border-border/50 rotate-45 animate-spin-slow" />
                <div className="absolute bottom-[25%] left-[10%] w-16 h-16 border border-border/40 rounded-full animate-pulse-slow" />
                <div className="absolute top-[40%] left-[8%] w-12 h-12 bg-muted/40 rotate-12 animate-float-medium" />
                <div className="absolute bottom-[15%] right-[20%] w-24 h-24 border border-border/30 rotate-12 animate-spin-slower" />
                <div className="absolute top-[70%] right-[5%] w-8 h-8 bg-muted/50 rounded-full animate-float-fast" />
            </div>

            {/* Content */}
            <div className="w-full max-w-md p-4 relative z-10">
                {children}
            </div>

            {/* Custom animation styles */}
            <style jsx>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-20px) translateX(10px); }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-30px) translateX(-15px); }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-15px) translateX(8px); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(45deg); }
                    to { transform: rotate(405deg); }
                }
                @keyframes spin-slower {
                    from { transform: rotate(12deg); }
                    to { transform: rotate(372deg); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }
                .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
                .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
                .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }
                .animate-spin-slower { animation: spin-slower 30s linear infinite; }
                .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
            `}</style>
        </div>
    );
}

