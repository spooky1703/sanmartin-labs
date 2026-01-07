import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ParametroTemplate {
    nombre: string;
    unidad: string;
    valorRefMinH: string | null;
    valorRefMaxH: string | null;
    valorRefMinM: string | null;
    valorRefMaxM: string | null;
    valorCriticoMin?: string;
    valorCriticoMax?: string;
}

interface EstudioCatalogo {
    nombre: string;
    descripcion: string;
    categoria: string;
    parametros: ParametroTemplate[];
}

// Catálogo de estudios clínicos comunes con sus parámetros
const catalogoEstudios: EstudioCatalogo[] = [
    {
        nombre: "Biometría Hemática Completa",
        descripcion: "Análisis completo de células sanguíneas",
        categoria: "Hematología",
        parametros: [
            { nombre: "Leucocitos", unidad: "10³/µL", valorRefMinH: "4.5", valorRefMaxH: "11.0", valorRefMinM: "4.5", valorRefMaxM: "11.0", valorCriticoMin: "2.0", valorCriticoMax: "30.0" },
            { nombre: "Eritrocitos", unidad: "10⁶/µL", valorRefMinH: "4.5", valorRefMaxH: "5.5", valorRefMinM: "4.0", valorRefMaxM: "5.0", valorCriticoMin: "2.0", valorCriticoMax: "8.0" },
            { nombre: "Hemoglobina", unidad: "g/dL", valorRefMinH: "13.5", valorRefMaxH: "17.5", valorRefMinM: "12.0", valorRefMaxM: "16.0", valorCriticoMin: "7.0", valorCriticoMax: "20.0" },
            { nombre: "Hematocrito", unidad: "%", valorRefMinH: "40", valorRefMaxH: "54", valorRefMinM: "36", valorRefMaxM: "48", valorCriticoMin: "20", valorCriticoMax: "60" },
            { nombre: "VCM", unidad: "fL", valorRefMinH: "80", valorRefMaxH: "100", valorRefMinM: "80", valorRefMaxM: "100" },
            { nombre: "HCM", unidad: "pg", valorRefMinH: "27", valorRefMaxH: "33", valorRefMinM: "27", valorRefMaxM: "33" },
            { nombre: "CMHC", unidad: "g/dL", valorRefMinH: "32", valorRefMaxH: "36", valorRefMinM: "32", valorRefMaxM: "36" },
            { nombre: "Plaquetas", unidad: "10³/µL", valorRefMinH: "150", valorRefMaxH: "400", valorRefMinM: "150", valorRefMaxM: "400", valorCriticoMin: "50", valorCriticoMax: "1000" },
            { nombre: "Neutrófilos", unidad: "%", valorRefMinH: "40", valorRefMaxH: "70", valorRefMinM: "40", valorRefMaxM: "70" },
            { nombre: "Linfocitos", unidad: "%", valorRefMinH: "20", valorRefMaxH: "45", valorRefMinM: "20", valorRefMaxM: "45" },
            { nombre: "Monocitos", unidad: "%", valorRefMinH: "2", valorRefMaxH: "10", valorRefMinM: "2", valorRefMaxM: "10" },
            { nombre: "Eosinófilos", unidad: "%", valorRefMinH: "1", valorRefMaxH: "6", valorRefMinM: "1", valorRefMaxM: "6" },
            { nombre: "Basófilos", unidad: "%", valorRefMinH: "0", valorRefMaxH: "2", valorRefMinM: "0", valorRefMaxM: "2" },
        ],
    },
    {
        nombre: "Química Sanguínea 6 Elementos",
        descripcion: "Panel básico de química clínica",
        categoria: "Química Clínica",
        parametros: [
            { nombre: "Glucosa", unidad: "mg/dL", valorRefMinH: "70", valorRefMaxH: "100", valorRefMinM: "70", valorRefMaxM: "100", valorCriticoMin: "40", valorCriticoMax: "400" },
            { nombre: "Urea", unidad: "mg/dL", valorRefMinH: "15", valorRefMaxH: "45", valorRefMinM: "15", valorRefMaxM: "45" },
            { nombre: "Creatinina", unidad: "mg/dL", valorRefMinH: "0.7", valorRefMaxH: "1.3", valorRefMinM: "0.6", valorRefMaxM: "1.1", valorCriticoMax: "10.0" },
            { nombre: "Ácido Úrico", unidad: "mg/dL", valorRefMinH: "3.5", valorRefMaxH: "7.2", valorRefMinM: "2.6", valorRefMaxM: "6.0" },
            { nombre: "Colesterol Total", unidad: "mg/dL", valorRefMinH: "0", valorRefMaxH: "200", valorRefMinM: "0", valorRefMaxM: "200" },
            { nombre: "Triglicéridos", unidad: "mg/dL", valorRefMinH: "0", valorRefMaxH: "150", valorRefMinM: "0", valorRefMaxM: "150" },
        ],
    },
    {
        nombre: "Química Sanguínea 12 Elementos",
        descripcion: "Panel completo de química clínica",
        categoria: "Química Clínica",
        parametros: [
            { nombre: "Glucosa", unidad: "mg/dL", valorRefMinH: "70", valorRefMaxH: "100", valorRefMinM: "70", valorRefMaxM: "100", valorCriticoMin: "40", valorCriticoMax: "400" },
            { nombre: "Urea", unidad: "mg/dL", valorRefMinH: "15", valorRefMaxH: "45", valorRefMinM: "15", valorRefMaxM: "45" },
            { nombre: "BUN", unidad: "mg/dL", valorRefMinH: "7", valorRefMaxH: "21", valorRefMinM: "7", valorRefMaxM: "21" },
            { nombre: "Creatinina", unidad: "mg/dL", valorRefMinH: "0.7", valorRefMaxH: "1.3", valorRefMinM: "0.6", valorRefMaxM: "1.1", valorCriticoMax: "10.0" },
            { nombre: "Ácido Úrico", unidad: "mg/dL", valorRefMinH: "3.5", valorRefMaxH: "7.2", valorRefMinM: "2.6", valorRefMaxM: "6.0" },
            { nombre: "Colesterol Total", unidad: "mg/dL", valorRefMinH: "0", valorRefMaxH: "200", valorRefMinM: "0", valorRefMaxM: "200" },
            { nombre: "Triglicéridos", unidad: "mg/dL", valorRefMinH: "0", valorRefMaxH: "150", valorRefMinM: "0", valorRefMaxM: "150" },
            { nombre: "Colesterol HDL", unidad: "mg/dL", valorRefMinH: "40", valorRefMaxH: "60", valorRefMinM: "50", valorRefMaxM: "60" },
            { nombre: "Colesterol LDL", unidad: "mg/dL", valorRefMinH: "0", valorRefMaxH: "100", valorRefMinM: "0", valorRefMaxM: "100" },
            { nombre: "Proteínas Totales", unidad: "g/dL", valorRefMinH: "6.0", valorRefMaxH: "8.3", valorRefMinM: "6.0", valorRefMaxM: "8.3" },
            { nombre: "Albúmina", unidad: "g/dL", valorRefMinH: "3.5", valorRefMaxH: "5.0", valorRefMinM: "3.5", valorRefMaxM: "5.0" },
            { nombre: "Globulinas", unidad: "g/dL", valorRefMinH: "2.0", valorRefMaxH: "3.5", valorRefMinM: "2.0", valorRefMaxM: "3.5" },
        ],
    },
    {
        nombre: "Perfil Hepático",
        descripcion: "Evaluación de función hepática",
        categoria: "Química Clínica",
        parametros: [
            { nombre: "Bilirrubina Total", unidad: "mg/dL", valorRefMinH: "0.1", valorRefMaxH: "1.2", valorRefMinM: "0.1", valorRefMaxM: "1.2" },
            { nombre: "Bilirrubina Directa", unidad: "mg/dL", valorRefMinH: "0.0", valorRefMaxH: "0.3", valorRefMinM: "0.0", valorRefMaxM: "0.3" },
            { nombre: "Bilirrubina Indirecta", unidad: "mg/dL", valorRefMinH: "0.1", valorRefMaxH: "0.9", valorRefMinM: "0.1", valorRefMaxM: "0.9" },
            { nombre: "TGO (AST)", unidad: "U/L", valorRefMinH: "10", valorRefMaxH: "40", valorRefMinM: "10", valorRefMaxM: "35" },
            { nombre: "TGP (ALT)", unidad: "U/L", valorRefMinH: "10", valorRefMaxH: "45", valorRefMinM: "10", valorRefMaxM: "35" },
            { nombre: "Fosfatasa Alcalina", unidad: "U/L", valorRefMinH: "40", valorRefMaxH: "130", valorRefMinM: "35", valorRefMaxM: "105" },
            { nombre: "GGT", unidad: "U/L", valorRefMinH: "10", valorRefMaxH: "71", valorRefMinM: "6", valorRefMaxM: "42" },
        ],
    },
    {
        nombre: "Perfil de Lípidos",
        descripcion: "Evaluación de grasas en sangre",
        categoria: "Química Clínica",
        parametros: [
            { nombre: "Colesterol Total", unidad: "mg/dL", valorRefMinH: "0", valorRefMaxH: "200", valorRefMinM: "0", valorRefMaxM: "200" },
            { nombre: "Triglicéridos", unidad: "mg/dL", valorRefMinH: "0", valorRefMaxH: "150", valorRefMinM: "0", valorRefMaxM: "150" },
            { nombre: "Colesterol HDL", unidad: "mg/dL", valorRefMinH: "40", valorRefMaxH: "60", valorRefMinM: "50", valorRefMaxM: "60" },
            { nombre: "Colesterol LDL", unidad: "mg/dL", valorRefMinH: "0", valorRefMaxH: "100", valorRefMinM: "0", valorRefMaxM: "100" },
            { nombre: "Colesterol VLDL", unidad: "mg/dL", valorRefMinH: "5", valorRefMaxH: "40", valorRefMinM: "5", valorRefMaxM: "40" },
            { nombre: "Índice Aterogénico", unidad: "", valorRefMinH: "0", valorRefMaxH: "4.5", valorRefMinM: "0", valorRefMaxM: "4.5" },
        ],
    },
    {
        nombre: "Perfil Tiroideo",
        descripcion: "Evaluación de función tiroidea",
        categoria: "Inmunología",
        parametros: [
            { nombre: "TSH", unidad: "µUI/mL", valorRefMinH: "0.4", valorRefMaxH: "4.0", valorRefMinM: "0.4", valorRefMaxM: "4.0" },
            { nombre: "T3 Total", unidad: "ng/dL", valorRefMinH: "80", valorRefMaxH: "200", valorRefMinM: "80", valorRefMaxM: "200" },
            { nombre: "T4 Libre", unidad: "ng/dL", valorRefMinH: "0.8", valorRefMaxH: "1.8", valorRefMinM: "0.8", valorRefMaxM: "1.8" },
            { nombre: "T4 Total", unidad: "µg/dL", valorRefMinH: "4.5", valorRefMaxH: "12.5", valorRefMinM: "4.5", valorRefMaxM: "12.5" },
        ],
    },
    {
        nombre: "Examen General de Orina",
        descripcion: "Análisis físico, químico y microscópico de orina",
        categoria: "Uroanálisis",
        parametros: [
            { nombre: "Color", unidad: "", valorRefMinH: null, valorRefMaxH: null, valorRefMinM: null, valorRefMaxM: null },
            { nombre: "Aspecto", unidad: "", valorRefMinH: null, valorRefMaxH: null, valorRefMinM: null, valorRefMaxM: null },
            { nombre: "Densidad", unidad: "", valorRefMinH: "1.005", valorRefMaxH: "1.030", valorRefMinM: "1.005", valorRefMaxM: "1.030" },
            { nombre: "pH", unidad: "", valorRefMinH: "5.0", valorRefMaxH: "8.0", valorRefMinM: "5.0", valorRefMaxM: "8.0" },
            { nombre: "Glucosa", unidad: "", valorRefMinH: null, valorRefMaxH: null, valorRefMinM: null, valorRefMaxM: null },
            { nombre: "Proteínas", unidad: "", valorRefMinH: null, valorRefMaxH: null, valorRefMinM: null, valorRefMaxM: null },
            { nombre: "Sangre", unidad: "", valorRefMinH: null, valorRefMaxH: null, valorRefMinM: null, valorRefMaxM: null },
            { nombre: "Leucocitos", unidad: "/campo", valorRefMinH: "0", valorRefMaxH: "5", valorRefMinM: "0", valorRefMaxM: "5" },
            { nombre: "Eritrocitos", unidad: "/campo", valorRefMinH: "0", valorRefMaxH: "3", valorRefMinM: "0", valorRefMaxM: "3" },
            { nombre: "Bacterias", unidad: "", valorRefMinH: null, valorRefMaxH: null, valorRefMinM: null, valorRefMaxM: null },
        ],
    },
    {
        nombre: "Hemoglobina Glicosilada (HbA1c)",
        descripcion: "Control de diabetes a largo plazo",
        categoria: "Química Clínica",
        parametros: [
            { nombre: "HbA1c", unidad: "%", valorRefMinH: "4.0", valorRefMaxH: "5.6", valorRefMinM: "4.0", valorRefMaxM: "5.6" },
        ],
    },
    {
        nombre: "Tiempo de Protrombina (TP)",
        descripcion: "Evaluación de coagulación",
        categoria: "Coagulación",
        parametros: [
            { nombre: "TP", unidad: "segundos", valorRefMinH: "11", valorRefMaxH: "13.5", valorRefMinM: "11", valorRefMaxM: "13.5" },
            { nombre: "INR", unidad: "", valorRefMinH: "0.8", valorRefMaxH: "1.2", valorRefMinM: "0.8", valorRefMaxM: "1.2" },
            { nombre: "Actividad", unidad: "%", valorRefMinH: "70", valorRefMaxH: "130", valorRefMinM: "70", valorRefMaxM: "130" },
        ],
    },
    {
        nombre: "Grupo Sanguíneo y Rh",
        descripcion: "Tipificación sanguínea",
        categoria: "Hematología",
        parametros: [
            { nombre: "Grupo Sanguíneo", unidad: "", valorRefMinH: null, valorRefMaxH: null, valorRefMinM: null, valorRefMaxM: null },
            { nombre: "Factor Rh", unidad: "", valorRefMinH: null, valorRefMaxH: null, valorRefMinM: null, valorRefMaxM: null },
        ],
    },
];

async function seedCatalogo() {
    console.log("🌱 Iniciando seed del catálogo de estudios...\n");

    for (const estudio of catalogoEstudios) {
        console.log(`📋 Creando: ${estudio.nombre}`);

        await prisma.catalogoEstudio.upsert({
            where: { nombre: estudio.nombre },
            update: {
                descripcion: estudio.descripcion,
                categoria: estudio.categoria,
            },
            create: {
                nombre: estudio.nombre,
                descripcion: estudio.descripcion,
                categoria: estudio.categoria,
                parametros: {
                    create: estudio.parametros.map((p, index) => ({
                        nombre: p.nombre,
                        unidad: p.unidad,
                        valorRefMinH: p.valorRefMinH,
                        valorRefMaxH: p.valorRefMaxH,
                        valorRefMinM: p.valorRefMinM,
                        valorRefMaxM: p.valorRefMaxM,
                        valorCriticoMin: p.valorCriticoMin || null,
                        valorCriticoMax: p.valorCriticoMax || null,
                        orden: index + 1,
                    })),
                },
            },
        });
    }

    console.log("\n✅ Catálogo de estudios creado exitosamente!");
    console.log(`   Total: ${catalogoEstudios.length} estudios`);
}

seedCatalogo()
    .catch((e) => {
        console.error("❌ Error al crear catálogo:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
