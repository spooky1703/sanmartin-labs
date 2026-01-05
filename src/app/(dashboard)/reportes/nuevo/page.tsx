"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    FileText,
    AlertCircle,
    Loader2,
    User,
    Calendar,
    Check,
    ClipboardList,
} from "lucide-react";
import { formatForInput, getDefaultExpirationDate, formatDate } from "@/lib/utils";

interface Paciente {
    id: string;
    folio: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    estudios: Estudio[];
}

interface Estudio {
    id: string;
    nombreEstudio: string;
    fechaRealizacion: string;
    parametros: { id: string }[];
}

function NuevoReporteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pacienteIdParam = searchParams.get("pacienteId");

    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
    const [selectedEstudios, setSelectedEstudios] = useState<string[]>([]);
    const [fechaExpiracion, setFechaExpiracion] = useState(formatForInput(getDefaultExpirationDate()));
    const [emitidoPor, setEmitidoPor] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const response = await fetch("/api/pacientes?limit=100");
                const result = await response.json();

                if (response.ok && result.success) {
                    setPacientes(result.data.pacientes);

                    // If pacienteId is in URL, fetch that patient with studies
                    if (pacienteIdParam) {
                        const pacienteResponse = await fetch(`/api/pacientes/${pacienteIdParam}`);
                        const pacienteResult = await pacienteResponse.json();
                        if (pacienteResponse.ok && pacienteResult.success) {
                            setSelectedPaciente(pacienteResult.data);
                        }
                    }
                }
            } catch {
                setError("Error al cargar pacientes");
            } finally {
                setIsFetching(false);
            }
        };

        fetchPacientes();
    }, [pacienteIdParam]);

    const handleSelectPaciente = async (paciente: Paciente) => {
        try {
            const response = await fetch(`/api/pacientes/${paciente.id}`);
            const result = await response.json();

            if (response.ok && result.success) {
                setSelectedPaciente(result.data);
                setSelectedEstudios([]);
            }
        } catch {
            setError("Error al cargar paciente");
        }
    };

    const toggleEstudio = (estudioId: string) => {
        setSelectedEstudios((prev) =>
            prev.includes(estudioId)
                ? prev.filter((id) => id !== estudioId)
                : [...prev, estudioId]
        );
    };

    const handleSubmit = async () => {
        if (!selectedPaciente || selectedEstudios.length === 0) {
            setError("Selecciona un paciente y al menos un estudio");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/reportes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pacienteId: selectedPaciente.id,
                    estudiosIds: selectedEstudios,
                    fechaExpiracion,
                    emitidoPor,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Error al crear reporte");
                return;
            }

            router.push(`/reportes/${result.data.id}`);
            router.refresh();
        } catch {
            setError("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    const getNombreCompleto = (paciente: Paciente) => {
        return `${paciente.nombre} ${paciente.apellidoPaterno} ${paciente.apellidoMaterno || ""}`.trim();
    };

    const filteredPacientes = pacientes.filter(
        (p) =>
            p.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.apellidoPaterno.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                    className="text-muted-foreground hover:text-foreground"
                >
                    <Link href="/reportes">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-light text-foreground flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-muted">
                            <FileText className="h-5 w-5" />
                        </div>
                        Nuevo Reporte
                    </h1>
                    <p className="text-muted-foreground">Selecciona paciente y estudios para generar el reporte</p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Patient Selection */}
                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-muted">
                                <User className="h-4 w-4" />
                            </div>
                            1. Seleccionar Paciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedPaciente ? (
                            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-foreground font-medium">{getNombreCompleto(selectedPaciente)}</p>
                                        <Badge
                                            variant="outline"
                                            className="mt-1 font-mono"
                                        >
                                            {selectedPaciente.folio}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedPaciente(null);
                                            setSelectedEstudios([]);
                                        }}
                                        className="text-muted-foreground"
                                    >
                                        Cambiar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Input
                                    placeholder="Buscar por folio o nombre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="max-h-[300px] overflow-y-auto space-y-2">
                                    {filteredPacientes.map((paciente) => (
                                        <button
                                            key={paciente.id}
                                            onClick={() => handleSelectPaciente(paciente)}
                                            className="w-full p-3 text-left rounded-lg bg-muted/50 hover:bg-muted border border-border transition-colors"
                                        >
                                            <p className="text-foreground">{getNombreCompleto(paciente)}</p>
                                            <p className="text-sm text-muted-foreground">{paciente.folio}</p>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Studies Selection */}
                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-muted">
                                <ClipboardList className="h-4 w-4" />
                            </div>
                            2. Seleccionar Estudios
                            {selectedEstudios.length > 0 && (
                                <Badge className="ml-2">
                                    {selectedEstudios.length} seleccionado{selectedEstudios.length !== 1 ? "s" : ""}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!selectedPaciente ? (
                            <p className="text-muted-foreground text-center py-8">
                                Selecciona un paciente primero
                            </p>
                        ) : selectedPaciente.estudios?.length === 0 ? (
                            <div className="text-center py-8">
                                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">Este paciente no tiene estudios</p>
                                <Button
                                    variant="outline"
                                    asChild
                                    className="mt-4"
                                >
                                    <Link href={`/pacientes/${selectedPaciente.id}/estudios/nuevo`}>
                                        Agregar Estudio
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {selectedPaciente.estudios?.map((estudio) => {
                                    const isSelected = selectedEstudios.includes(estudio.id);
                                    return (
                                        <button
                                            key={estudio.id}
                                            onClick={() => toggleEstudio(estudio.id)}
                                            className={`w-full p-3 text-left rounded-lg border transition-colors ${isSelected
                                                ? "bg-primary/20 border-primary/50"
                                                : "bg-muted/50 border-border hover:bg-muted"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-foreground font-medium">{estudio.nombreEstudio}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDate(estudio.fechaRealizacion)} • {estudio.parametros.length} parámetros
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                                        <Check className="h-4 w-4 text-primary-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Expiration Date */}
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-muted">
                            <Calendar className="h-4 w-4" />
                        </div>
                        3. Fecha de Expiración
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-w-xs">
                        <Label className="text-foreground">El reporte será válido hasta:</Label>
                        <Input
                            type="date"
                            value={fechaExpiracion}
                            onChange={(e) => setFechaExpiracion(e.target.value)}
                            min={formatForInput(new Date())}
                            className="mt-2"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Emitido Por */}
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-muted">
                            <User className="h-4 w-4" />
                        </div>
                        4. Responsable del Reporte
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-w-md">
                        <Label htmlFor="emitidoPor" className="text-foreground">
                            Nombre completo del responsable:
                        </Label>
                        <Input
                            id="emitidoPor"
                            type="text"
                            placeholder="Ej: Dr. Juan Pérez García"
                            value={emitidoPor}
                            onChange={(e) => setEmitidoPor(e.target.value)}
                            className="mt-2"
                            maxLength={200}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Este nombre aparecerá en el PDF del reporte
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
                <Button variant="outline" asChild>
                    <Link href="/reportes">Cancelar</Link>
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !selectedPaciente || selectedEstudios.length === 0}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generando...
                        </>
                    ) : (
                        <>
                            <FileText className="mr-2 h-4 w-4" />
                            Emitir Reporte
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

export default function NuevoReportePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <NuevoReporteContent />
        </Suspense>
    );
}

