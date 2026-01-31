-- ============================================
-- Contable Software - Tabla facturas (MVP)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: facturas
-- ============================================
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

-- Indexes for common searches
CREATE INDEX idx_facturas_nro_factura ON facturas(nro_factura);
CREATE INDEX idx_facturas_cuit_emisor ON facturas(cuit_emisor);
CREATE INDEX idx_facturas_cuit_receptor ON facturas(cuit_receptor);
CREATE INDEX idx_facturas_fecha ON facturas(fecha_factura);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Por ahora, desactivado o muy permisivo para desarrollo
-- ============================================

ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

-- Política muy permisiva para desarrollo (después se restringe)
CREATE POLICY "Allow all access" ON facturas
  FOR ALL USING (true)
  WITH CHECK (true);

-- ============================================
-- TABLA: proveedores
-- ============================================
CREATE TABLE proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuit TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,           -- Razón social (ej: "GS CLEANING SRL")
  nombre_fantasia TEXT,           -- Nombre corto opcional (ej: "GS Cleaning")
  mail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para búsquedas por CUIT
CREATE INDEX idx_proveedores_cuit ON proveedores(cuit);

-- RLS para proveedores
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON proveedores
  FOR ALL USING (true)
  WITH CHECK (true);

-- ============================================
-- TABLA: consorcios
-- ============================================
CREATE TABLE consorcios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuit TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,           -- Dirección (ej: "Av. San Martin 1234")
  redconar_building_id TEXT,     -- ID del consorcio en Redconar
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para búsquedas por CUIT
CREATE INDEX idx_consorcios_cuit ON consorcios(cuit);

-- RLS para consorcios
ALTER TABLE consorcios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON consorcios
  FOR ALL USING (true)
  WITH CHECK (true);
