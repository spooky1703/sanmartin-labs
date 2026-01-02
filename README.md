# 🔬 Laboratorio San Martín - Sistema de Gestión de Resultados

Sistema web para la gestión de resultados de laboratorio clínico. Permite registrar pacientes, capturar estudios, emitir reportes con código QR y compartir resultados de forma segura.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)

---

## ✨ Características

- 👥 **Gestión de Pacientes** - CRUD completo con búsqueda y paginación
- 🧪 **Captura de Estudios** - Múltiples parámetros con valores de referencia
- 📄 **Reportes PDF** - Generación automática con código QR
- 🔒 **Acceso Seguro** - Autenticación con roles (Admin/Supervisor/Técnico)
- 🌐 **Consulta Pública** - Pacientes consultan resultados con folio + código QR
- 📱 **Compartir por WhatsApp** - Envío de resultados con un click
- 📝 **Auditoría** - Registro de todas las acciones del sistema

---

## 🏗️ Estructura del Proyecto

```
sanmartin-labs/
├── prisma/
│   ├── schema.prisma       # Modelos de base de datos
│   └── seed.ts             # Datos iniciales
├── src/
│   ├── app/                # Rutas (App Router)
│   │   ├── (auth)/         # Páginas de autenticación
│   │   │   └── login/
│   │   ├── (dashboard)/    # Páginas protegidas
│   │   │   ├── pacientes/
│   │   │   ├── estudios/
│   │   │   └── reportes/
│   │   ├── api/            # API Routes
│   │   │   ├── pacientes/
│   │   │   ├── estudios/
│   │   │   ├── reportes/
│   │   │   └── consulta/   # Endpoint público
│   │   └── consulta/       # Página pública de resultados
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Navbar, Sidebar
│   │   ├── pacientes/      # Formularios de pacientes
│   │   └── reportes/       # Componentes de reportes
│   ├── lib/                # Utilidades
│   │   ├── auth.ts         # Configuración NextAuth
│   │   ├── prisma.ts       # Cliente Prisma
│   │   ├── pdf-generator.tsx   # Generador de PDF
│   │   ├── qr-generator.ts     # Generador de QR
│   │   └── audit-service.ts    # Servicio de auditoría
│   └── schemas/            # Validaciones Zod
│       ├── paciente.schema.ts
│       ├── estudio.schema.ts
│       └── reporte.schema.ts
├── middleware.ts           # Protección de rutas
└── env.example             # Variables de entorno ejemplo
```

---

## 🚀 Instalación

### Requisitos
- Node.js 18+
- PostgreSQL (Railway, Neon, o local)

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/spooky1703/sanmartin-labs.git
cd sanmartin-labs

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp env.example .env
# Editar .env con tus valores

# 4. Crear tablas en la base de datos
npx prisma db push

# 5. Crear datos iniciales (laboratorio y usuarios)
npx tsx prisma/seed.ts

# 6. Iniciar servidor de desarrollo
npm run dev
```

---

## ⚙️ Variables de Entorno

```env
# Base de datos PostgreSQL
DATABASE_URL="postgres://usuario:password@host:5432/database"

# Autenticación
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera_con_openssl_rand_-base64_32"
```

---

## 👤 Credenciales de Prueba

Después de ejecutar el seed:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@labsanmartin.com | admin123 |
| Supervisor | supervisor@labsanmartin.com | admin123 |
| Técnico | tecnico@labsanmartin.com | admin123 |

---

## 📦 Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **Next.js 16** | Framework React con App Router |
| **TypeScript** | Tipado estático |
| **Tailwind CSS** | Estilos utilitarios |
| **shadcn/ui** | Componentes UI |
| **Prisma** | ORM para PostgreSQL |
| **NextAuth.js** | Autenticación |
| **@react-pdf/renderer** | Generación de PDF |
| **qrcode** | Códigos QR |
| **Zod** | Validación de datos |

---

## 🌐 Deploy

El proyecto está configurado para **Railway**:

1. Crear proyecto en [railway.app](https://railway.app)
2. Agregar PostgreSQL
3. Configurar variables de entorno
4. Push al repositorio conectado

---

## 📄 Licencia

MIT © 2025

---

Desarrollado con 💚 para laboratorios clínicos
