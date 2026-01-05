"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PacienteForm } from "@/components/pacientes/PacienteForm";
import { PacienteSchemaType } from "@/schemas/paciente.schema";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, UserPlus, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NuevoPacientePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (data: PacienteSchemaType) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/pacientes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Error al crear paciente");
                return;
            }

            router.push(`/pacientes/${result.data.id}`);
            router.refresh();
        } catch {
            setError("Error de conexión. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-muted-foreground hover:text-foreground"
                >
                    <Link href="/pacientes">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-light text-foreground flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-muted">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        Nuevo Paciente
                    </h1>
                    <p className="text-muted-foreground">Registra un nuevo paciente en el sistema</p>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Form */}
            <PacienteForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                submitLabel="Crear Paciente"
            />
        </div>
    );
}

