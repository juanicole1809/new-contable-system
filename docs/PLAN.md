# Contable Software - Plan de Desarrollo

## Objetivo
Reemplazar los flujos de trabajo de Google Apps Script con una aplicación full-stack de contabilidad.

## Enfoque Actual: MVP (Minimum Viable Product)
Empezamos simple: **facturas + OCR de Redconar**. Lo demás se agrega después.

---

## Arquitectura

```
┌─────────────────────────────────────┐
│         Next.js Frontend            │
│    (upload PDF + mostrar datos)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Next.js API Routes             │
│   /api/facturas/upload              │
└──────┬──────────────────┬───────────┘
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│  Supabase    │   │  Redconar    │
│  (facturas)  │   │  OCR API     │
└──────────────┘   └──────────────┘
```

### Flujo de Datos
1. Usuario sube PDF → Next.js API
2. API envía a Redconar OCR → recibe datos
3. API guarda en Supabase
4. Frontend muestra resultado

---

## Progreso Actual

### ✅ Completado
- [x] Proyecto Supabase creado
- [x] Tabla `facturas` creada (MVP)
- [x] Next.js 15+ con TypeScript y Tailwind CSS
- [x] shadcn/ui configurado
- [x] Cliente de Supabase (`lib/supabase.ts`)
- [x] Cliente de Redconar (`lib/redconar.ts`)
- [x] API route `/api/facturas/upload`
- [x] Componente `UploadFactura`
- [x] Página de listado de facturas
- [x] Flujo completo: Upload → Redconar OCR → Supabase → Listado
- [x] Repo separado en GitHub

### 🚧 En Progreso
- [ ] Mejoras de UX/UI

### 📋 Pendiente
- [ ] Tabla `proveedores`
- [ ] Tabla `consorcios`
- [ ] Autenticación básica
- [ ] Editar/Eliminar facturas
- [ ] Cargar factura en Redconar (endpoint createAssignTicketToOutflow)

---

## Tabla: facturas (MVP)

```sql
CREATE TABLE facturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nro_factura TEXT,
  detalle TEXT,
  importe DECIMAL(12, 2),
  cuit_emisor TEXT,
  cuit_receptor TEXT,
  fecha_factura DATE,
  ocr_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos del OCR de Redconar que se guardan:**
- `nro_factura` → numero (ej: "00003-00002916")
- `detalle` → descripcion
- `importe` → monto_total
- `cuit_emisor` → cuit_emisor
- `cuit_receptor` → cuit_destinatario
- `fecha_factura` → fecha (ej: "08-07-2025")
- `ocr_data` → JSON completo con todos los datos

---

## Estructura de Carpetas

```
new_system/
├── docs/                    # Documentación (PLAN.md, TECH_STACK.md)
├── database/                # SQL schemas, migraciones
│   └── supabase_schema.sql
├── redconar_api/            # Documentación de Redconar
├── scripts/                 # Scripts de utilidad
│   └── test-supabase-insert.js
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes
│   │   │   └── facturas/
│   │   │       └── upload/
│   │   │           └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx         # Página principal
│   │   └── globals.css
│   ├── components/          # Componentes React
│   │   ├── ui/              # shadcn/ui components
│   │   └── upload-factura.tsx
│   ├── lib/                 # Utilidades
│   │   ├── supabase.ts      # Cliente de Supabase
│   │   ├── redconar.ts      # Cliente de Redconar
│   │   └── utils.ts
│   └── ...
├── .env.example             # Credenciales de ejemplo (sin datos reales)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## Roadmap

### ✅ Phase 1: MVP - Upload + OCR (COMPLETADO)
- [x] Supabase setup
- [x] Next.js 15+ con TypeScript y Tailwind
- [x] shadcn/ui configurado
- [x] Página de listado de facturas
- [x] API: Upload → Redconar OCR → Supabase
- [x] Mostrar resultado en pantalla

### 🚧 Phase 2: Gestión de Facturas (Próximo)
- [ ] Tabla `proveedores` (cuit, nombre, nombre_fantasia, mail)
- [ ] Tabla `consorcios` (cuit, nombre, redconar_building_id)
- [ ] Mostrar nombre de proveedor en vez de CUIT
- [ ] Editar factura (manual override de datos OCR)
- [ ] Eliminar factura
- [ ] Filtros (por fecha, por proveedor, etc.)
- [ ] Cargar factura en Redconar (endpoint createAssignTicketToOutflow)

### Phase 3: Autenticación y Multi-tenancy
- [ ] Tabla `administraciones`
- [ ] Tabla `usuarios` (mail, password, administración_id)
- [ ] Login simple
- [ ] Restringir acceso por administración
- [ ] Agregar `administracion_id` a consorcios

### Phase 4: Funcionalidades Avanzadas
- [ ] Google Drive integration
- [ ] Conciliaciones bancarias
- [ ] Reportes
- [ ] etc.

---

## Supabase Info

```
Project URL: https://vvclhzfyszqxvsldkxzq.supabase.co
Table Editor: https://vvclhzfyszqxvsldkxzq.supabase.co/table
```

**Credenciales en .env (NO commitear):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REDCONAR_EMAIL`
- `REDCONAR_PASSWORD`

---

## Repositorio de GitHub

**Repo:** https://github.com/juanicole1809/new-contable-system

**Estado:** Activo, independiente de `A-PRODUCCION`

---

## Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Probar conexión a Supabase
npm run test:supabase

# Build para producción
npm run build

# Deploy en Vercel (cuando esté listo)
vercel
```
