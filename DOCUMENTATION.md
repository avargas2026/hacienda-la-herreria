# 📚 Documentación - Hacienda La Herrería

**Versión**: 1.2.0  
**Última actualización**: Febrero 13, 2026  
**Repositorio**: [github.com/avargas2026/hacienda-la-herreria](https://github.com/avargas2026/hacienda-la-herreria)

---

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Tecnologías](#tecnologías)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Funcionalidades](#funcionalidades)
5. [Configuración](#configuración)
6. [Despliegue](#despliegue)
7. [API Endpoints](#api-endpoints)
8. [Base de Datos](#base-de-datos)
9. [Componentes Principales](#componentes-principales)
10. [Guía de Uso](#guía-de-uso)

---

## 🏡 Descripción General

Sitio web y sistema de gestión para **Hacienda La Herrería**, una propiedad rural en Silvania, Cundinamarca, Colombia. El proyecto incluye:

- **Sitio web público** con información de la propiedad
- **Sistema de reservas** con calendario interactivo
- **Panel de administración** con analytics y gestión de reservas
- **Sistema de confirmación** vía email y WhatsApp
- **Tracking de visitantes** y métricas de conversión

---

## 🛠️ Tecnologías

### Frontend
- **Next.js 14.1.0** - Framework React con SSR
- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **date-fns** - Manipulación de fechas
- **react-day-picker** - Calendario interactivo
- **Lucide React** - Iconos

### Backend & Servicios
- **Supabase** - Base de datos PostgreSQL + Auth
- **Resend** - Servicio de emails transaccionales
- **Vercel** - Hosting y deployment

### Librerías Adicionales
- **react-slick** - Carrusel de imágenes
- **clsx** / **tailwind-merge** - Utilidades CSS

---

## 📁 Estructura del Proyecto

```
laherreria-web/
├── src/
│   ├── app/                      # Rutas de Next.js (App Router)
│   │   ├── page.tsx             # Página principal
│   │   ├── layout.tsx           # Layout global
│   │   ├── admin/               # Panel de administración
│   │   ├── reservas/            # Sistema de reservas
│   │   ├── actividades/         # Página de actividades
│   │   ├── espacios/            # Página de espacios
│   │   ├── propiedad/           # Información de la propiedad
│   │   ├── experiencia/         # Experiencia del lugar
│   │   ├── login/               # Autenticación
│   │   ├── registro/            # Registro de usuarios
│   │   └── api/                 # API Routes
│   │       └── bookings/
│   │           ├── confirm/     # Confirmar reserva
│   │           ├── update/      # Actualizar reserva
│   │           └── delete/      # Eliminar reserva
│   │
│   ├── components/              # Componentes React
│   │   ├── Admin/              # Componentes del admin
│   │   │   ├── BookingCalendar.tsx
│   │   │   ├── ContactList.tsx
│   │   │   └── VisitorStats.tsx
│   │   ├── BookingForm.tsx
│   │   ├── ReservationCalendar.tsx
│   │   ├── VisitorTracker.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   └── WhatsAppButton.tsx
│   │
│   ├── lib/                     # Utilidades y configuración
│   │   ├── supabaseClient.ts   # Cliente Supabase (público)
│   │   ├── supabaseAdmin.ts    # Admin Supabase (server)
│   │   ├── whatsapp.ts         # Helpers WhatsApp
│   │   └── utils.ts            # Utilidades generales
│   │
│   └── context/                 # Contextos React
│       └── LanguageContext.tsx # Internacionalización
│
├── public/                      # Archivos estáticos
│   └── images/                 # Imágenes del sitio
│
├── .env.local                   # Variables de entorno
├── package.json                # Dependencias
├── tailwind.config.ts          # Configuración Tailwind
├── tsconfig.json               # Configuración TypeScript
└── README.md                   # Este archivo
```

---

## ✨ Funcionalidades

### 🌐 Sitio Web Público

#### Páginas
- **Home** (`/`) - Hero slider, introducción, llamados a la acción
- **Propiedad** (`/propiedad`) - Información detallada de la hacienda
- **Espacios** (`/espacios`) - Habitaciones y áreas disponibles
- **Actividades** (`/actividades`) - Actividades y experiencias
- **Experiencia** (`/experiencia`) - Testimonios y galería
- **Reservas** (`/reservas`) - Sistema de reservas con calendario

#### Características
- ✅ Diseño responsive (mobile-first)
- ✅ Navegación intuitiva con navbar sticky
- ✅ Carrusel de imágenes en hero
- ✅ Botón flotante de WhatsApp
- ✅ Footer con información de contacto
- ✅ Tracking automático de visitantes

### 📅 Sistema de Reservas

#### Calendario Público
- Visualización de disponibilidad
- Selección de rango de fechas
- Fechas bloqueadas (ya reservadas)
- Cálculo automático de noches
- Formulario de contacto integrado

#### Proceso de Reserva
1. Usuario selecciona fechas en calendario
2. Completa formulario (nombre, email, teléfono, huéspedes)
3. Ingresa valor total
4. Envía solicitud
5. Reserva queda como "Pendiente" en admin

### 🔐 Panel de Administración

**Ruta**: `/admin`  
**Acceso**: Solo `a.vargas@mrvargas.co`

#### Widgets Disponibles

##### 1. Estadísticas de Visitantes
- Total de visitas
- Visitantes únicos
- Tiempo promedio en sitio
- Tasa de conversión (visitas → reservas)
- Fuentes de tráfico (directo, redes sociales, etc.)
- Tabla de últimas visitas con:
  - Fecha y hora
  - Ubicación (ciudad, país)
  - IP
  - Dispositivo
  - Duración de visita
  - Paginación (10 registros por página)

##### 2. Calendario de Ocupación
- Vista mensual de reservas
- Código de colores:
  - 🟡 Amarillo: Pendiente
  - 🟢 Verde: Confirmada
  - ⚪ Blanco: Disponible
- Clic en fecha para ver detalles
- Botón "Confirmar Reserva y Enviar Correo"
- Botón "Notificar por WhatsApp"
- Auto-refresh cada 10 segundos

##### 3. Reporte de Contactos y Reservas
- Tabla completa de reservas
- Columnas:
  - Nombre
  - Email y teléfono
  - Fechas (inicio - fin)
  - Número de huéspedes
  - Total
  - Estado (badge)
  - **Acciones** (✏️ Editar, 🗑️ Eliminar)
- Botón "Actualizar"
- Botón "Exportar CSV"

#### Gestión de Reservas

##### Editar Reserva
1. Clic en ✏️ en la fila de la reserva
2. Modal con formulario editable:
   - Nombre
   - Email
   - Teléfono
   - Fecha inicio
   - Fecha fin
   - Huéspedes
   - Total
   - Estado (Pendiente/Confirmada)
3. Validación de datos
4. Guardar cambios
5. Sincronización automática con calendario

##### Eliminar Reserva
1. Clic en 🗑️ en la fila de la reserva
2. Modal de confirmación con advertencia
3. Muestra detalles de la reserva
4. Confirmación requerida
5. Eliminación permanente
6. Actualización automática del calendario

##### Confirmar Reserva
1. Desde calendario, clic en fecha reservada
2. Modal con detalles completos
3. Clic en "Confirmar Reserva y Enviar Correo"
4. Sistema:
   - Actualiza estado a "Confirmada"
   - Envía email profesional al cliente
   - Muestra feedback de éxito
5. Alternativa: "Notificar por WhatsApp"

### 📧 Sistema de Emails

**Servicio**: Resend  
**Dominio verificado**: `laherreria.co`  
**Remitente**: `reservas@laherreria.co`

#### Email de Confirmación
- Diseño profesional con HTML
- Saludo personalizado
- Fechas de reserva destacadas
- Valor total
- Información de contacto (WhatsApp)
- Branding de Hacienda La Herrería

#### Características
- ✅ Envío automático al confirmar
- ✅ Logging detallado en consola
- ✅ Manejo de errores robusto
- ✅ Backup con WhatsApp si falla

### 📱 Sistema WhatsApp

#### Botón Flotante
- Visible en todas las páginas
- Posición fija (bottom-right)
- Link directo a WhatsApp Business
- Número: `+57 315 032 2241`

#### Notificación desde Admin
- Mensaje pre-formateado con:
  - Saludo personalizado
  - Confirmación de reserva
  - Fechas
  - Valor total
  - Firma profesional
- Abre WhatsApp Web
- Admin puede editar antes de enviar

### 📊 Analytics y Tracking

#### VisitorTracker
- Componente invisible en layout
- Registra automáticamente:
  - IP del visitante
  - Ubicación (ciudad, país)
  - Dispositivo (tipo, navegador)
  - Fuente de tráfico (referrer)
  - Duración de visita
  - Secciones visitadas
- Actualización periódica cada 30 segundos

#### Métricas Calculadas
- Tasa de conversión: `(reservas / visitas) × 100`
- Tiempo promedio en sitio
- Distribución de fuentes de tráfico
- Visitantes únicos vs totales

---

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env.local` en la raíz:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Resend
RESEND_API_KEY=re_tu_api_key
```

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/avargas2026/hacienda-la-herreria.git
cd hacienda-la-herreria

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar en desarrollo
npm run dev

# Abrir en navegador
# http://localhost:3000
```

### Configuración de Supabase

#### 1. Crear Proyecto
- Ir a [supabase.com](https://supabase.com)
- Crear nuevo proyecto
- Copiar URL y API keys

#### 2. Crear Tablas

##### Tabla: `visits`
```sql
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip TEXT,
    city TEXT,
    country TEXT,
    device TEXT,
    referrer TEXT,
    duration INTEGER DEFAULT 0,
    sections_visited TEXT[]
);
```

##### Tabla: `bookings`
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    guests INTEGER DEFAULT 2,
    total TEXT,
    status TEXT DEFAULT 'pending'
);
```

#### 3. Configurar RLS (Row Level Security)

```sql
-- Permitir lectura pública de bookings (para calendario)
CREATE POLICY "Allow public read access" ON bookings
FOR SELECT USING (true);

-- Permitir inserción pública (para formulario de reservas)
CREATE POLICY "Allow public insert" ON bookings
FOR INSERT WITH CHECK (true);

-- Permitir escritura desde service role (admin)
-- (No crear política, usar supabaseAdmin en backend)
```

### Configuración de Resend

#### 1. Crear Cuenta
- Ir a [resend.com](https://resend.com)
- Crear cuenta gratuita
- Obtener API Key

#### 2. Verificar Dominio
1. Ir a "Domains" en dashboard
2. Agregar dominio: `laherreria.co`
3. Configurar registros DNS:
   - TXT para verificación
   - MX para recepción
   - CNAME para DKIM
4. Esperar verificación (5-30 min)

#### 3. Límites Plan Gratuito
- 100 emails/día
- 3,000 emails/mes
- Suficiente para empezar

---

## 🚀 Despliegue

### Vercel (Recomendado)

#### Deployment Automático
1. Conectar repositorio GitHub a Vercel
2. Configurar variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
3. Deploy automático en cada push a `main`

#### Deployment Manual
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Build Local

```bash
# Crear build de producción
npm run build

# Ejecutar build
npm start
```

---

## 🔌 API Endpoints

### POST `/api/bookings/confirm`

Confirma una reserva y envía email de confirmación.

**Request Body:**
```json
{
  "bookingId": "uuid",
  "email": "cliente@example.com",
  "name": "Juan Pérez",
  "dates": "2024-03-15 - 2024-03-20",
  "total": "$350,000"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking confirmed",
  "emailSent": true
}
```

**Funcionalidad:**
- Actualiza estado de reserva a "confirmed"
- Envía email profesional al cliente
- Retorna status de envío de email

---

### PUT `/api/bookings/update`

Actualiza una reserva existente.

**Request Body:**
```json
{
  "id": "uuid",
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+57 300 123 4567",
  "start_date": "2024-03-15",
  "end_date": "2024-03-20",
  "guests": 4,
  "total": "$350,000",
  "status": "confirmed"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* booking actualizado */ }
}
```

**Validaciones:**
- ID requerido
- Campos obligatorios (nombre, email, fechas)
- Fecha fin > fecha inicio
- Formato de email válido

---

### DELETE `/api/bookings/delete`

Elimina una reserva permanentemente.

**Request Body:**
```json
{
  "id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

**Nota:** Acción irreversible.

---

## 🗄️ Base de Datos

### Esquema Supabase

#### Tabla: `visits`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Primary key |
| `created_at` | TIMESTAMP | Fecha/hora de visita |
| `ip` | TEXT | Dirección IP |
| `city` | TEXT | Ciudad del visitante |
| `country` | TEXT | País del visitante |
| `device` | TEXT | Tipo de dispositivo |
| `referrer` | TEXT | Fuente de tráfico |
| `duration` | INTEGER | Duración en segundos |
| `sections_visited` | TEXT[] | Array de secciones |

#### Tabla: `bookings`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Primary key |
| `created_at` | TIMESTAMP | Fecha de creación |
| `start_date` | DATE | Fecha de check-in |
| `end_date` | DATE | Fecha de check-out |
| `name` | TEXT | Nombre del huésped |
| `email` | TEXT | Email de contacto |
| `phone` | TEXT | Teléfono |
| `guests` | INTEGER | Número de huéspedes |
| `total` | TEXT | Valor total |
| `status` | TEXT | Estado (pending/confirmed) |

---

## 🧩 Componentes Principales

### `VisitorTracker`
- **Ubicación**: `src/components/VisitorTracker.tsx`
- **Propósito**: Tracking automático de visitantes
- **Características**:
  - Detecta IP y ubicación
  - Registra duración de visita
  - Actualiza cada 30 segundos
  - Invisible para el usuario

### `BookingForm`
- **Ubicación**: `src/components/BookingForm.tsx`
- **Propósito**: Formulario de reservas
- **Características**:
  - Integración con calendario
  - Validación de campos
  - Guardado en Supabase
  - Feedback visual

### `ReservationCalendar`
- **Ubicación**: `src/components/ReservationCalendar.tsx`
- **Propósito**: Calendario público de disponibilidad
- **Características**:
  - Muestra fechas disponibles/ocupadas
  - Selección de rango
  - Leyenda visual
  - Responsive

### `BookingCalendar` (Admin)
- **Ubicación**: `src/components/Admin/BookingCalendar.tsx`
- **Propósito**: Calendario de gestión para admin
- **Características**:
  - Vista mensual
  - Código de colores por estado
  - Modal de detalles
  - Confirmación de reservas
  - Auto-refresh (10s)

### `ContactList` (Admin)
- **Ubicación**: `src/components/Admin/ContactList.tsx`
- **Propósito**: Tabla de gestión de reservas
- **Características**:
  - Listado completo
  - Edición inline con modal
  - Eliminación con confirmación
  - Exportar a CSV
  - Actualización manual

### `VisitorStats` (Admin)
- **Ubicación**: `src/components/Admin/VisitorStats.tsx`
- **Propósito**: Dashboard de analytics
- **Características**:
  - Métricas clave
  - Tabla de visitas
  - Paginación
  - Exportar CSV

---

## 📖 Guía de Uso

### Para Administradores

#### Acceder al Panel
1. Ir a `/login`
2. Ingresar con `a.vargas@mrvargas.co`
3. Automáticamente redirige a `/admin`

#### Gestionar Reservas

**Ver reservas pendientes:**
- En "Calendario de Ocupación", fechas en amarillo
- En "Reporte de Contactos", badge "Pendiente"

**Confirmar reserva:**
1. Clic en fecha en calendario
2. Revisar detalles en modal
3. Clic en "Confirmar Reserva y Enviar Correo"
4. Cliente recibe email automáticamente

**Editar reserva:**
1. En "Reporte de Contactos", clic en ✏️
2. Modificar campos necesarios
3. Guardar cambios
4. Calendario se actualiza automáticamente

**Eliminar reserva:**
1. En "Reporte de Contactos", clic en 🗑️
2. Confirmar eliminación
3. Reserva desaparece del calendario

**Notificar por WhatsApp:**
1. Desde modal de reserva
2. Clic en "📱 Notificar por WhatsApp"
3. WhatsApp Web se abre con mensaje
4. Editar si necesario y enviar

#### Exportar Datos
- **Visitas**: Botón "Exportar CSV" en VisitorStats
- **Reservas**: Botón "Exportar CSV" en ContactList

### Para Usuarios

#### Hacer una Reserva
1. Ir a `/reservas`
2. Seleccionar fechas en calendario
3. Completar formulario:
   - Nombre completo
   - Email
   - Teléfono
   - Número de huéspedes
   - Valor total
4. Enviar solicitud
5. Esperar confirmación por email

#### Contacto Directo
- **WhatsApp**: Botón flotante en todas las páginas
- **Teléfono**: +57 315 032 2241
- **Email**: Formulario de contacto

---

## 🔧 Mantenimiento

### Actualizar Dependencias
```bash
npm update
```

### Revisar Logs
- **Vercel**: Dashboard → Logs
- **Supabase**: Dashboard → Logs
- **Resend**: Dashboard → Logs

### Backup de Base de Datos
- Supabase hace backups automáticos
- Exportar manualmente: Dashboard → Database → Backup

---

## 📊 Métricas y KPIs

### Métricas Disponibles
- Total de visitas
- Visitantes únicos
- Tiempo promedio en sitio
- Tasa de conversión
- Fuentes de tráfico
- Total de reservas
- Reservas confirmadas vs pendientes

### Cómo Mejorar Conversión
1. Revisar fuentes de tráfico más efectivas
2. Analizar tiempo en sitio
3. Optimizar páginas con bajo engagement
4. Responder rápido a reservas pendientes

---

## 🐛 Troubleshooting

### Emails no llegan
1. Verificar `RESEND_API_KEY` en `.env.local`
2. Confirmar dominio verificado en Resend
3. Revisar carpeta de spam
4. Usar botón WhatsApp como alternativa

### Calendario no se actualiza
1. Esperar 10 segundos (auto-refresh)
2. Clic en "Actualizar" manualmente
3. Refrescar página del navegador

### Error al editar/eliminar
1. Verificar `SUPABASE_SERVICE_ROLE_KEY`
2. Revisar permisos RLS en Supabase
3. Verificar logs en consola del navegador

---

## 📝 Changelog

### v1.2.0 (2026-02-13)
- ✨ Sistema de gestión de reservas (editar/eliminar)
- ✨ Auto-refresh en calendario (10s)
- 🐛 Corrección de envío de emails con dominio verificado
- ✨ Sistema de respaldo con WhatsApp

### v1.1.1 (2026-02-12)
- 🐛 Fix: Persistencia de confirmación de reservas
- 🐛 Fix: Tracking de duración de visitas

### v1.1.0 (2026-02-11)
- ✨ Sistema de confirmación con emails
- ✨ Calendario de ocupación en admin
- ✨ Exportar datos a CSV

### v1.0.0 (2026-02-10)
- 🎉 Lanzamiento inicial
- ✨ Sitio web público
- ✨ Sistema de reservas
- ✨ Panel de administración
- ✨ Analytics de visitantes

---

## 👥 Contacto

**Desarrollador**: Antigravity AI  
**Cliente**: Hacienda La Herrería  
**Email Admin**: a.vargas@mrvargas.co  
**WhatsApp**: +57 315 032 2241

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados © 2026 Hacienda La Herrería
