"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, BookOpen, Plus, Trash2, Loader2, AlertCircle, GripVertical } from "lucide-react";

interface Parametro {
    nombre: string;
    unidad: string;
    valorRefMinH: string;
    valorRefMaxH: string;
    valorRefMinM: string;
    valorRefMaxM: string;
    valorCriticoMin: string;
    valorCriticoMax: string;
}

const categorias = [
    "Hematología",
    "Química Clínica",
    "Inmunología",
    "Uroanálisis",
    "Coagulación",
    "Microbiología",
    "Serología",
    "Hormonas",
    "Otros",
];

export default function NuevoCatalogoPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [categoria, setCategoria] = useState("");
    const [parametros, setParametros] = useState<Parametro[]>([
        {
            nombre: "",
            unidad: "",
            valorRefMinH: "",
            valorRefMaxH: "",
            valorRefMinM: "",
            valorRefMaxM: "",
            valorCriticoMin: "",
            valorCriticoMax: "",
        },
    ]);

    const addParametro = () => {
        setParametros([
            ...parametros,
            {
                nombre: "",
                unidad: "",
                valorRefMinH: "",
                valorRefMaxH: "",
                valorRefMinM: "",
                valorRefMaxM: "",
                valorCriticoMin: "",
                valorCriticoMax: "",
            },
        ]);
    };

    const removeParametro = (index: number) => {
        setParametros(parametros.filter((_, i) => i !== index));
    };

    const updateParametro = (index: number, field: keyof Parametro, value: string) => {
        const updated = [...parametros];
        updated[index][field] = value;
        setParametros(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validation
        if (!nombre.trim()) {
            setError("El nombre del estudio es requerido");
            setIsLoading(false);
            return;
        }

        if (parametros.length === 0 || !parametros.some(p => p.nombre.trim())) {
            setError("Debes agregar al menos un parámetro");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/catalogo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: nombre.trim(),
                    descripcion: descripcion.trim() || null,
                    categoria: categoria || null,
                    parametros: parametros
                        .filter(p => p.nombre.trim())
                        .map((p, index) => ({
                            ...p,
                            orden: index + 1,
                        })),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Error al crear estudio");
                return;
            }

            router.push("/catalogo");
            router.refresh();
        } catch {
            setError("Error de conexión. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

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
                    <Link href="/catalogo">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-light text-foreground flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-muted">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        Nuevo Tipo de Estudio
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Define un nuevo estudio con sus parámetros y rangos de referencia
                    </p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle>Información del Estudio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">
                                    Nombre del Estudio <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nombre"
                                    placeholder="Ej: Biometría Hemática Completa"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="categoria">Categoría</Label>
                                <select
                                    id="categoria"
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={categoria}
                                    onChange={(e) => setCategoria(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="">Seleccionar categoría...</option>
                                    {categorias.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Textarea
                                id="descripcion"
                                placeholder="Descripción breve del estudio..."
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Parameters */}
                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Parámetros del Estudio</CardTitle>
                            <CardDescription>
                                Define los parámetros con sus unidades y rangos de referencia
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addParametro}
                            disabled={isLoading}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {parametros.map((param, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-lg bg-muted/50 border border-border space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <GripVertical className="h-4 w-4" />
                                        <span className="text-sm font-medium">Parámetro {index + 1}</span>
                                    </div>
                                    {parametros.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeParametro(index)}
                                            disabled={isLoading}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Nombre *</Label>
                                        <Input
                                            placeholder="Ej: Glucosa"
                                            value={param.nombre}
                                            onChange={(e) => updateParametro(index, "nombre", e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Unidad</Label>
                                        <Input
                                            placeholder="Ej: mg/dL"
                                            value={param.unidad}
                                            onChange={(e) => updateParametro(index, "unidad", e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Rango Hombres (Min - Max)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Min"
                                                value={param.valorRefMinH}
                                                onChange={(e) => updateParametro(index, "valorRefMinH", e.target.value)}
                                                disabled={isLoading}
                                            />
                                            <span className="flex items-center text-muted-foreground">-</span>
                                            <Input
                                                placeholder="Max"
                                                value={param.valorRefMaxH}
                                                onChange={(e) => updateParametro(index, "valorRefMaxH", e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Rango Mujeres (Min - Max)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Min"
                                                value={param.valorRefMinM}
                                                onChange={(e) => updateParametro(index, "valorRefMinM", e.target.value)}
                                                disabled={isLoading}
                                            />
                                            <span className="flex items-center text-muted-foreground">-</span>
                                            <Input
                                                placeholder="Max"
                                                value={param.valorRefMaxM}
                                                onChange={(e) => updateParametro(index, "valorRefMaxM", e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" asChild disabled={isLoading}>
                        <Link href="/catalogo">Cancelar</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Crear Estudio
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
