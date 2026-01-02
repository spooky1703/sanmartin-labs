"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PacienteForm } from "@/components/pacientes/PacienteForm";
import { PacienteSchemaType } from "@/schemas/paciente.schema";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, UserCog, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface EditarPacientePageProps {
    params: Promise<{ id: string }>;
}

interface Paciente {
    id: string;
    folio: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    fechaNacimiento?: string;
    genero?: string;
    telefono?: string;
    email?: string;
}

export default function EditarPacientePage({ params }: EditarPacientePageProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paciente, setPaciente] = useState<Paciente | null>(null);
    const [pacienteId, setPacienteId] = useState<string>("");

    useEffect(() => {
        const loadData = async () => {
            const { id } = await params;
            setPacienteId(id);

            try {
                const response = await fetch(`/api/pacientes/${id}`);
                const result = await response.json();

                if (!response.ok) {
                    setError(result.error || "Error al cargar paciente");
                    return;
                }

                setPaciente(result.data);
            } catch {
                setError("Error de conexión");
            } finally {
                setIsFetching(false);
            }
        };

        loadData();
    }, [params]);

    const handleSubmit = async (data: PacienteSchemaType) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/pacientes/${pacienteId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Error al actualizar paciente");
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

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!paciente) {
        return (
            <div className="space-y-6 max-w-3xl mx-auto">
                <Alert variant="destructive" className="bg-red-900/50 border-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Paciente no encontrado</AlertDescription>
                </Alert>
                <Button asChild>
                    <Link href="/pacientes">Volver a Pacientes</Link>
                </Button>
            </div>
        );
    }

    const formatDateForInput = (dateStr?: string | Date | null) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toISOString().split("T")[0];
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
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
                        <UserCog className="h-6 w-6 text-blue-500" />
                        Editar Paciente
                    </h1>
                    <p className="text-slate-400">
                        {paciente.nombre} {paciente.apellidoPaterno} - Folio: {paciente.folio}
                    </p>
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
            <PacienteForm
                defaultValues={{
                    folio: paciente.folio,
                    nombre: paciente.nombre,
                    apellidoPaterno: paciente.apellidoPaterno,
                    apellidoMaterno: paciente.apellidoMaterno || "",
                    fechaNacimiento: formatDateForInput(paciente.fechaNacimiento),
                    genero: paciente.genero || "",
                    telefono: paciente.telefono || "",
                    email: paciente.email || "",
                }}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                submitLabel="Guardar Cambios"
            />
        </div>
    );
}
