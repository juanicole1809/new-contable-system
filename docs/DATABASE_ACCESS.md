# Database Access - Supabase PostgreSQL

## Connection Info

```
Host: db.vvclhzfyszqxvsldkxzq.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: (stored in .env - never commit)
```

## How to Connect

### Option 1: Using psql (command line)

```bash
# Direct connection
psql -h db.vvclhzfyszqxvsldkxzq.supabase.co -p 5432 -U postgres -d postgres

# Or using connection string
psql "postgresql://postgres:[PASSWORD]@db.vvclhzfyszqxvsldkxzq.supabase.co:5432/postgres"
```

### Option 2: Using TablePlus / pgAdmin / DBeaver

- **Host:** `db.vvclhzfyszqxvsldkxzq.supabase.co`
- **Port:** `5432`
- **User:** `postgres`
- **Password:** (from .env)
- **Database:** `postgres`

### Option 3: Supabase Dashboard

1. Go to https://vvclhzfyszqxvsldkxzq.supabase.co
2. Navigate to **Table Editor** or **SQL Editor**

## Useful Queries

```sql
-- List all tables
\dt

-- Describe a table
\d facturas
\d proveedores
\d consorcios

-- See all invoices without provider match
SELECT f.*, p.nombre
FROM facturas f
LEFT JOIN proveedores p ON f.proveedor_id = p.id
WHERE f.proveedor_id IS NULL AND f.cuit_emisor IS NOT NULL;

-- See all invoices without consortium match
SELECT f.*, c.nombre
FROM facturas f
LEFT JOIN consorcios c ON f.consorcio_id = c.id
WHERE f.consorcio_id IS NULL AND f.cuit_receptor IS NOT NULL;
```

## Running Migrations

Migrations are stored in `supabase/migrations/`. You can:

1. **Via psql:** Copy and paste the SQL
2. **Via Supabase Dashboard:** Go to SQL Editor and paste the migration
3. **Via this script:** `node scripts/run-migration.js [migration-file]`
