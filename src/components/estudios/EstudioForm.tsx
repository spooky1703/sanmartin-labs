"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { estudioSchema, type EstudioSchemaType } from "@/schemas/estudio.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { formatForInput } from "@/lib/utils";

interface EstudioFormProps {
    onSubmit: (data: EstudioSchemaType) => Promise<void>;
    isLoading?: boolean;
    submitLabel?: string;
}

export function EstudioForm({
    onSubmit,
    isLoading = false,
    submitLabel = "Guardar Estudio",
}: EstudioFormProps) {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<EstudioSchemaType>({
        resolver: zodResolver(estudioSchema),
        defaultValues: {
            nombreEstudio: "",
            fechaRealizacion: formatForInput(new Date()),
            observaciones: "",
            parametros: [
                {
                    nombreParametro: "",
                    valor: "",
                    unidad: "",
                    valorRefMin: "",
                    valorRefMax: "",
                    orden: 0,
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "parametros",
    });

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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                                disabled={isLoading}
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
            <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-foreground">
                        Parámetros Medidos
                        {errors.parametros?.root && (
                            <span className="ml-2 text-sm font-normal text-destructive">
                                {errors.parametros.root.message}
                            </span>
                        )}
                    </CardTitle>
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
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="p-4 rounded-lg bg-muted/50 border border-border space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <GripVertical className="h-4 w-4" />
                                    <span className="text-sm font-medium">Parámetro {index + 1}</span>
                                </div>
                                {fields.length > 1 && (
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

                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs">Valor</Label>
                                    <Input
                                        placeholder="95"
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
                                        disabled={isLoading}
                                    />
                                    {errors.parametros?.[index]?.unidad && (
                                        <p className="text-xs text-destructive">
                                            {errors.parametros[index].unidad?.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs">Ref. (Min - Max)</Label>
                                    <div className="flex gap-1">
                                        <Input
                                            placeholder="70"
                                            {...register(`parametros.${index}.valorRefMin`)}
                                            disabled={isLoading}
                                        />
                                        <span className="flex items-center text-muted-foreground">-</span>
                                        <Input
                                            placeholder="100"
                                            {...register(`parametros.${index}.valorRefMax`)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button
                    type="submit"
                    disabled={isLoading}
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

