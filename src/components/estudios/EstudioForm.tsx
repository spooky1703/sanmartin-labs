"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { estudioSchema, type EstudioSchemaType } from "@/schemas/estudio.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Trash2, GripVertical, Sparkles, Search, BookOpen } from "lucide-react";
import { formatForInput, cn } from "@/lib/utils";
import { evaluarValor, getEstadoConfig, type EstadoParametro } from "@/lib/evaluarParametros";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CatalogoEstudio {
    id: string;
    nombre: string;
    descripcion?: string;
    categoria?: string;
}

interface PlantillaParametro {
    id: string;
    nombre: string;
    unidad: string;
    valorRefMinH?: string | null;
    valorRefMaxH?: string | null;
    valorRefMinM?: string | null;
    valorRefMaxM?: string | null;
    valorCriticoMin?: string | null;
    valorCriticoMax?: string | null;
    orden: number;
}

interface EstudioFormProps {
    onSubmit: (data: EstudioSchemaType) => Promise<void>;
    isLoading?: boolean;
    submitLabel?: string;
    pacienteGenero?: string | null;
}

export function EstudioForm({
    onSubmit,
    isLoading = false,
    submitLabel = "Guardar Estudio",
    pacienteGenero,
}: EstudioFormProps) {
    const [catalogoEstudios, setCatalogoEstudios] = useState<CatalogoEstudio[]>([]);
    const [catalogoAgrupado, setCatalogoAgrupado] = useState<Record<string, CatalogoEstudio[]>>({});
    const [loadingCatalogo, setLoadingCatalogo] = useState(true);
    const [selectedCatalogoId, setSelectedCatalogoId] = useState<string>("");
    const [loadingParametros, setLoadingParametros] = useState(false);
    const [modoManual, setModoManual] = useState(false);
    const [estadosParametros, setEstadosParametros] = useState<Record<number, EstadoParametro | null>>({});

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<EstudioSchemaType>({
        resolver: zodResolver(estudioSchema),
        defaultValues: {
            nombreEstudio: "",
            fechaRealizacion: formatForInput(new Date()),
            observaciones: "",
            parametros: [],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "parametros",
    });

    const watchedParametros = watch("parametros");

    // Cargar catálogo de estudios
    useEffect(() => {
        const fetchCatalogo = async () => {
            try {
                const response = await fetch("/api/catalogo");
                if (response.ok) {
                    const data = await response.json();
                    setCatalogoEstudios(data.catalogo);
                    setCatalogoAgrupado(data.agrupado);
                }
            } catch (error) {
                console.error("Error al cargar catálogo:", error);
            } finally {
                setLoadingCatalogo(false);
            }
        };
        fetchCatalogo();
    }, []);

    // Evaluar estado de parámetros cuando cambian los valores
    useEffect(() => {
        if (!watchedParametros) return;

        const nuevosEstados: Record<number, EstadoParametro | null> = {};
        watchedParametros.forEach((param, index) => {
            if (param.valor && param.valorRefMin && param.valorRefMax) {
                const estado = evaluarValor(param.valor, {
                    valorRefMin: param.valorRefMin,
                    valorRefMax: param.valorRefMax,
                });
                nuevosEstados[index] = estado;
            } else {
                nuevosEstados[index] = null;
            }
        });
        setEstadosParametros(nuevosEstados);
    }, [watchedParametros]);

    // Cargar parámetros del estudio seleccionado
    const handleCatalogoChange = async (catalogoId: string) => {
        setSelectedCatalogoId(catalogoId);

        if (!catalogoId) return;

        setLoadingParametros(true);
        try {
            const response = await fetch(`/api/catalogo/${catalogoId}`);
            if (response.ok) {
                const estudio = await response.json();

                // Actualizar nombre del estudio
                setValue("nombreEstudio", estudio.nombre);

                // Determinar rangos según género del paciente
                const esMujer = pacienteGenero?.toLowerCase() === "femenino" ||
                    pacienteGenero?.toLowerCase() === "f" ||
                    pacienteGenero?.toLowerCase() === "mujer";

                // Crear parámetros con valores predefinidos
                const nuevosParametros = estudio.parametros.map((p: PlantillaParametro, index: number) => ({
                    nombreParametro: p.nombre,
                    valor: "",
                    unidad: p.unidad,
                    valorRefMin: esMujer && p.valorRefMinM ? p.valorRefMinM : p.valorRefMinH || "",
                    valorRefMax: esMujer && p.valorRefMaxM ? p.valorRefMaxM : p.valorRefMaxH || "",
                    orden: index,
                }));

                replace(nuevosParametros);
            }
        } catch (error) {
            console.error("Error al cargar parámetros:", error);
        } finally {
            setLoadingParametros(false);
        }
    };

    const addParametro = () => {
        append({
            nombreParametro: "",
            valor: "",
            unidad: "",
            valorRefMin: "",
            valorRefMax: "",
            orden: fields.length,
        });
    };

    const getEstadoBadge = (index: number) => {
        const estado = estadosParametros[index];
        if (!estado) return null;

        const config = getEstadoConfig(estado);
        return (
            <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                config.bgColor,
                config.color
            )}>
                {config.icon} {config.label}
            </span>
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Study Selection */}
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Seleccionar Estudio
                    </CardTitle>
                    <CardDescription>
                        Elige un estudio del catálogo para cargar automáticamente los parámetros
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!modoManual && (
                        <div className="space-y-2">
                            <Label className="text-foreground">Tipo de Estudio</Label>
                            {loadingCatalogo ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Cargando catálogo...
                                </div>
                            ) : (
                                <Select
                                    value={selectedCatalogoId}
                                    onValueChange={handleCatalogoChange}
                                    disabled={isLoading || loadingParametros}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona un estudio del catálogo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(catalogoAgrupado).map(([categoria, estudios]) => (
                                            <SelectGroup key={categoria}>
                                                <SelectLabel className="font-semibold text-primary">
                                                    {categoria}
                                                </SelectLabel>
                                                {estudios.map((estudio) => (
                                                    <SelectItem key={estudio.id} value={estudio.id}>
                                                        {estudio.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}

                    {loadingParametros && (
                        <div className="flex items-center gap-2 text-primary p-3 rounded-lg bg-primary/10">
                            <Sparkles className="h-4 w-4 animate-pulse" />
                            Cargando parámetros automáticamente...
                        </div>
                    )}

                    <div className="flex items-center gap-4 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setModoManual(!modoManual);
                                if (!modoManual) {
                                    setSelectedCatalogoId("");
                                    setValue("nombreEstudio", "");
                                    replace([{
                                        nombreParametro: "",
                                        valor: "",
                                        unidad: "",
                                        valorRefMin: "",
                                        valorRefMax: "",
                                        orden: 0,
                                    }]);
                                }
                            }}
                            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                        >
                            {modoManual ? "← Usar catálogo" : "Ingresar estudio manualmente →"}
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Study Info */}
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle className="text-foreground">Información del Estudio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="nombreEstudio" className="text-foreground">
                                Nombre del Estudio <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="nombreEstudio"
                                placeholder="Ej: Biometría Hemática, Química Sanguínea"
                                {...register("nombreEstudio")}
                                disabled={isLoading || (!modoManual && !!selectedCatalogoId)}
                            />
                            {errors.nombreEstudio && (
                                <p className="text-sm text-destructive">{errors.nombreEstudio.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fechaRealizacion" className="text-foreground">
                                Fecha de Realización <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="fechaRealizacion"
                                type="date"
                                {...register("fechaRealizacion")}
                                disabled={isLoading}
                            />
                            {errors.fechaRealizacion && (
                                <p className="text-sm text-destructive">{errors.fechaRealizacion.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observaciones" className="text-foreground">
                            Observaciones
                        </Label>
                        <Textarea
                            id="observaciones"
                            placeholder="Notas adicionales sobre el estudio..."
                            className="min-h-[80px]"
                            {...register("observaciones")}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Parameters */}
            {fields.length > 0 && (
                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-foreground">
                                Parámetros Medidos
                                {errors.parametros?.root && (
                                    <span className="ml-2 text-sm font-normal text-destructive">
                                        {errors.parametros.root.message}
                                    </span>
                                )}
                            </CardTitle>
                            <CardDescription>
                                {!modoManual && selectedCatalogoId
                                    ? "Los rangos de referencia se cargaron automáticamente. Solo ingresa los valores."
                                    : "Ingresa los parámetros, valores y rangos de referencia."
                                }
                            </CardDescription>
                        </div>
                        {modoManual && (
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
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => {
                            const estadoConfig = getEstadoConfig(estadosParametros[index]);
                            return (
                                <div
                                    key={field.id}
                                    className={cn(
                                        "p-4 rounded-lg border space-y-4 transition-colors",
                                        estadosParametros[index]
                                            ? `${estadoConfig.bgColor} ${estadoConfig.borderColor}`
                                            : "bg-muted/50 border-border"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">
                                                {watchedParametros?.[index]?.nombreParametro || `Parámetro ${index + 1}`}
                                            </span>
                                            {getEstadoBadge(index)}
                                        </div>
                                        {modoManual && fields.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                disabled={isLoading}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-5">
                                        {modoManual && (
                                            <div className="md:col-span-2 space-y-2">
                                                <Label className="text-muted-foreground text-xs">Nombre</Label>
                                                <Input
                                                    placeholder="Ej: Glucosa"
                                                    {...register(`parametros.${index}.nombreParametro`)}
                                                    disabled={isLoading}
                                                />
                                                {errors.parametros?.[index]?.nombreParametro && (
                                                    <p className="text-xs text-destructive">
                                                        {errors.parametros[index].nombreParametro?.message}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <div className={cn("space-y-2", !modoManual && "md:col-span-2")}>
                                            <Label className="text-muted-foreground text-xs">Valor *</Label>
                                            <Input
                                                placeholder="95"
                                                className={cn(
                                                    "font-medium text-center",
                                                    estadosParametros[index] && estadoConfig.color
                                                )}
                                                {...register(`parametros.${index}.valor`)}
                                                disabled={isLoading}
                                            />
                                            {errors.parametros?.[index]?.valor && (
                                                <p className="text-xs text-destructive">
                                                    {errors.parametros[index].valor?.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground text-xs">Unidad</Label>
                                            <Input
                                                placeholder="mg/dL"
                                                {...register(`parametros.${index}.unidad`)}
                                                disabled={isLoading || (!modoManual && !!selectedCatalogoId)}
                                            />
                                        </div>

                                        <div className={cn("space-y-2", !modoManual && "md:col-span-2")}>
                                            <Label className="text-muted-foreground text-xs">Ref. (Min - Max)</Label>
                                            <div className="flex gap-1">
                                                <Input
                                                    placeholder="70"
                                                    {...register(`parametros.${index}.valorRefMin`)}
                                                    disabled={isLoading || (!modoManual && !!selectedCatalogoId)}
                                                />
                                                <span className="flex items-center text-muted-foreground">-</span>
                                                <Input
                                                    placeholder="100"
                                                    {...register(`parametros.${index}.valorRefMax`)}
                                                    disabled={isLoading || (!modoManual && !!selectedCatalogoId)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-4">
                <Button
                    type="submit"
                    disabled={isLoading || fields.length === 0}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        submitLabel
                    )}
                </Button>
            </div>
        </form>
    );
}
