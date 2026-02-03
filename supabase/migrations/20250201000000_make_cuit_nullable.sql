-- ============================================
-- Migration: Make CUIT nullable in proveedores and consorcios
-- ============================================

-- Make cuit nullable in proveedores
ALTER TABLE proveedores ALTER COLUMN cuit DROP NOT NULL;

-- Make cuit nullable in consorcios
ALTER TABLE consorcios ALTER COLUMN cuit DROP NOT NULL;

COMMENT ON COLUMN proveedores.cuit IS 'CUIT del proveedor. Can be NULL for suppliers without CUIT.';
COMMENT ON COLUMN consorcios.cuit IS 'CUIT del consorcio. Can be NULL for buildings without CUIT.';
