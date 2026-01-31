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
