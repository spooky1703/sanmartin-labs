"use client";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Base gradient mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

            {/* Aurora effect - large ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Primary aurora waves */}
                <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-full blur-[120px] animate-aurora-1" />
                <div className="absolute -bottom-[30%] -right-[20%] w-[70%] h-[70%] bg-gradient-to-tl from-primary/15 via-muted/10 to-transparent rounded-full blur-[100px] animate-aurora-2" />
                <div className="absolute top-[20%] -right-[10%] w-[50%] h-[60%] bg-gradient-to-bl from-muted/20 via-primary/8 to-transparent rounded-full blur-[80px] animate-aurora-3" />

                {/* Secondary ambient glow */}
                <div className="absolute top-[50%] left-[30%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-glow" />
            </div>

            {/* Geometric elements layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating orbs with glass effect */}
                <div className="absolute top-[8%] left-[8%] w-32 h-32 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm animate-float-orbit-1" />
                <div className="absolute bottom-[12%] right-[12%] w-24 h-24 rounded-full border border-muted-foreground/15 bg-muted/10 backdrop-blur-sm animate-float-orbit-2" />
                <div className="absolute top-[60%] left-[5%] w-20 h-20 rounded-full bg-gradient-to-br from-primary/15 to-transparent animate-float-orbit-3" />

                {/* Elegant rotating frames */}
                <div className="absolute top-[15%] right-[10%] w-40 h-40">
                    <div className="absolute inset-0 border-2 border-primary/15 rotate-45 animate-spin-elegant" />
                    <div className="absolute inset-4 border border-muted-foreground/10 rotate-45 animate-spin-elegant-reverse" />
                </div>

                <div className="absolute bottom-[20%] left-[12%] w-32 h-32">
                    <div className="absolute inset-0 border-2 border-muted-foreground/15 rotate-12 animate-spin-elegant" />
                    <div className="absolute inset-3 border border-primary/10 rotate-12 animate-spin-elegant-reverse" />
                </div>

                {/* Floating diamonds */}
                <div className="absolute top-[35%] right-[25%] w-8 h-8 bg-gradient-to-br from-primary/25 to-primary/5 rotate-45 animate-float-diamond" />
                <div className="absolute bottom-[40%] left-[20%] w-6 h-6 bg-gradient-to-tl from-muted-foreground/20 to-transparent rotate-45 animate-float-diamond-delay" />
                <div className="absolute top-[70%] right-[35%] w-4 h-4 bg-primary/30 rotate-45 animate-float-diamond" />

                {/* Glowing dots constellation */}
                <div className="absolute top-[25%] left-[35%] w-2 h-2 bg-primary/50 rounded-full animate-twinkle" />
                <div className="absolute top-[28%] left-[38%] w-1.5 h-1.5 bg-primary/40 rounded-full animate-twinkle-delay" />
                <div className="absolute top-[30%] left-[33%] w-1 h-1 bg-primary/60 rounded-full animate-twinkle" />

                <div className="absolute bottom-[35%] right-[28%] w-2 h-2 bg-muted-foreground/40 rounded-full animate-twinkle-delay" />
                <div className="absolute bottom-[32%] right-[32%] w-1.5 h-1.5 bg-primary/35 rounded-full animate-twinkle" />
                <div className="absolute bottom-[38%] right-[25%] w-1 h-1 bg-muted-foreground/50 rounded-full animate-twinkle-delay" />

                {/* Elegant lines */}
                <div className="absolute top-[45%] left-0 w-[20%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-line-slide" />
                <div className="absolute top-[55%] right-0 w-[25%] h-px bg-gradient-to-l from-transparent via-muted-foreground/15 to-transparent animate-line-slide-delay" />

                {/* Corner accents */}
                <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-primary/15 animate-corner-pulse" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-primary/15 animate-corner-pulse-delay" />
            </div>

            {/* Content */}
            <div className="w-full max-w-md p-4 relative z-10">
                {children}
            </div>

            {/* Animation styles */}
            <style jsx>{`
                @keyframes aurora-1 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
                    33% { transform: translate(5%, 3%) scale(1.05); opacity: 0.8; }
                    66% { transform: translate(-3%, 5%) scale(0.95); opacity: 0.5; }
                }
                @keyframes aurora-2 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
                    50% { transform: translate(-5%, -3%) scale(1.1); opacity: 0.7; }
                }
                @keyframes aurora-3 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.4; }
                    50% { transform: translate(3%, 5%) rotate(5deg); opacity: 0.6; }
                }
                @keyframes glow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.2); }
                }
                @keyframes float-orbit-1 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(20px, -30px) rotate(5deg); }
                    50% { transform: translate(40px, -10px) rotate(0deg); }
                    75% { transform: translate(20px, 20px) rotate(-5deg); }
                }
                @keyframes float-orbit-2 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(-30px, 20px) rotate(-8deg); }
                    66% { transform: translate(-15px, -25px) rotate(5deg); }
                }
                @keyframes float-orbit-3 {
                    0%, 100% { transform: translate(0, 0); opacity: 0.4; }
                    50% { transform: translate(25px, -35px); opacity: 0.7; }
                }
                @keyframes spin-elegant {
                    from { transform: rotate(45deg); }
                    to { transform: rotate(405deg); }
                }
                @keyframes spin-elegant-reverse {
                    from { transform: rotate(45deg); }
                    to { transform: rotate(-315deg); }
                }
                @keyframes float-diamond {
                    0%, 100% { transform: rotate(45deg) translateY(0); opacity: 0.5; }
                    50% { transform: rotate(45deg) translateY(-20px); opacity: 0.9; }
                }
                @keyframes float-diamond-delay {
                    0%, 100% { transform: rotate(45deg) translateY(0); opacity: 0.4; }
                    50% { transform: rotate(45deg) translateY(-15px); opacity: 0.8; }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.5); }
                }
                @keyframes twinkle-delay {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.2; transform: scale(0.8); }
                }
                @keyframes line-slide {
                    0%, 100% { opacity: 0; transform: translateX(-100%); }
                    50% { opacity: 1; transform: translateX(100%); }
                }
                @keyframes line-slide-delay {
                    0%, 100% { opacity: 0; transform: translateX(100%); }
                    50% { opacity: 1; transform: translateX(-100%); }
                }
                @keyframes corner-pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.8; }
                }
                @keyframes corner-pulse-delay {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.2; }
                }
                .animate-aurora-1 { animation: aurora-1 15s ease-in-out infinite; }
                .animate-aurora-2 { animation: aurora-2 12s ease-in-out infinite; }
                .animate-aurora-3 { animation: aurora-3 18s ease-in-out infinite; }
                .animate-glow { animation: glow 8s ease-in-out infinite; }
                .animate-float-orbit-1 { animation: float-orbit-1 12s ease-in-out infinite; }
                .animate-float-orbit-2 { animation: float-orbit-2 10s ease-in-out infinite; }
                .animate-float-orbit-3 { animation: float-orbit-3 8s ease-in-out infinite; }
                .animate-spin-elegant { animation: spin-elegant 30s linear infinite; }
                .animate-spin-elegant-reverse { animation: spin-elegant-reverse 25s linear infinite; }
                .animate-float-diamond { animation: float-diamond 4s ease-in-out infinite; }
                .animate-float-diamond-delay { animation: float-diamond-delay 5s ease-in-out infinite 0.5s; }
                .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
                .animate-twinkle-delay { animation: twinkle-delay 3s ease-in-out infinite 1s; }
                .animate-line-slide { animation: line-slide 8s ease-in-out infinite; }
                .animate-line-slide-delay { animation: line-slide-delay 10s ease-in-out infinite 2s; }
                .animate-corner-pulse { animation: corner-pulse 4s ease-in-out infinite; }
                .animate-corner-pulse-delay { animation: corner-pulse-delay 4s ease-in-out infinite 2s; }
            `}</style>
        </div>
    );
}
