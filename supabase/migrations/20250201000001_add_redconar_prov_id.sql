-- ============================================
-- Migration: Add redconar_prov_id to proveedores
-- ============================================

-- Add redconar_prov_id column to proveedores
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS redconar_prov_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_proveedores_redconar_prov_id ON proveedores(redconar_prov_id);

-- Add comment
COMMENT ON COLUMN proveedores.redconar_prov_id IS 'ID del proveedor en Redconar (usado para sincronización, no visible en la UI)';
