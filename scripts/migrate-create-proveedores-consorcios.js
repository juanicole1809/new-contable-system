require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🔄 Creando tablas proveedores y consorcios...')

  // Crear tabla proveedores
  const { error: errorProveedores } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS proveedores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cuit TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        nombre_fantasia TEXT,
        mail TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_proveedores_cuit ON proveedores(cuit);

      ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow all access on proveedores" ON proveedores;
      CREATE POLICY "Allow all access on proveedores" ON proveedores
        FOR ALL USING (true) WITH CHECK (true);
    `
  })

  if (errorProveedores) {
    console.error('❌ Error creando proveedores:', errorProveedores)
  } else {
    console.log('✅ Tabla proveedores creada')
  }

  // Crear tabla consorcios
  const { error: errorConsorcios } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS consorcios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cuit TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        redconar_building_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_consorcios_cuit ON consorcios(cuit);

      ALTER TABLE consorcios ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow all access on consorcios" ON consorcios;
      CREATE POLICY "Allow all access on consorcios" ON consorcios
        FOR ALL USING (true) WITH CHECK (true);
    `
  })

  if (errorConsorcios) {
    console.error('❌ Error creando consorcios:', errorConsorcios)
  } else {
    console.log('✅ Tabla consorcios creada')
  }

  console.log('🎉 Migración completada')
}

runMigration()
