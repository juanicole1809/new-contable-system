# Claude - Guía de desarrollo

## Documentación importante

Lee los archivos en la carpeta `docs/` antes de hacer cambios:

- **docs/DATABASE_ACCESS.md** - Cómo interactuar con la base de datos

## Modificaciones a la base de datos

**IMPORTANTE:** Todas las modificaciones a la base de datos deben hacerse siguiendo este proceso:

1. Crear un archivo de migración SQL en `supabase/migrations/` con formato secuencial: `001_descripcion.sql`, `002_descripcion.sql`, etc.
2. Ejecutar la migración con `psql` usando las credenciales del archivo `.env`

Las migraciones sirven como historial de cambios - consultar esta carpeta para ver qué se ha modificado en la base de datos.

**NO** crear scripts inventados ni alternativas para modificar la base de datos.

### Credenciales de la base de datos

- La contraseña de la base de datos está en `.env` como `DB_PASSWORD`
- Si no está en el archivo, pregunta al usuario

### Ejemplo de ejecución de migración

```bash
psql -h db.vvclhzfyszqxvsldkxzq.supabase.co -p 5432 -U postgres -d postgres -f supabase/migrations/archivo.sql
# Password: (usar DB_PASSWORD del .env)
```

O usando connection string:
```bash
psql "postgresql://postgres:Talarga.1993@db.vvclhzfyszqxvsldkxzq.supabase.co:5432/postgres" -f supabase/migrations/archivo.sql
```

## Variables de entorno

El proyecto usa las siguientes variables de Supabase (no agregar variables innecesarias):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
