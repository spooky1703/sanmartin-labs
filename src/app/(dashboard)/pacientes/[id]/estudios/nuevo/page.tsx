"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EstudioForm } from "@/components/estudios/EstudioForm";
import { EstudioSchemaType } from "@/schemas/estudio.schema";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ClipboardList, AlertCircle, User } from "lucide-react";
import Link from "next/link";

interface Paciente {
    id: string;
    folio: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
}

export default function NuevoEstudioPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const [pacienteId, setPacienteId] = useState<string>("");
    const [paciente, setPaciente] = useState<Paciente | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPaciente = async () => {
            const { id } = await params;
            setPacienteId(id);

            try {
                const response = await fetch(`/api/pacientes/${id}`);
                const result = await response.json();

                if (response.ok && result.success) {
                    setPaciente(result.data);
                } else {
                    setError("No se pudo cargar la información del paciente");
                }
            } catch {
                setError("Error de conexión");
            } finally {
                setIsFetching(false);
            }
        };

        fetchPaciente();
    }, [params]);

    const handleSubmit = async (data: EstudioSchemaType) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/estudios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    pacienteId,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Error al crear estudio");
                return;
            }

            router.push(`/pacientes/${pacienteId}`);
            router.refresh();
        } catch {
            setError("Error de conexión. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const getNombreCompleto = () => {
        if (!paciente) return "";
        return `${paciente.nombre} ${paciente.apellidoPaterno} ${paciente.apellidoMaterno || ""}`.trim();
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-slate-400 hover:text-white"
                >
                    <Link href={`/pacientes/${pacienteId}`}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ClipboardList className="h-6 w-6 text-blue-500" />
                        Nuevo Estudio
                    </h1>
                    {paciente && (
                        <div className="flex items-center gap-2 mt-1">
                            <User className="h-4 w-4 text-slate-500" />
                            <span className="text-slate-400">{getNombreCompleto()}</span>
                            <Badge
                                variant="outline"
                                className="font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                            >
                                {paciente.folio}
                            </Badge>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Form */}
            <EstudioForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                submitLabel="Crear Estudio"
            />
        </div>
    );
}
