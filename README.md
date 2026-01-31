# Contable Software

Sistema de contabilidad reemplazando Google Apps Scripts con Next.js + Supabase.

## Estado Actual: MVP - Upload de Facturas con OCR

### ✅ Hecho
- Proyecto Supabase configurado
- Tabla `facturas` creada
- Repo independiente en GitHub

### 🚧 En Progreso
- Proyecto Next.js (próximo paso)

### 📋 Pendiente
- Upload de PDF → Redconar OCR → Supabase
- Autenticación
- Consorcios y Proveedores

## Stack

- **Frontend**: Next.js 15+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **External API**: Redconar (OCR)

## Documentación

- [PLAN.md](./docs/PLAN.md) - Plan de desarrollo
- [TECH_STACK.md](./docs/TECH_STACK.md) - Detalles técnicos

## Estructura

```
├── docs/           # Documentación
├── database/       # SQL schemas
├── redconar_api/   # Documentación de Redconar
└── .env.example    # Variables de entorno
```

## Setup Local

```bash
# 1. Instalar dependencias (cuando agreguemos Next.js)
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local

# 3. Ejecutar
npm run dev
```

## Créditos

Desarrollado para reemplazar flujos de trabajo de Google Apps Script.
