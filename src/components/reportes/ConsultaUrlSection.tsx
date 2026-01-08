"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, Check, Copy, ExternalLink } from "lucide-react";

interface ConsultaUrlSectionProps {
    consultaUrl: string;
    folio: string;
}

export function ConsultaUrlSection({ consultaUrl, folio }: ConsultaUrlSectionProps) {
    const [copied, setCopied] = useState(false);
    const [copiedFolio, setCopiedFolio] = useState(false);
    const [fullUrl, setFullUrl] = useState("");

    useEffect(() => {
        setFullUrl(window.location.origin + consultaUrl);
    }, [consultaUrl]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Error al copiar:", err);
        }
    };

    const handleCopyFolio = async () => {
        try {
            await navigator.clipboard.writeText(folio);
            setCopiedFolio(true);
            setTimeout(() => setCopiedFolio(false), 2000);
        } catch (err) {
            console.error("Error al copiar folio:", err);
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Comparte este enlace con el paciente para que consulte sus resultados:
            </p>

            {/* Clickable Link Box */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Enlace directo de consulta</p>
                        <Link
                            href={consultaUrl}
                            target="_blank"
                            className="text-primary hover:underline font-medium text-sm break-all"
                        >
                            {fullUrl || consultaUrl}
                        </Link>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="shrink-0"
                    >
                        {copied ? (
                            <>
                                <Check className="mr-2 h-4 w-4 text-green-500" />
                                Copiado
                            </>
                        ) : (
                            <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copiar
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Folio Info */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                        <p className="text-xs text-muted-foreground">Folio del paciente (requerido para consultar)</p>
                        <p className="font-mono font-bold text-foreground text-lg">{folio}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyFolio}
                    className="shrink-0"
                >
                    {copiedFolio ? (
                        <>
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            Copiado
                        </>
                    ) : (
                        <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar
                        </>
                    )}
                </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href={consultaUrl} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir Consulta
                    </Link>
                </Button>
            </div>
        </div>
    );
}
