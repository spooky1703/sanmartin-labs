import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Iniciando seed...");

    // Create Laboratory
    const laboratorio = await prisma.laboratorio.upsert({
        where: { id: "lab-demo-001" },
        update: {},
        create: {
            id: "lab-demo-001",
            nombre: "Laboratorio San Martín",
            direccion: "Av. Principal #123, Col. Centro, CP 12345",
            telefono: "+52 55 1234 5678",
            email: "contacto@labsanmartin.com",
            activo: true,
        },
    });

    console.log(`✅ Laboratorio creado: ${laboratorio.nombre}`);

    // Create Admin User
    const hashedPassword = await bcrypt.hash("admin123", 12);

    const admin = await prisma.usuario.upsert({
        where: { email: "admin@labsanmartin.com" },
        update: {},
        create: {
            email: "admin@labsanmartin.com",
            nombre: "Administrador",
            apellido: "Sistema",
            password: hashedPassword,
            rol: "ADMIN",
            laboratorioId: laboratorio.id,
            activo: true,
        },
    });

    console.log(`✅ Usuario admin creado: ${admin.email}`);

    // Create Supervisor User
    const supervisor = await prisma.usuario.upsert({
        where: { email: "supervisor@labsanmartin.com" },
        update: {},
        create: {
            email: "supervisor@labsanmartin.com",
            nombre: "María",
            apellido: "González",
            password: hashedPassword,
            rol: "SUPERVISOR",
            laboratorioId: laboratorio.id,
            activo: true,
        },
    });

    console.log(`✅ Usuario supervisor creado: ${supervisor.email}`);

    // Create Technician User
    const tecnico = await prisma.usuario.upsert({
        where: { email: "tecnico@labsanmartin.com" },
        update: {},
        create: {
            email: "tecnico@labsanmartin.com",
            nombre: "Juan",
            apellido: "Pérez",
            password: hashedPassword,
            rol: "TECNICO",
            laboratorioId: laboratorio.id,
            activo: true,
        },
    });

    console.log(`✅ Usuario técnico creado: ${tecnico.email}`);

    // Create Sample Patient
    const paciente1 = await prisma.paciente.upsert({
        where: {
            laboratorioId_folio: {
                laboratorioId: laboratorio.id,
                folio: "PAC-2024-001",
            },
        },
        update: {},
        create: {
            folio: "PAC-2024-001",
            nombre: "Carlos",
            apellidoPaterno: "Ramírez",
            apellidoMaterno: "López",
            fechaNacimiento: new Date("1985-03-15"),
            genero: "M",
            telefono: "+52 55 9876 5432",
            email: "carlos.ramirez@email.com",
            laboratorioId: laboratorio.id,
        },
    });

    console.log(`✅ Paciente creado: ${paciente1.nombre} ${paciente1.apellidoPaterno}`);

    // Create Sample Study - Biometría Hemática
    const estudio1 = await prisma.estudio.create({
        data: {
            pacienteId: paciente1.id,
            nombreEstudio: "Biometría Hemática Completa",
            fechaRealizacion: new Date(),
            observaciones: "Muestra tomada en ayuno de 8 horas",
            parametros: {
                create: [
                    { nombreParametro: "Hemoglobina", valor: "14.5", unidad: "g/dL", valorRefMin: "13.5", valorRefMax: "17.5", orden: 1 },
                    { nombreParametro: "Hematocrito", valor: "43", unidad: "%", valorRefMin: "40", valorRefMax: "52", orden: 2 },
                    { nombreParametro: "Eritrocitos", valor: "4.8", unidad: "mill/mm³", valorRefMin: "4.5", valorRefMax: "5.5", orden: 3 },
                    { nombreParametro: "Leucocitos", valor: "7200", unidad: "/mm³", valorRefMin: "4500", valorRefMax: "11000", orden: 4 },
                    { nombreParametro: "Plaquetas", valor: "245000", unidad: "/mm³", valorRefMin: "150000", valorRefMax: "400000", orden: 5 },
                    { nombreParametro: "VCM", valor: "89", unidad: "fL", valorRefMin: "80", valorRefMax: "100", orden: 6 },
                    { nombreParametro: "HCM", valor: "30", unidad: "pg", valorRefMin: "27", valorRefMax: "32", orden: 7 },
                ],
            },
        },
    });

    console.log(`✅ Estudio creado: ${estudio1.nombreEstudio}`);

    // Create Sample Study - Química Sanguínea
    const estudio2 = await prisma.estudio.create({
        data: {
            pacienteId: paciente1.id,
            nombreEstudio: "Química Sanguínea 6 Elementos",
            fechaRealizacion: new Date(),
            parametros: {
                create: [
                    { nombreParametro: "Glucosa", valor: "95", unidad: "mg/dL", valorRefMin: "70", valorRefMax: "100", orden: 1 },
                    { nombreParametro: "Urea", valor: "32", unidad: "mg/dL", valorRefMin: "15", valorRefMax: "45", orden: 2 },
                    { nombreParametro: "Creatinina", valor: "0.9", unidad: "mg/dL", valorRefMin: "0.7", valorRefMax: "1.3", orden: 3 },
                    { nombreParametro: "Ácido Úrico", valor: "5.8", unidad: "mg/dL", valorRefMin: "3.5", valorRefMax: "7.2", orden: 4 },
                    { nombreParametro: "Colesterol Total", valor: "185", unidad: "mg/dL", valorRefMin: "0", valorRefMax: "200", orden: 5 },
                    { nombreParametro: "Triglicéridos", valor: "142", unidad: "mg/dL", valorRefMin: "0", valorRefMax: "150", orden: 6 },
                ],
            },
        },
    });

    console.log(`✅ Estudio creado: ${estudio2.nombreEstudio}`);

    // Create Second Patient
    const paciente2 = await prisma.paciente.upsert({
        where: {
            laboratorioId_folio: {
                laboratorioId: laboratorio.id,
                folio: "PAC-2024-002",
            },
        },
        update: {},
        create: {
            folio: "PAC-2024-002",
            nombre: "Ana",
            apellidoPaterno: "Martínez",
            apellidoMaterno: "García",
            fechaNacimiento: new Date("1990-07-22"),
            genero: "F",
            telefono: "+52 55 1122 3344",
            laboratorioId: laboratorio.id,
        },
    });

    console.log(`✅ Paciente creado: ${paciente2.nombre} ${paciente2.apellidoPaterno}`);

    console.log("\n✨ Seed completado exitosamente!");
    console.log("\n📋 Credenciales de acceso:");
    console.log("   Email: admin@labsanmartin.com");
    console.log("   Password: admin123");
    console.log("\n   También puedes usar:");
    console.log("   - supervisor@labsanmartin.com / admin123");
    console.log("   - tecnico@labsanmartin.com / admin123");
}

main()
    .catch((e) => {
        console.error("❌ Error en seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
