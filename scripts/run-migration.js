const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

require('dotenv').config()

const connectionString = `postgresql://postgres:${process.env.DB_PASSWORD}@db.vvclhzfyszqxvsldkxzq.supabase.co:5432/postgres`

async function runMigration(migrationFile) {
  const client = new Client({ connectionString })

  try {
    console.log('Connecting to Supabase...')
    await client.connect()
    console.log('Connected!')

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log(`Running migration: ${migrationFile}`)
    console.log('--- SQL ---')
    console.log(sql)
    console.log('--- END SQL ---')

    await client.query(sql)
    console.log('Migration completed successfully!')

    // Verify the columns were added
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'facturas'
      AND column_name IN ('proveedor_id', 'consorcio_id')
      ORDER BY column_name
    `)

    console.log('\n--- Verified columns ---')
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    })

  } catch (error) {
    console.error('Error running migration:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run the migration
const migrationFile = process.argv[2] || '20250131150000_add_facturas_foreign_keys.sql'
runMigration(migrationFile)
