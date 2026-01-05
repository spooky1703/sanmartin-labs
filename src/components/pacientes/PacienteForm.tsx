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
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle className="text-foreground">Información del Paciente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Folio */}
                    <div className="space-y-2">
                        <Label htmlFor="folio" className="text-foreground">
                            Folio <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="folio"
                                {...register("folio")}
                                disabled={isLoading}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={regenerateFolio}
                                disabled={isLoading}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                        {errors.folio && (
                            <p className="text-sm text-destructive">{errors.folio.message}</p>
                        )}
                    </div>

                    {/* Nombre completo */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="nombre" className="text-foreground">
                                Nombre(s) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="nombre"
                                placeholder="Juan"
                                {...register("nombre")}
                                disabled={isLoading}
                            />
                            {errors.nombre && (
                                <p className="text-sm text-destructive">{errors.nombre.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apellidoPaterno" className="text-foreground">
                                Apellido Paterno <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="apellidoPaterno"
                                placeholder="Pérez"
                                {...register("apellidoPaterno")}
                                disabled={isLoading}
                            />
                            {errors.apellidoPaterno && (
                                <p className="text-sm text-destructive">{errors.apellidoPaterno.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apellidoMaterno" className="text-foreground">
                                Apellido Materno
                            </Label>
                            <Input
                                id="apellidoMaterno"
                                placeholder="García"
                                {...register("apellidoMaterno")}
                                disabled={isLoading}
                            />
                            {errors.apellidoMaterno && (
                                <p className="text-sm text-destructive">{errors.apellidoMaterno.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Fecha de nacimiento y género */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fechaNacimiento" className="text-foreground">
                                Fecha de Nacimiento
                            </Label>
                            <Input
                                id="fechaNacimiento"
                                type="date"
                                {...register("fechaNacimiento")}
                                disabled={isLoading}
                            />
                            {errors.fechaNacimiento && (
                                <p className="text-sm text-destructive">{errors.fechaNacimiento.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="genero" className="text-foreground">
                                Género
                            </Label>
                            <Select
                                value={genero || ""}
                                onValueChange={(value) => setValue("genero", value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar género" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">Masculino</SelectItem>
                                    <SelectItem value="F">Femenino</SelectItem>
                                    <SelectItem value="O">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.genero && (
                                <p className="text-sm text-destructive">{errors.genero.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Contacto */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="telefono" className="text-foreground">
                                Teléfono
                            </Label>
                            <Input
                                id="telefono"
                                type="tel"
                                placeholder="+52 55 1234 5678"
                                {...register("telefono")}
                                disabled={isLoading}
                            />
                            {errors.telefono && (
                                <p className="text-sm text-destructive">{errors.telefono.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="paciente@email.com"
                                {...register("email")}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>
                    </div>
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

