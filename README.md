# Lasería — MVP de reservas para centro de depilación láser

Aplicación web completa (landing + sistema de reservas + panel de cliente + panel administrativo con ventas, facturación y reportería) construida con Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Prisma y Auth.js (NextAuth v5).

## Empezar

Requiere un proyecto de Supabase (o cualquier Postgres) — ver "Desplegar en producción" más abajo para cómo crear uno y obtener `DATABASE_URL`/`DIRECT_URL`. Con esas variables ya en tu `.env`:

```bash
npm install
npx prisma db push       # crea las tablas del schema en tu base de Supabase/Postgres
npm run db:seed          # datos de prueba: servicios, empleados, productos, ventas, citas
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Cuentas de prueba

| Rol                  | Email                  | Contraseña        |
|-----------------------|------------------------|--------------------|
| Administrador          | admin@laseria.com      | Admin1234!         |
| Gerente                | gerente@laseria.com    | Gerente1234!       |
| Recepcionista / Cajero | recepcion@laseria.com  | Recepcion1234!     |
| Profesional            | camila@laseria.com     | Profesional1234!   |
| Clienta                | maria@example.com      | Cliente1234!       |
| Clienta                | ana@example.com        | Cliente1234!       |

`maria@example.com` tiene citas en distintos estados (próxima, pendiente, completadas, cancelada) para poder probar el dashboard sin reservar desde cero. Hay 4 ventas de ejemplo con NCF ya asignado para que Reportería tenga datos desde el primer arranque.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` / `npm run start` — build y arranque en producción
- `npm run db:seed` — repuebla los datos de prueba (borra y vuelve a crear)
- `npm run db:reset` — resetea la base de datos (`prisma db push --force-reset`) y siembra automáticamente

## Arquitectura

- **UI**: `src/app` (rutas), `src/components` (marketing, booking, dashboard, admin, ui primitivos)
- **Lógica de negocio**: `src/lib` — `availability.ts` (cálculo de horarios libres/ocupados), `booking.ts` (creación de citas con revalidación anti-doble-reserva), `sales.ts` (creación de ventas con asignación de NCF), `ncf.ts` (secuencias fiscales), `roles.ts` (matriz de permisos), `admin-data.ts`, `data.ts`
- **API**: `src/app/api/**/route.ts` — capa delgada que valida con Zod y delega en `src/lib`
- **Base de datos**: `prisma/schema.prisma` — Postgres vía Supabase, ver "Desplegar en producción" más abajo
- **Autenticación**: `src/auth.ts` (Auth.js, credenciales + JWT). `src/middleware.ts` protege `/dashboard` (solo clientas) y cada sección de `/admin` según el rol del usuario (ver más abajo)
- **Moneda**: toda la app usa pesos dominicanos (RD$). El formato vive en dos únicas funciones (`formatPrice`/`formatMoney` en `src/lib/utils.ts`, vía `Intl.NumberFormat("es-DO", { currency: "DOP" })`) — todo precio/monto en la UI pasa por ellas, así que cambiar de moneda es un edit de dos líneas. Los montos de ejemplo del seed (precios de tratamientos/productos, sueldos, pagos) están en cifras realistas de pesos dominicanos, no una conversión mecánica de los USD originales del primer borrador del MVP.

### Roles y privilegios

Todo el personal (`admin`, `manager`, `receptionist`, `professional`) vive en una sola tabla unificada de empleados (`Professional` en el schema — el nombre interno se mantuvo para no reescribir todo el motor de reservas que ya referenciaba `professionalId`; en la UI y en el código nuevo se llama "Empleados"). Cada empleado con acceso al panel tiene una cuenta de login vinculada.

La matriz de permisos vive en `src/lib/roles.ts` (`SECTION_ACCESS`) y se aplica en dos capas:

1. **`src/middleware.ts`** — antes de renderizar cualquier página de `/admin/*`, redirige si el rol no tiene acceso a esa sección.
2. **`src/lib/api-guards.ts` (`requireStaff`)** — cada ruta de API vuelve a validar el rol, así que aunque alguien manipule el cliente no puede saltarse la restricción.

| Sección                | Admin | Gerente | Recepcionista | Profesional |
|-------------------------|:-----:|:-------:|:--------------:|:-----------:|
| Dashboard                | ✓     | ✓       | ✓               | —           |
| Calendario               | ✓     | ✓       | ✓               | solo su propia agenda |
| Citas (gestión completa) | ✓     | ✓       | ✓               | —           |
| Clientes                 | ✓     | ✓       | ✓               | —           |
| Ventas / Facturación     | ✓     | ✓       | ✓               | —           |
| Caja (apertura/cierre)   | ✓     | ✓       | ✓               | —           |
| Productos                | ✓     | ✓       | ✓               | —           |
| Servicios                | ✓     | ✓       | —               | —           |
| Empleados                | ✓     | ✓ (no puede crear/editar admin o gerente) | — | — |
| Pagos / nómina           | ✓     | ✓       | —               | solo sus propios comprobantes |
| Reportes                 | ✓     | ✓       | —               | —           |
| Secuencias NCF           | ✓     | —       | —               | —           |

Un profesional que inicia sesión llega directamente a `/admin/calendario`, filtrado a sus propias citas, y solo puede marcarlas como completadas o no asistidas (no puede reprogramar, cambiar el pago ni ver el teléfono de otras citas). Desde **Mi perfil** cualquier empleado puede ver su propio historial de comprobantes de pago y abrirlos, aunque no tenga acceso a la sección de Pagos.

### Prevención de doble reserva

La disponibilidad que ve el cliente en el wizard es solo una guía. Cada creación/reprogramación de cita (`src/lib/booking.ts`, y los endpoints `PATCH` correspondientes) **vuelve a calcular** la disponibilidad justo antes de escribir en la base de datos, comparando contra las citas ya existentes de esa profesional en esa fecha. Si el horario ya no está libre, la API responde `409` y el cliente ve "Este horario acaba de ser reservado. Por favor selecciona otro."

### Cuentas automáticas al reservar / crear empleados

Si una clienta reserva sin haber iniciado sesión, el sistema crea automáticamente su cuenta (rol `customer`) con una contraseña temporal y la inicia sesión en el navegador al confirmar. Al crear un empleado desde **Empleados → Nuevo empleado**, el sistema genera igualmente una contraseña temporal que se muestra una sola vez para compartirla; ambos casos pueden cambiar su contraseña después desde su perfil, o usar "¿Olvidaste tu contraseña?".

### Ventas, facturación y NCF

- **Productos** (`/admin/productos`): catálogo de retail con SKU, precio, costo e inventario. Vender un producto descuenta su stock automáticamente; cancelar la venta lo restituye.
- **Ventas / POS** (`/admin/ventas/nueva`): carrito que combina productos y servicios, cliente existente o "al mostrador", descuento, método de pago y tipo de comprobante. El botón **Facturar cita** en el detalle de una cita (panel de Citas) precarga el carrito con los servicios de esa cita.
- **NCF (Número de Comprobante Fiscal, RD)**: `src/lib/ncf.ts` asigna el siguiente número de la secuencia configurada (B01 Crédito Fiscal o B02 Consumo) dentro de la misma transacción que crea la venta, así nunca se duplica ni se salta un número aunque haya ventas simultáneas. Los rangos autorizados se configuran en **Ventas → Secuencias NCF** (solo admin). Esto cubre la numeración correcta para emitir el comprobante — **no implementa el envío electrónico a la DGII (e-CF / formatos 606-607)**, ver Fase 2.
- **Reportería** (`/admin/reportes`): ingresos por período y método de pago, productos/servicios más vendidos, desempeño por empleado (citas completadas, ventas procesadas) e inventario bajo, con filtros de últimos 7/30/90 días.

### Empleados y nómina

- **Empleados** (`/admin/empleados`): además de los datos de contacto y el rol, cada empleado tiene **cédula** (única, opcional) y **sueldo mensual** — el sueldo se usa como monto sugerido al registrar un pago.
- **Pagos** (`/admin/pagos`, solo admin/gerente): registra pagos a empleados (salario, bono, adelanto u otro) indicando período, monto bruto, deducciones y método de pago; el neto se calcula automáticamente. Cada pago emite un comprobante numerado `COMP-XXXXXNNNN` (`src/lib/payroll.ts`) con el logo de Lasería, imprimible, que puede cancelarse (no se elimina, queda marcado como "Cancelado"). Este número es informativo/interno — no es un NCF ni sustituye ningún comprobante fiscal de nómina.
- Cada empleado ve sus propios comprobantes en **Mi perfil → Mis pagos** y puede abrir el detalle de cualquiera de los suyos (`/admin/pagos/[id]`), aunque su rol no tenga acceso a la sección Pagos — el middleware deja pasar esa ruta puntual y la página valida la propiedad del comprobante antes de mostrarlo.
- **Reportes → Nómina** (`/admin/reportes`): junto a ventas y desempeño, muestra el total pagado a empleados, el desglose por empleado y el listado de comprobantes del período seleccionado. Además de los presets (7 días / este mes / 90 días), el reporte tiene un buscador de **período personalizado** (desde/hasta) pensado para ubicar pagos cuyo período de nómina no coincide con un mes calendario; el filtro de nómina compara por **solape de período de pago** (`periodStart`/`periodEnd`), no por fecha de creación del comprobante.

### Caja (apertura/cierre de turno)

- **Caja** (`/admin/caja`, admin/gerente/recepcionista — el mismo público que Ventas): cada cajero abre su propia caja indicando el **fondo inicial**; mientras esté abierta, toda venta que ese usuario registre (`/admin/ventas/nueva`) queda automáticamente asociada a esa sesión (`Sale.cashSessionId`, `src/lib/sales.ts`) — no hay que marcarlo a mano.
- **Cierre**: el cajero cuenta el efectivo físico y lo compara contra el **efectivo esperado** (fondo inicial + ventas en efectivo del turno); el sistema calcula sobrante/faltante y lo deja registrado (`src/lib/cash-register.ts`). Solo puede haber una caja abierta por usuario a la vez.
- **Reporte por correo**: al cerrar, se envía un email (vía [Resend](https://resend.com), `src/lib/email.ts`) con el detalle del turno — total facturado, desglose por método de pago, arqueo de efectivo y el listado de ventas — al correo configurado en `CASH_REPORT_EMAIL`. Requiere `RESEND_API_KEY` en `.env` (ver `.env.example`); **si no está configurada, la caja se cierra igual** y el reporte queda marcado como "no se pudo enviar" en pantalla y en la base de datos (`CashSession.reportEmailStatus`), sin bloquear el cierre.
- Cada cajero solo ve/gestiona sus propias cajas en el historial; admin y gerente ven las de todo el equipo.

### PWA (instalable en el teléfono)

- **Manifest**: `src/app/manifest.ts` (convención nativa de Next.js — se sirve en `/manifest.webmanifest` y Next inyecta el `<link rel="manifest">` solo, sin tocar `layout.tsx`).
- **Íconos**: generados con `npm run icons` (`scripts/generate-pwa-icons.mjs`, usa `sharp`) a partir del ícono ya existente (`src/app/icon.png`, 512×512 con fondo transparente) — produce `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (con zona de seguridad para Android) y `src/app/apple-icon.png` (180×180, aplanado sobre el beige de marca porque iOS no respeta transparencia). Vuelve a correr el script si cambia el logo.
- **Service worker**: `public/sw.js` (registrado por `src/components/pwa/sw-register.tsx` en el layout raíz) — mínimo, solo lo necesario para que Chrome/Android consideren el sitio instalable; no implementa una app shell offline completa (esta app es inherentemente dependiente de datos en vivo — citas, disponibilidad, precios — cachear agresivamente arriesgaría mostrar información desactualizada).
- **Botón "Descargar app"** (`src/components/pwa/install-app-button.tsx`, usado en el hero de la página principal): en Android/Chrome dispara el prompt nativo de instalación (`beforeinstallprompt`); en iOS Safari (que no tiene esa API) muestra instrucciones para "Compartir → Agregar a inicio". Se oculta solo si la app ya está instalada (`display-mode: standalone`) o si el navegador no soporta ninguna de las dos vías (ej. Safari/Firefox de escritorio).

### Arte de tratamientos, productos y profesionales

Para no depender de fotos externas (enlaces rotos, licencias, hotlinking), el catálogo usa arte generado en el código (`TreatmentArt`, `ProfessionalAvatar`) con degradados e iconos dentro de la paleta de marca — reutilizado también para productos. En una segunda fase, sustituir `imageUrl`/`photoUrl` por URLs reales de fotografía de producto es un cambio acotado a esos componentes.

## Desplegar en producción (Supabase + Vercel)

La base de datos ya está configurada para Postgres vía Supabase (`prisma/schema.prisma` usa `url`/`directUrl` — ver el comentario al inicio de ese archivo para el porqué de las dos conexiones). No hay que separar el API en otro servicio: es un solo proyecto Next.js, y las rutas de `src/app/api/**` corren como funciones serverless de Vercel automáticamente.

### 1. Crear el proyecto en Supabase y obtener las conexiones
1. Crea una cuenta/proyecto en [supabase.com](https://supabase.com) (elige una contraseña de base de datos fuerte y guárdala).
2. En el proyecto: **Project Settings → Database → Connection string**.
3. Pestaña **Connection pooling** (puerto 6543, modo *Transaction*, termina en `?pgbouncer=true`) → esto es `DATABASE_URL`.
4. Pestaña **Direct connection** (puerto 5432) → esto es `DIRECT_URL`.
5. Pega ambas en tu `.env` local, reemplazando `[YOUR-PASSWORD]` por la contraseña real.

### 2. Crear las tablas en Supabase
```bash
npx prisma db push
```
Esto crea todas las tablas del schema directamente en la base de Supabase (usa `DIRECT_URL`; la conexión *pooled* no soporta los comandos de sesión que necesita `db push`/`migrate`).

Si quieres datos de ejemplo para probar antes de invitar usuarios reales:
```bash
npm run db:seed
```
⚠️ Esto crea las cuentas demo con contraseñas conocidas (`Admin1234!`, etc. — ver "Cuentas de prueba" arriba). No lo corras contra una base que vaya a quedar expuesta en producción real sin luego cambiar o eliminar esas cuentas.

### 3. Desplegar en Vercel
1. Importa el repo en [vercel.com/new](https://vercel.com/new).
2. En **Project Settings → Environment Variables**, define:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | la cadena *pooled* de Supabase (paso 1) |
   | `DIRECT_URL` | la cadena *direct* de Supabase (paso 1) |
   | `AUTH_SECRET` | genera uno **nuevo** con `npx auth secret` — no reutilices el de desarrollo |
   | `NEXTAUTH_URL` | tu dominio de producción, ej. `https://laseria.vercel.app` |
   | `RESEND_API_KEY`, `EMAIL_FROM`, `CASH_REPORT_EMAIL` | solo si quieres que Caja envíe el reporte de cierre por correo real |
3. Despliega. `package.json` tiene `"postinstall": "prisma generate"`, así que el cliente de Prisma se regenera en cada build de Vercel automáticamente.

### Nota sobre migraciones
Este proyecto usa `prisma db push` (sincroniza el schema directamente, sin archivos de migración) en vez de `prisma migrate`, consistente con cómo se construyó todo el schema hasta ahora. `npm run db:reset` hace `db push --force-reset` (borra y re-sincroniza) + re-siembra — útil en desarrollo, **nunca** correrlo contra la base de producción.

## Qué incluye este MVP

- Landing page completa (hero, beneficios, tratamientos destacados, cómo funciona, CTA, footer)
- Catálogo de tratamientos y precios
- Reserva en 6 pasos (tratamiento → profesional → fecha → hora → datos → confirmación) con disponibilidad real
- Registro/login/logout, recuperación de contraseña, rutas protegidas por rol
- Dashboard de cliente: resumen, mis citas (próximas/pasadas/canceladas), reprogramar, cancelar, perfil, cambio de contraseña
- Panel administrativo con **login por privilegios** (admin / gerente / recepcionista-cajero / profesional): dashboard con métricas, calendario (día/semana/mes), gestión de citas, clientes, servicios (CRUD), **empleados** (CRUD unificado con creación de cuentas de acceso, cédula y sueldo), **pagos/nómina** (registro de pagos con comprobante imprimible y vista de autoservicio "Mis pagos"), **productos** (CRUD + inventario), **ventas y facturación** (POS, comprobantes NCF, cancelación con reposición de stock), **caja** (apertura/cierre de turno por cajero, arqueo de efectivo y reporte de cierre por correo vía Resend), **reportería** (ventas, desempeño por empleado, nómina por período personalizado, inventario bajo)
- Diseño responsive, mobile-first en el flujo de reserva

## Fase 2 (fuera del alcance de este MVP, según lo acordado)

Programa de fidelización, membresías, paquetes de sesiones, gift cards, WhatsApp automatizado, pagos en línea reales (Stripe), envío electrónico de comprobantes a la DGII (e-CF, formatos 606/607), múltiples sucursales, app móvil nativa, CRM avanzado, marketing automation, envío real de emails/SMS (hoy las notificaciones se registran en la tabla `notifications` pero no se envían; la recuperación de contraseña muestra el enlace en pantalla en vez de enviarlo por correo).
