"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
    text: string;
    label?: string;
}

export function CopyButton({ text, label = "Copiar" }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Error al copiar:", err);
        }
    };

    return (
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
                    {label}
                </>
            )}
        </Button>
    );
}
