"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pacienteSchema, type PacienteSchemaType } from "@/schemas/paciente.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { generateFolio } from "@/lib/utils";

interface PacienteFormProps {
    defaultValues?: Partial<PacienteSchemaType>;
    onSubmit: (data: PacienteSchemaType) => Promise<void>;
    isLoading?: boolean;
    submitLabel?: string;
}

export function PacienteForm({
    defaultValues,
    onSubmit,
    isLoading = false,
    submitLabel = "Guardar Paciente",
}: PacienteFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<PacienteSchemaType>({
        resolver: zodResolver(pacienteSchema),
        defaultValues: {
            folio: defaultValues?.folio || generateFolio(),
            nombre: defaultValues?.nombre || "",
            apellidoPaterno: defaultValues?.apellidoPaterno || "",
            apellidoMaterno: defaultValues?.apellidoMaterno || "",
            fechaNacimiento: defaultValues?.fechaNacimiento || "",
            genero: defaultValues?.genero || "",
            telefono: defaultValues?.telefono || "",
            email: defaultValues?.email || "",
        },
    });

    const genero = watch("genero");

    const regenerateFolio = () => {
        setValue("folio", generateFolio());
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Información del Paciente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Folio */}
                    <div className="space-y-2">
                        <Label htmlFor="folio" className="text-slate-300">
                            Folio <span className="text-red-400">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="folio"
                                className="bg-slate-800 border-slate-700 text-white"
                                {...register("folio")}
                                disabled={isLoading}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={regenerateFolio}
                                className="border-slate-700 hover:bg-slate-800"
                                disabled={isLoading}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                        {errors.folio && (
                            <p className="text-sm text-red-400">{errors.folio.message}</p>
                        )}
                    </div>

                    {/* Nombre completo */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="nombre" className="text-slate-300">
                                Nombre(s) <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="nombre"
                                placeholder="Juan"
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                {...register("nombre")}
                                disabled={isLoading}
                            />
                            {errors.nombre && (
                                <p className="text-sm text-red-400">{errors.nombre.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apellidoPaterno" className="text-slate-300">
                                Apellido Paterno <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="apellidoPaterno"
                                placeholder="Pérez"
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                {...register("apellidoPaterno")}
                                disabled={isLoading}
                            />
                            {errors.apellidoPaterno && (
                                <p className="text-sm text-red-400">{errors.apellidoPaterno.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apellidoMaterno" className="text-slate-300">
                                Apellido Materno
                            </Label>
                            <Input
                                id="apellidoMaterno"
                                placeholder="García"
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                {...register("apellidoMaterno")}
                                disabled={isLoading}
                            />
                            {errors.apellidoMaterno && (
                                <p className="text-sm text-red-400">{errors.apellidoMaterno.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Fecha de nacimiento y género */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fechaNacimiento" className="text-slate-300">
                                Fecha de Nacimiento
                            </Label>
                            <Input
                                id="fechaNacimiento"
                                type="date"
                                className="bg-slate-800 border-slate-700 text-white"
                                {...register("fechaNacimiento")}
                                disabled={isLoading}
                            />
                            {errors.fechaNacimiento && (
                                <p className="text-sm text-red-400">{errors.fechaNacimiento.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="genero" className="text-slate-300">
                                Género
                            </Label>
                            <Select
                                value={genero || ""}
                                onValueChange={(value) => setValue("genero", value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                    <SelectValue placeholder="Seleccionar género" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="M" className="text-white hover:bg-slate-700">Masculino</SelectItem>
                                    <SelectItem value="F" className="text-white hover:bg-slate-700">Femenino</SelectItem>
                                    <SelectItem value="O" className="text-white hover:bg-slate-700">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.genero && (
                                <p className="text-sm text-red-400">{errors.genero.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Contacto */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="telefono" className="text-slate-300">
                                Teléfono
                            </Label>
                            <Input
                                id="telefono"
                                type="tel"
                                placeholder="+52 55 1234 5678"
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                {...register("telefono")}
                                disabled={isLoading}
                            />
                            {errors.telefono && (
                                <p className="text-sm text-red-400">{errors.telefono.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="paciente@email.com"
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                {...register("email")}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-400">{errors.email.message}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
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
