# 🏡 Hacienda La Herrería - Web Application

[![Version](https://img.shields.io/badge/version-1.4.7-green.svg)](https://github.com/avargas2026/hacienda-la-herreria)
[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

Sistema de reservas y sitio web para Hacienda La Herrería, una propiedad rural en Silvania, Cundinamarca, Colombia.

## Versión Actual: v1.4.7

### Novedades v1.4.7:
- **Módulo de Feedback Automatizado**: Envío de correos post-estadía con tokens UUID seguros.
- **Moderación de Reseñas**: Panel administrativo para aprobar y destacar testimonios.
- **Social Proof dinámico**: Carrusel de testimonios integrado en las secciones clave del sitio.
- **Hero UI unificada**: Botones de "Reservar" y "Registrate" con estilo corporativo consistente.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar en desarrollo
npm run dev

# Abrir http://localhost:3000
```

## ✨ Características Principales

- 🌐 **Sitio Web Público** - Información completa de la propiedad
- 📅 **Sistema de Reservas** - Calendario interactivo con disponibilidad en tiempo real
- 🔐 **Panel de Administración** - Gestión completa de reservas y analytics
- 📧 **Confirmación Automática** - Emails profesionales vía Resend
- 📱 **Integración WhatsApp** - Notificaciones y contacto directo
- 📊 **Analytics** - Tracking de visitantes y métricas de conversión
- ✏️ **Gestión de Reservas** - Editar y eliminar con sincronización automática

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Emails**: Resend
- **Hosting**: Vercel

## 📚 Documentación Completa

Para documentación detallada, ver **[DOCUMENTATION.md](./DOCUMENTATION.md)**

Incluye:
- Guía de instalación y configuración
- Estructura del proyecto
- API Endpoints
- Esquema de base de datos
- Componentes principales
- Guía de uso para administradores
- Troubleshooting

## 🔧 Variables de Entorno

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Resend
RESEND_API_KEY=re_tu_api_key
```

## 📦 Scripts Disponibles

```bash
npm run dev      # Desarrollo (localhost:3000)
npm run build    # Build de producción
npm start        # Ejecutar build
npm run lint     # Linter
```

## 🌟 Funcionalidades v1.2.0

### Para Usuarios
- Explorar la propiedad y sus espacios
- Ver disponibilidad en tiempo real
- Hacer reservas con calendario interactivo
- Contacto directo por WhatsApp

### Para Administradores
- Dashboard con métricas y analytics
- Calendario de ocupación con código de colores
- **Editar reservas** con modal completo
- **Eliminar reservas** con confirmación
- Confirmar reservas y enviar emails automáticos
- Notificar clientes por WhatsApp
- Exportar datos a CSV
- Auto-sincronización cada 10 segundos

## 🚀 Deployment

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

### Manual

```bash
npm run build
npm start
```

## 📊 Base de Datos

### Tablas Supabase

- **visits** - Tracking de visitantes
- **bookings** - Reservas y solicitudes

Ver esquema completo en [DOCUMENTATION.md](./DOCUMENTATION.md#base-de-datos)

## 🔌 API Endpoints

- `POST /api/bookings/confirm` - Confirmar reserva y enviar email
- `PUT /api/bookings/update` - Actualizar reserva
- `DELETE /api/bookings/delete` - Eliminar reserva

## 📝 Changelog

### v1.4.7 (2026-03-03)
- ✨ **Módulo de Feedback & Reseñas**: Sistema de captura (Tokens UUID) y moderación administrativa.
- ✨ **Testimonios Dinámicos**: Carrusel premium integrado en Landing, Propiedad y Experiencia.
- ✨ **Hero UI Update**: Reorganización de CTAs con botones "Reservar" y "Registrate" unificados.
- ✨ **Optimización Local**: Configuración para pruebas de correos en localhost:3000.

### v1.4.6 (2026-03-03)
- ✨ **Modo Oscuro Global**: Integración de tema oscuro en encabezado, calendario y páginas internas.
- ✨ **Accesibilidad**: Cumplimiento de estándares WCAG 2.1 AA.
- ✨ **Admin UI**: Tablas optimizadas y gestión de usuarios enriquecida (IP/Geo).
- ✨ **Creación de Usuarios**: Módulo administrativo para dar de alta nuevos usuarios.

### v1.4.0 (2026-02-21)
- ✨ Integración completa con n8n y Chatwoot.
- ✨ Widget de chat omnicanal en el sitio web.
- ✨ Lógica de enriquecimiento de contactos (evita duplicados).
- ✨ Modo Oscuro (Dark Mode) en el CRM.

### v1.3.0 (2026-02-14)
- ✨ Páginas legales y Banner de Cookies.
- ✨ Lógica de reservas especiales.

### v1.1.1 (2026-02-12)
- 🐛 Fix: Persistencia de confirmaciones
- 🐛 Fix: Tracking de duración

### v1.1.0 (2026-02-11)
- ✨ Sistema de confirmación con emails
- ✨ Calendario de ocupación
- ✨ Exportar CSV

### v1.0.0 (2026-02-10)
- 🎉 Lanzamiento inicial

## 👥 Contacto

- **Email**: a.vargas@mrvargas.co
- **WhatsApp**: +57 315 032 2241
- **Repositorio**: [github.com/avargas2026/hacienda-la-herreria](https://github.com/avargas2026/hacienda-la-herreria)

## 📄 Licencia

Proyecto privado - Todos los derechos reservados © 2026 Hacienda La Herrería
