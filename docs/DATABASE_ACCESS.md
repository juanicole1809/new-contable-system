# Database Access - Supabase PostgreSQL

## Connection Info

```
Host: db.vvclhzfyszqxvsldkxzq.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [YOUR-PASSWORD]
```

## How to Connect

### ⭐ RECOMMENDED: Using psql (command line)

psql is installed via Homebrew at `/opt/homebrew/bin/psql`.

**Direct connection:**
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.vvclhzfyszqxvsldkxzq.supabase.co:5432/postgres"
```

**Or create an alias in your shell profile (~/.zshrc or ~/.bashrc):**
```bash
alias supadb='psql "postgresql://postgres:[YOUR-PASSWORD]@db.vvclhzfyszqxvsldkxzq.supabase.co:5432/postgres"'
```

Then just run: `supadb`

---

### Useful psql Commands

```bash
# List all tables
\dt

# Describe a table structure
\d facturas
\d proveedores
\d consorcios

# Describe with more details
\d+ facturas

# List indexes
\di

# Execute a SQL file
psql "postgresql://postgres:[YOUR-PASSWORD]@db.vvclhzfyszqxvsldkxzq.supabase.co:5432/postgres" -f archivo.sql

# Execute a single command
psql "postgresql://postgres:[YOUR-PASSWORD]@db.vvclhzfyszqxvsldkxzq.supabase.co:5432/postgres" -c "SELECT * FROM facturas LIMIT 5;"
```

---

### Useful Queries

```sql
-- See all invoices without provider match
SELECT f.id, f.nro_factura, f.cuit_emisor, p.nombre
FROM facturas f
LEFT JOIN proveedores p ON f.proveedor_id = p.id
WHERE f.proveedor_id IS NULL AND f.cuit_emisor IS NOT NULL;

-- See all invoices without consortium match
SELECT f.id, f.nro_factura, f.cuit_receptor, c.nombre
FROM facturas f
LEFT JOIN consorcios c ON f.consorcio_id = c.id
WHERE f.consorcio_id IS NULL AND f.cuit_receptor IS NOT NULL;

-- Count invoices by provider
SELECT p.nombre, COUNT(f.id) as total
FROM proveedores p
LEFT JOIN facturas f ON f.proveedor_id = p.id
GROUP BY p.nombre
ORDER BY total DESC;
```

---

### Alternative: Supabase Dashboard

For visual queries and quick edits:

1. Go to https://vvclhzfyszqxvsldkxzq.supabase.co
2. **Table Editor** → view/edit data visually
3. **SQL Editor** → run SQL queries in browser

---

### Running Migrations

**Using psql (recommended):**
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.vvclhzfyszqxvsldkxzq.supabase.co:5432/postgres" -f supabase/migrations/migration_file.sql
```

**Or from Supabase Dashboard:**
1. Go to SQL Editor
2. Paste the migration SQL
3. Run
