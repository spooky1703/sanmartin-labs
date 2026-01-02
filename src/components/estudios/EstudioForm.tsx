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
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Información del Estudio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="nombreEstudio" className="text-slate-300">
                                Nombre del Estudio <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="nombreEstudio"
                                placeholder="Ej: Biometría Hemática, Química Sanguínea"
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                {...register("nombreEstudio")}
                                disabled={isLoading}
                            />
                            {errors.nombreEstudio && (
                                <p className="text-sm text-red-400">{errors.nombreEstudio.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fechaRealizacion" className="text-slate-300">
                                Fecha de Realización <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="fechaRealizacion"
                                type="date"
                                className="bg-slate-800 border-slate-700 text-white"
                                {...register("fechaRealizacion")}
                                disabled={isLoading}
                            />
                            {errors.fechaRealizacion && (
                                <p className="text-sm text-red-400">{errors.fechaRealizacion.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observaciones" className="text-slate-300">
                            Observaciones
                        </Label>
                        <Textarea
                            id="observaciones"
                            placeholder="Notas adicionales sobre el estudio..."
                            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px]"
                            {...register("observaciones")}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Parameters */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">
                        Parámetros Medidos
                        {errors.parametros?.root && (
                            <span className="ml-2 text-sm font-normal text-red-400">
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
                        className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400">
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
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-5">
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-slate-400 text-xs">Nombre</Label>
                                    <Input
                                        placeholder="Ej: Glucosa"
                                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                        {...register(`parametros.${index}.nombreParametro`)}
                                        disabled={isLoading}
                                    />
                                    {errors.parametros?.[index]?.nombreParametro && (
                                        <p className="text-xs text-red-400">
                                            {errors.parametros[index].nombreParametro?.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-400 text-xs">Valor</Label>
                                    <Input
                                        placeholder="95"
                                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                        {...register(`parametros.${index}.valor`)}
                                        disabled={isLoading}
                                    />
                                    {errors.parametros?.[index]?.valor && (
                                        <p className="text-xs text-red-400">
                                            {errors.parametros[index].valor?.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-400 text-xs">Unidad</Label>
                                    <Input
                                        placeholder="mg/dL"
                                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                        {...register(`parametros.${index}.unidad`)}
                                        disabled={isLoading}
                                    />
                                    {errors.parametros?.[index]?.unidad && (
                                        <p className="text-xs text-red-400">
                                            {errors.parametros[index].unidad?.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-400 text-xs">Ref. (Min - Max)</Label>
                                    <div className="flex gap-1">
                                        <Input
                                            placeholder="70"
                                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                            {...register(`parametros.${index}.valorRefMin`)}
                                            disabled={isLoading}
                                        />
                                        <span className="flex items-center text-slate-500">-</span>
                                        <Input
                                            placeholder="100"
                                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
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
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
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
