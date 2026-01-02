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
import { Eye, Edit, FileText, ClipboardList } from "lucide-react";

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
                <p className="text-slate-400 text-lg">No se encontraron pacientes</p>
                <p className="text-slate-500 mt-2">
                    Registra un nuevo paciente para comenzar
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-400">Folio</TableHead>
                        <TableHead className="text-slate-400">Nombre</TableHead>
                        <TableHead className="text-slate-400 hidden md:table-cell">Edad</TableHead>
                        <TableHead className="text-slate-400 hidden lg:table-cell">Género</TableHead>
                        <TableHead className="text-slate-400 hidden lg:table-cell">Estudios</TableHead>
                        <TableHead className="text-slate-400 hidden lg:table-cell">Reportes</TableHead>
                        <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pacientes.map((paciente) => (
                        <TableRow
                            key={paciente.id}
                            className="border-slate-800 hover:bg-slate-900/50"
                        >
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className="font-mono text-blue-400 border-blue-500/30 bg-blue-500/10"
                                >
                                    {paciente.folio}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-white font-medium">
                                {getNombreCompleto(paciente)}
                            </TableCell>
                            <TableCell className="text-slate-300 hidden md:table-cell">
                                {paciente.fechaNacimiento
                                    ? `${calculateAge(paciente.fechaNacimiento)} años`
                                    : "-"}
                            </TableCell>
                            <TableCell className="text-slate-300 hidden lg:table-cell">
                                {getGeneroLabel(paciente.genero)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center gap-1 text-slate-400">
                                    <ClipboardList className="h-4 w-4" />
                                    <span>{paciente._count?.estudios || 0}</span>
                                </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center gap-1 text-slate-400">
                                    <FileText className="h-4 w-4" />
                                    <span>{paciente._count?.reportes || 0}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                                    >
                                        <Link href={`/pacientes/${paciente.id}`}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                                    >
                                        <Link href={`/pacientes/${paciente.id}?edit=true`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
