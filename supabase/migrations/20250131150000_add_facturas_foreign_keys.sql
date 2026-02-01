-- Migration: Add proveedor_id and consorcio_id to facturas
-- This allows showing names instead of CUITs and matching on upload

-- Add proveedor_id column (nullable initially)
ALTER TABLE facturas
  ADD COLUMN IF NOT EXISTS proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL;

-- Add consorcio_id column (nullable initially)
ALTER TABLE facturas
  ADD COLUMN IF NOT EXISTS consorcio_id UUID REFERENCES consorcios(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_facturas_proveedor_id ON facturas(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_facturas_consorcio_id ON facturas(consorcio_id);

-- Add comment for documentation
COMMENT ON COLUMN facturas.proveedor_id IS 'Foreign key to proveedores table. Matched by cuit_emisor on upload. NULL if no match found.';
COMMENT ON COLUMN facturas.consorcio_id IS 'Foreign key to consorcios table. Matched by cuit_receptor on upload. NULL if no match found.';
