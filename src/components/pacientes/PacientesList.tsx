"use client";

import Link from "next/link";
import { formatDateShort, calculateAge } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ClipboardList } from "lucide-react";

interface Paciente {
    id: string;
    folio: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string | null;
    fechaNacimiento?: Date | string | null;
    genero?: string | null;
    telefono?: string | null;
    email?: string | null;
    createdAt: Date | string;
    _count?: {
        estudios: number;
        reportes: number;
    };
}

interface PacientesListProps {
    pacientes: Paciente[];
}

export function PacientesList({ pacientes }: PacientesListProps) {
    const getGeneroLabel = (genero?: string | null) => {
        switch (genero) {
            case "M":
                return "Masculino";
            case "F":
                return "Femenino";
            case "O":
                return "Otro";
            default:
                return "-";
        }
    };

    const getNombreCompleto = (paciente: Paciente) => {
        return `${paciente.nombre} ${paciente.apellidoPaterno} ${paciente.apellidoMaterno || ""}`.trim();
    };

    if (pacientes.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No se encontraron pacientes</p>
                <p className="text-muted-foreground/70 mt-2">
                    Registra un nuevo paciente para comenzar
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border overflow-hidden bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Folio</TableHead>
                        <TableHead className="text-muted-foreground">Nombre</TableHead>
                        <TableHead className="text-muted-foreground hidden md:table-cell">Edad</TableHead>
                        <TableHead className="text-muted-foreground hidden lg:table-cell">Género</TableHead>
                        <TableHead className="text-muted-foreground hidden lg:table-cell">Estudios</TableHead>
                        <TableHead className="text-muted-foreground hidden lg:table-cell">Reportes</TableHead>
                        <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pacientes.map((paciente) => (
                        <TableRow
                            key={paciente.id}
                            className="border-border hover:bg-muted/50"
                        >
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className="font-mono"
                                >
                                    {paciente.folio}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-foreground font-medium">
                                {getNombreCompleto(paciente)}
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden md:table-cell">
                                {paciente.fechaNacimiento
                                    ? `${calculateAge(paciente.fechaNacimiento)} años`
                                    : "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden lg:table-cell">
                                {getGeneroLabel(paciente.genero)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <ClipboardList className="h-4 w-4" />
                                    <span>{paciente._count?.estudios || 0}</span>
                                </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>{paciente._count?.reportes || 0}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <Link href={`/pacientes/${paciente.id}`}>
                                        <ClipboardList className="mr-2 h-4 w-4" />
                                        Ver Perfil
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

