-- ============================================
-- Migration: Create proveedores and consorcios tables
-- ============================================

-- ============================================
-- TABLA: proveedores
-- ============================================
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuit TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,           -- Razón social (ej: "GS CLEANING SRL")
  nombre_fantasia TEXT,           -- Nombre corto opcional (ej: "GS Cleaning")
  mail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para búsquedas por CUIT
CREATE INDEX IF NOT EXISTS idx_proveedores_cuit ON proveedores(cuit);

-- RLS para proveedores
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access on proveedores" ON proveedores;
CREATE POLICY "Allow all access on proveedores" ON proveedores
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- TABLA: consorcios
-- ============================================
CREATE TABLE IF NOT EXISTS consorcios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuit TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,           -- Dirección (ej: "Av. San Martin 1234")
  redconar_building_id TEXT,     -- ID del consorcio en Redconar
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para búsquedas por CUIT
CREATE INDEX IF NOT EXISTS idx_consorcios_cuit ON consorcios(cuit);

-- RLS para consorcios
ALTER TABLE consorcios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access on consorcios" ON consorcios;
CREATE POLICY "Allow all access on consorcios" ON consorcios
  FOR ALL USING (true) WITH CHECK (true);
