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
- [x] Credenciales guardadas (.env.example)
- [x] Tabla `facturas` creada (MVP)
- [x] Estructura de carpetas organizada

### 🚧 En Progreso
- [ ] Proyecto Next.js
- [ ] Integración con Redconar OCR

### 📋 Pendiente
- [ ] Página de upload de PDFs
- [ ] API route para procesar facturas
- [ ] Autenticación básica
- [ ] Tablas: consorcios, proveedores, administraciones
- [ ] Cargar factura en Redconar (después de OCR)

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
├── redconar_api/            # Cliente de Redconar (existente)
├── .env.example             # Credenciales de ejemplo
└── .gitignore
```

**Próximas carpetas a crear:**
```
new_system/
├── app/                     # Next.js App Router
│   ├── facturas/            # Páginas de facturas
│   └── api/                 # API routes
│       └── facturas/
│           └── upload/
├── components/              # Componentes React
├── lib/                     # Utilidades
│   ├── supabase.ts          # Cliente de Supabase
│   └── redconar.ts          # Cliente de Redconar
└── types/                   # Tipos TypeScript
```

---

## Roadmap

### Phase 1: MVP - Upload + OCR (Actual)
- [x] Supabase setup
- [ ] Crear proyecto Next.js
- [ ] Conectar Supabase
- [ ] Página: Upload PDF
- [ ] API: Upload → Redconar OCR → Supabase
- [ ] Mostrar resultado en pantalla

### Phase 2: Gestión de Facturas
- [ ] Listado de facturas
- [ ] Editar factura
- [ ] Cargar factura en Redconar (endpoint createAssignTicketToOutflow)

### Phase 3: Autenticación y Multi-tenancy
- [ ] Login simple (usuarios)
- [ ] Tabla: administraciones
- [ ] Tabla: usuarios (con administración_id)
- [ ] Restringir acceso por administración

### Phase 4: Consorcios y Proveedores
- [ ] Tabla: consorcios (con redconar_building_id)
- [ ] Tabla: proveedores
- [ ] Relacionar factura con consorcio/proveedor por CUIT

### Phase 5: Funcionalidades Avanzadas
- [ ] Google Drive integration
- [ ] Conciliaciones bancarias
- [ ] Reportes
- [ ] etc.

---

## Supabase Credentials

```
Project URL: https://vvclhzfyszqxvsldkxzq.supabase.co
Anon Key: (en .env.example)
Service Role: (en .env.example)
```

**Importante:** No commitear `.env` real, usar `.env.example` para referencias.

---

## Repositorio de GitHub

**Pregunta pendiente:** ¿Crear un repo separado para `new_system` o mantenerlo dentro del repo actual de `A-PRODUCCION`?

**Argumentos pro repo separado:**
- Limpieza: el repo actual tiene muchos proyectos de Apps Script
- Independencia: deploy de Vercel puede ser más simple
- README y documentación enfocada solo en el nuevo sistema

**Argumentos pro repo actual:**
- Todo en un solo lugar
- Contexto histórico del código que estamos reemplazando
- Ya está configurado

**Decisión pendiente.**
