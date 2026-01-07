import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from "@react-pdf/renderer";
import path from "path";

// Get absolute paths for images
const getImagePath = (filename: string) => {
    return path.join(process.cwd(), "public", "images", filename);
};

// Define styles
const styles = StyleSheet.create({
    page: {
        fontSize: 10,
        fontFamily: "Helvetica",
        padding: 0, // Remove default padding to allow full bleed background
    },
    backgroundContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backgroundImage: {
        width: "100%",
        height: "100%",
    },
    content: {
        padding: 40,
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: "#10b981",
    },
    logo: {
        width: 80,
        height: 80,
        objectFit: "contain",
    },
    labInfo: {
        flex: 1,
        marginLeft: 20,
    },
    labName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 4,
    },
    labDetails: {
        fontSize: 9,
        color: "#6b7280",
        marginBottom: 2,
    },
    reportTitle: {
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 5,
        color: "#1f2937",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    patientSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
        padding: 5,
    },
    patientInfoCol: {
        flex: 1,
    },
    patientRow: {
        flexDirection: "row",
        marginBottom: 4,
    },
    patientLabel: {
        fontWeight: "bold",
        width: 100,
        color: "#374151",
    },
    patientValue: {
        flex: 1,
        color: "#1f2937",
    },
    qrContainer: {
        alignItems: "center",
        marginLeft: 10,
        width: 80,
    },
    qrImage: {
        width: 60,
        height: 60,
    },
    qrText: {
        fontSize: 6,
        color: "#6b7280",
        marginTop: 2,
        textAlign: "center",
    },
    studySection: {
        marginBottom: 20,
    },
    studyHeader: {
        backgroundColor: "#10b981",
        padding: 8,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    studyTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#ffffff",
    },
    studyDate: {
        fontSize: 9,
        color: "#d1fae5",
        marginTop: 2,
    },
    table: {
        marginTop: 0,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderTopWidth: 0,
    },
    tableHeader: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        padding: 8,
    },
    tableHeaderCell: {
        fontWeight: "bold",
        color: "#374151",
        fontSize: 9,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        padding: 8,
    },
    tableRowAlt: {
        backgroundColor: "rgba(249, 250, 251, 0.5)",
    },
    tableCell: {
        fontSize: 9,
        color: "#1f2937",
    },
    colParametro: { flex: 3 },
    colValor: { flex: 2 },
    colUnidad: { flex: 1.5 },
    colReferencia: { flex: 2 },
    observaciones: {
        marginTop: 8,
        padding: 8,
        borderRadius: 4,
        fontSize: 9,
        color: "#92400e",
        borderWidth: 1,
        borderColor: "#fcd34d",
    },
    footerInfo: {
        fontSize: 8,
        color: "#9ca3af",
        marginTop: 10,
    },
    valueNormal: {
        color: "#059669",
    },
    valueHigh: {
        color: "#dc2626",
        fontWeight: "bold",
    },
    valueLow: {
        color: "#2563eb",
        fontWeight: "bold",
    },
    legend: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
        gap: 20,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 7,
        color: "#6b7280",
    },
    signatureSection: {
        position: "absolute",
        bottom: 80,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 20,
    },
    signatureImage: {
        width: 120,
        height: 50,
        objectFit: "contain",
        marginBottom: -10,
    },
    signatureLine: {
        borderTopWidth: 1,
        borderTopColor: "#1f2937",
        width: 250,
        marginBottom: 8,
    },
    signatureText: {
        fontSize: 8,
        color: "#6b7280",
        textAlign: "center",
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
});

interface Parametro {
    nombreParametro: string;
    valor: string;
    unidad: string;
    valorRefMin?: string | null;
    valorRefMax?: string | null;
}

interface Estudio {
    nombreEstudio: string;
    fechaRealizacion: Date | string;
    observaciones?: string | null;
    parametros: Parametro[];
}

interface ReportePDFProps {
    laboratorio: {
        nombre: string;
        direccion?: string | null;
        telefono?: string | null;
        email?: string | null;
        logo?: string | null;
    };
    paciente: {
        folio: string;
        nombre: string;
        apellidoPaterno: string;
        apellidoMaterno?: string | null;
        fechaNacimiento?: Date | string | null;
        genero?: string | null;
    };
    estudios: Estudio[];
    fechaEmision: Date | string;
    codigoAcceso: string;
    qrDataUrl: string;
    emitidoPor: string;
}

function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function getValueStyle(
    valor: string,
    min?: string | null,
    max?: string | null
) {
    const numValue = parseFloat(valor);
    if (isNaN(numValue)) return styles.tableCell;

    const numMin = min ? parseFloat(min) : null;
    const numMax = max ? parseFloat(max) : null;

    if (numMin !== null && numValue < numMin) {
        return { ...styles.tableCell, ...styles.valueLow };
    }
    if (numMax !== null && numValue > numMax) {
        return { ...styles.tableCell, ...styles.valueHigh };
    }
    if (numMin !== null || numMax !== null) {
        return { ...styles.tableCell, ...styles.valueNormal };
    }

    return styles.tableCell;
}

function getReferenceText(min?: string | null, max?: string | null): string {
    if (min && max) return `${min} - ${max}`;
    if (min) return `> ${min}`;
    if (max) return `< ${max}`;
    return "-";
}

function getNombreCompleto(paciente: ReportePDFProps["paciente"]): string {
    return `${paciente.nombre} ${paciente.apellidoPaterno} ${paciente.apellidoMaterno || ""}`.trim();
}

function calculateAge(fechaNacimiento?: Date | string | null): string {
    if (!fechaNacimiento) return "--";
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return `${age} años`;
}

function formatGenero(genero?: string | null): string {
    if (!genero) return "--";
    const g = genero.toLowerCase();
    if (g === "masculino" || g === "m" || g === "hombre") return "M";
    if (g === "femenino" || g === "f" || g === "mujer") return "F";
    return genero;
}

export function ReportePDF({
    laboratorio,
    paciente,
    estudios,
    fechaEmision,
    codigoAcceso,
    qrDataUrl,
    emitidoPor,
}: ReportePDFProps) {
    const logoPath = getImagePath("logo.png");
    const templatePath = getImagePath("plantilla.png");
    const firmaPath = getImagePath("firma.png");

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Background Template Image */}
                <View style={styles.backgroundContainer} fixed>
                    <Image style={styles.backgroundImage} src={templatePath} />
                </View>

                <View style={styles.content}>
                    {/* Header Space - logo and info are in the template */}
                    {/* Reduced spacing since we removed the title */}
                    <View style={{ height: 80 }} />

                    {/* Patient Info */}
                    {/* Patient Info and QR */}
                    <View style={styles.patientSection}>
                        {/* Left Column: Patient Info */}
                        <View style={styles.patientInfoCol}>
                            <View style={styles.patientRow}>
                                <Text style={styles.patientLabel}>Folio:</Text>
                                <Text style={styles.patientValue}>{paciente.folio}</Text>
                            </View>
                            <View style={styles.patientRow}>
                                <Text style={styles.patientLabel}>Paciente:</Text>
                                <Text style={styles.patientValue}>{getNombreCompleto(paciente)}</Text>
                            </View>
                            <View style={styles.patientRow}>
                                <Text style={styles.patientLabel}>Edad:</Text>
                                <Text style={styles.patientValue}>
                                    {calculateAge(paciente.fechaNacimiento)}          Sexo: {formatGenero(paciente.genero)}
                                </Text>
                            </View>
                            <View style={styles.patientRow}>
                                <Text style={styles.patientLabel}>Fecha Emisión:</Text>
                                <Text style={styles.patientValue}>{formatDate(fechaEmision)}</Text>
                            </View>
                        </View>

                        {/* Right Column: QR Code */}
                        <View style={styles.qrContainer}>
                            <Image style={styles.qrImage} src={qrDataUrl} />
                            <Text style={styles.qrText}>
                                Escanea para consultar
                            </Text>
                        </View>
                    </View>

                    {/* Studies */}
                    {estudios.map((estudio, idx) => (
                        <View key={idx} style={styles.studySection} wrap={false}>
                            <View style={styles.studyHeader}>
                                <Text style={styles.studyTitle}>{estudio.nombreEstudio}</Text>
                                <Text style={styles.studyDate}>
                                    Realizado: {formatDate(estudio.fechaRealizacion)}
                                </Text>
                            </View>

                            <View style={styles.table}>
                                {/* Table Header */}
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableHeaderCell, styles.colParametro]}>
                                        Parámetro
                                    </Text>
                                    <Text style={[styles.tableHeaderCell, styles.colValor]}>
                                        Resultado
                                    </Text>
                                    <Text style={[styles.tableHeaderCell, styles.colUnidad]}>
                                        Unidad
                                    </Text>
                                    <Text style={[styles.tableHeaderCell, styles.colReferencia]}>
                                        Referencia
                                    </Text>
                                </View>

                                {/* Table Rows */}
                                {estudio.parametros.map((param, pIdx) => (
                                    <View
                                        key={pIdx}
                                        style={[
                                            styles.tableRow,
                                            pIdx % 2 === 1 ? styles.tableRowAlt : {},
                                        ]}
                                    >
                                        <Text style={[styles.tableCell, styles.colParametro]}>
                                            {param.nombreParametro}
                                        </Text>
                                        <Text
                                            style={[
                                                getValueStyle(
                                                    param.valor,
                                                    param.valorRefMin,
                                                    param.valorRefMax
                                                ),
                                                styles.colValor,
                                            ]}
                                        >
                                            {param.valor}
                                        </Text>
                                        <Text style={[styles.tableCell, styles.colUnidad]}>
                                            {param.unidad}
                                        </Text>
                                        <Text style={[styles.tableCell, styles.colReferencia]}>
                                            {getReferenceText(param.valorRefMin, param.valorRefMax)}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {estudio.observaciones && (
                                <View style={styles.observaciones}>
                                    <Text>Observaciones: {estudio.observaciones}</Text>
                                </View>
                            )}
                        </View>
                    ))}

                    {/* Legend */}
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: "#059669" }]} />
                            <Text style={styles.legendText}>Normal</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: "#dc2626" }]} />
                            <Text style={styles.legendText}>Alto</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: "#2563eb" }]} />
                            <Text style={styles.legendText}>Bajo</Text>
                        </View>
                    </View>
                </View>

                {/* Signature Section - Fixed at page footer */}
                <View style={styles.signatureSection} fixed>
                    <Image style={styles.signatureImage} src={firmaPath} />
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureText}>FIRMA DE RESPONSABLE</Text>
                </View>

            </Page>
        </Document>
    );
}
