"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";

interface PrintButtonProps {
    pdfUrl: string;
}

export function PrintButton({ pdfUrl }: PrintButtonProps) {
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = async () => {
        setIsPrinting(true);

        try {
            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Check if iframe already exists to avoid creating multiple
            let iframe = document.getElementById("print-iframe") as HTMLIFrameElement;

            if (!iframe) {
                iframe = document.createElement("iframe");
                iframe.id = "print-iframe";
                iframe.style.position = "fixed";
                iframe.style.right = "0";
                iframe.style.bottom = "0";
                iframe.style.width = "0";
                iframe.style.height = "0";
                iframe.style.border = "0";
                document.body.appendChild(iframe);
            }

            iframe.src = url;

            // Wait for load and print
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                    setIsPrinting(false);
                    // Do NOT remove the iframe or revoke URL immediately
                    // This prevents crashing if the print dialog is still open
                }, 1000);
            };

        } catch (error) {
            console.error("Error printing:", error);
            setIsPrinting(false);
            window.open(pdfUrl, "_blank");
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handlePrint}
            disabled={isPrinting}
        >
            <Printer className="mr-2 h-4 w-4" />
            {isPrinting ? "Preparando..." : "Imprimir"}
        </Button>
    );
}

