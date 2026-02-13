# 🚀 Manual de Operaciones y Mantenimiento - Hacienda La Herrería

**Versión**: 1.2.0
**Fecha**: Febrero 13, 2026
**Alcance**: Despliegue, Mantenimiento, Backup y Seguridad

---

## 📋 Índice

1. [Procedimientos de Backup](#procedimientos-de-backup)
2. [Guía de Solución de Problemas (Troubleshooting)](#guía-de-solución-de-problemas)
3. [Mantenimiento Preventivo](#mantenimiento-preventivo)
4. [Escalabilidad y Costos](#escalabilidad-y-costos)
5. [Seguridad Operativa](#seguridad-operativa)
6. [Contacto de Soporte](#contacto-de-soporte)

---

## 💾 Procedimientos de Backup

Aunque Supabase realiza backups automáticos en sus planes de pago, es fundamental tener una estrategia de respaldo manual, especialmente en el plan gratuito.

### 1. Respaldo de Base de Datos (Supabase)

**Frecuencia Recomendada**: Semanal (o antes de cambios importantes).

#### Opción A: Desde el Dashboard
1. Ingresa a [Supabase Dashboard](https://supabase.com/dashboard).
2. Selecciona tu proyecto.
3. Ve a **Database** -> **Backups**.
4. Si está disponible en tu plan, descarga el último backup.
5. Si no, ve a **Table Editor**, selecciona `bookings` y `visits`.
6. Haz clic en "Export as CSV" para cada tabla.
7. Guarda estos archivos en un lugar seguro (Google Drive, OneDrive, etc.).

#### Opción B: Vía SQL (Generar Script)
Ejecuta el siguiente comando en el SQL Editor de Supabase para obtener un dump de la estructura (schema):
```sql
-- No exporta datos, solo estructura. Útil para recrear tablas.
-- Copia y guarda el resultado.
SELECT 
    'CREATE TABLE ' || table_name || ' (' || 
    array_to_string(array_agg(column_name || ' ' || data_type), ', ') || 
    ');'
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name;
```

### 2. Respaldo del Código Fuente

**Frecuencia**: Continua (automático con Git).
**Repositorio**: [https://github.com/avargas2026/hacienda-la-herreria](https://github.com/avargas2026/hacienda-la-herreria)

**Buenas Prácticas**:
- Nunca realices cambios directos en el servidor (Vercel).
- Todo cambio debe pasar por un commit en Git.
- Usa `git tag` para marcar versiones estables (ej. `v1.2.0`).

---

## 🔧 Guía de Solución de Problemas (Troubleshooting)

### Caso 1: Los correos de confirmación no llegan

1.  **Verificar Logs en Vercel**:
    - Ve a tu proyecto en Vercel -> **Logs**.
    - Filtra por "api/bookings/confirm".
    - Busca errores rojos. Si ves "RESEND_API_KEY missing", falta la variable de entorno.

2.  **Verificar Estado del Dominio en Resend**:
    - Entra a [Resend Domains](https://resend.com/domains).
    - Asegúrate de que `laherreria.co` tenga los 3 checks verdes (Verified).
    - Si alguno está en amarillo (Pending), revisa tu configuración DNS.

3.  **Revisar SPAM**:
    - Pide al cliente que revise su carpeta de Spam o Promociones.

### Caso 2: El Calendario muestra fechas incorrectas

1.  **Zona Horaria**:
    - El servidor usa UTC por defecto. Asegúrate de que las fechas se guarden correctamente (YYYY-MM-DD).
    - Revisa en Supabase si la columna `start_date` tiene la fecha esperada.

2.  **Sincronización**:
    - Si acabas de confirmar una reserva y no aparece en rojo/verde en el calendario público, espera 10-20 segundos.
    - Intenta recargar la página (`Cmd+R` / `F5`).

### Caso 3: Error al subir cambios (Deploy fallido)

1.  **Revisar Build Logs**:
    - En Vercel, ve a **Deployments**.
    - Haz clic en el último deploy fallido (rojo).
    - Lee el error. Común: errores de TypeScript o variables de entorno faltantes.

2.  **Probar Build Local**:
    - Ejecuta `npm run build` en tu máquina local antes de subir cambios. Si falla localmente, fallará en Vercel.

---

## 🛠️ Mantenimiento Preventivo

### Checklist Mensual

- [ ] **Revisar espacio en Supabase**: Verificar que no estemos cerca del límite de 500MB (Dashboard -> Settings -> Usage).
- [ ] **Exportar CSVs**: Descargar backups de `bookings` y `visits`.
- [ ] **Actualizar Dependencias**: Ejecutar `npm outdated` localmente para ver si hay actualizaciones críticas de seguridad.
- [ ] **Verificar Vencimiento de Dominio**: Asegurar que `laherreria.co` no esté por vencer.

### Checklist Trimestral

- [ ] **Cambio de Contraseñas**: Rotar la contraseña de acceso al panel Admin y la de Supabase si es necesario.
- [ ] **Limpieza de Datos**: (Opcional) Archivar visitas muy antiguas (> 1 año) si la base de datos crece mucho.

---

## 📈 Escalabilidad y Costos

Actualmente el proyecto opera bajo la capa gratuita (**Free Tier**), lo cual es excelente para el inicio. Aquí los disparadores para considerar un upgrade:

| Recurso | Límite Actual (Free) | Plan Pro (Costo Aprox) | Disparador de Upgrade |
| :--- | :--- | :--- | :--- |
| **Base de Datos (Supabase)** | 500 MB | $25 USD/mes | Más de ~50,000 registros de visitas/reservas. |
| **Emails (Resend)** | 3,000/mes | $20 USD/mes | Si envías más de 100 correos diarios consistentemente. |
| **Hosting (Vercel)** | 100GB Bandwidth | $20 USD/mes | Si tienes tráfico viral masivo o subes muchas imágenes pesadas. |

**Recomendación**: Mantenerse en Free Tier por ahora. El sistema está optimizado para ser muy ligero.

---

## 🔒 Seguridad Operativa

1.  **Acceso Admin**:
    - El correo `a.vargas@mrvargas.co` es el **único** autorizado.
    - Si necesitas agregar otro administrador, debes modificar el código en `src/app/admin/page.tsx`.

2.  **Variables de Entorno**:
    - **NUNCA** compartas el archivo `.env.local` por WhatsApp o correo.
    - Si crees que tus claves se comprometieron, regeneralas en el panel de Supabase y Resend inmediatamente.

3.  **Datos Sensibles**:
    - El sistema no guarda tarjetas de crédito ni documentos de identidad sensibles, lo cual reduce el riesgo de cumplimiento normativo (PCI-DSS).

---

## 📞 Contacto de Soporte

Para incidencias técnicas que no puedas resolver con esta guía:

- **Desarrollador Responsable**: Antigravity AI
- **Email**: N/A (Sistema Automatizado)
- **Nivel de Servicio**: Código entregado "as-is" bajo licencia MIT.

Para problemas con servicios externos:
- **Estado de Vercel**: [vercel-status.com](https://www.vercel-status.com/)
- **Estado de Supabase**: [status.supabase.com](https://status.supabase.com/)
- **Estado de Resend**: [resend.com/status](https://resend.com/status)

---
**Fin del Documento**
