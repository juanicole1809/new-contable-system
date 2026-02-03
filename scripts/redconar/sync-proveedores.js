/**
 * Script para sincronizar proveedores desde Redconar
 *
 * Uso:
 *   node scripts/redconar/sync-proveedores.js <PHPSESSID>
 *
 * Si no se pasa PHPSESSID, se obtiene automáticamente
 *
 * Retorna JSON con:
 *   - linked: cantidad de proveedores vinculados
 *   - new: cantidad de proveedores nuevos (no se importan, solo se reportan)
 *   - missing: cantidad de proveedores que faltan en Redconar
 */

const https = require('https')
const { URL } = require('url')
const { createClient } = require('@supabase/supabase-js')
const { Client } = require('pg')

require('dotenv').config()

// Configuración Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Credenciales Redconar
const REDCONAR_EMAIL = process.env.REDCONAR_EMAIL
const REDCONAR_PASSWORD = process.env.REDCONAR_PASSWORD

/**
 * Obtiene el PHPSESSID de Redconar
 */
async function getRedconarSession() {
  return new Promise((resolve, reject) => {
    const url = new URL('https://www.redconar.net/userValidator.php')

    const postData = new URLSearchParams({
      usuario: REDCONAR_EMAIL,
      contrasena: REDCONAR_PASSWORD,
      home_: 'https://www.redconar.net/login/ingresar.php?'
    }).toString()

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const cookies = res.headers['set-cookie'] || []
        const sessionCookie = cookies.find(cookie => cookie.includes('PHPSESSID'))

        if (sessionCookie) {
          const sessionId = sessionCookie.match(/PHPSESSID=([^;]+)/)?.[1]
          if (sessionId) {
            resolve(sessionId)
            return
          }
        }
      }

      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        const cookies = res.headers['set-cookie'] || []
        const sessionCookie = cookies.find(cookie => cookie.includes('PHPSESSID'))

        if (sessionCookie) {
          const sessionId = sessionCookie.match(/PHPSESSID=([^;]+)/)?.[1]
          if (sessionId) resolve(sessionId)
          else reject(new Error('No se pudo extraer PHPSESSID'))
        } else {
          reject(new Error('No se encontró cookie PHPSESSID'))
        }
      })
    })

    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

/**
 * Parsea la respuesta HTML de Redconar a JSON
 */
function parseProvidersHtmlToJson(htmlResponse) {
  const providers = []
  const optionRegex = /<option[^>]*value=['"]([^'"]*)['"][^>]*>([^<]*)<\/option>/g
  let match

  while ((match = optionRegex.exec(htmlResponse)) !== null) {
    const id = match[1]
    const text = match[2].trim()

    if (!id || text === 'Seleccione un proveedor...') continue

    let displayName = text
    let legalName = text
    let cuit = '--'

    if (text.includes(' |  ')) {
      const parts = text.split(' |  ')
      const namePart = parts[0] || ''
      cuit = parts[1] || '--'

      if (namePart.includes(' - ')) {
        const nameParts = namePart.split(' - ')
        displayName = nameParts[0].trim()
        legalName = nameParts.slice(1).join(' - ').trim()
      } else {
        displayName = namePart.trim()
        legalName = namePart.trim()
      }
    }

    providers.push({
      redconar_prov_id: id,
      nombre: displayName,
      razon_social: legalName,
      cuit: cuit === '--' ? null : cuit
    })
  }

  return providers
}

/**
 * Obtiene los proveedores desde Redconar
 */
async function getRedconarProviders(sessionId) {
  return new Promise((resolve, reject) => {
    const url = new URL('https://www.redconar.net/ajax/proveedores/ajaxScriptProviders.php')

    const postData = new URLSearchParams({
      selbId: '16528',
      user: REDCONAR_EMAIL,
      valuecuit: '0'
    }).toString()

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': `PHPSESSID=${sessionId}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(parseProvidersHtmlToJson(data))
        } else {
          reject(new Error(`HTTP ${res.statusCode}`))
        }
      })
    })

    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

/**
 * Obtiene los proveedores desde Supabase
 */
async function getDbProviders() {
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')

  if (error) throw error
  return data
}

/**
 * Vincula proveedores por CUIT - UNA SOLA PETICIÓN A SUPABASE
 */
async function linkProviders(toLink) {
  if (toLink.length === 0) {
    return { linked: 0, errors: 0 }
  }

  // Crear un CASE statement para el update masivo
  const caseStatements = toLink
    .map(({ db_proveedor, redconar_proveedor }) => {
      return `WHEN '${db_proveedor.id}'::uuid THEN '${redconar_proveedor.redconar_prov_id}'`
    })
    .join('\n        ')

  const ids = toLink
    .map(({ db_proveedor }) => `'${db_proveedor.id}'::uuid`)
    .join(', ')

  const sql = `
    UPDATE proveedores
    SET redconar_prov_id = CASE id
        ${caseStatements}
    END
    WHERE id IN (${ids})
    RETURNING id
  `

  const client = new Client({
    connectionString: `postgresql://postgres:${process.env.DB_PASSWORD}@db.vvclhzfyszqxvsldkxzq.supabase.co:5432/postgres`
  })

  try {
    await client.connect()
    const result = await client.query(sql)
    return { linked: result.rowCount || 0, errors: 0 }
  } catch (error) {
    console.error('Error en update masivo:', error)
    return { linked: 0, errors: toLink.length }
  } finally {
    await client.end()
  }
}

/**
 * Main
 */
async function main() {
  const sessionIdArg = process.argv[2]

  let sessionId = sessionIdArg

  // Si no se pasó sessionId, obtener uno nuevo
  if (!sessionId) {
    try {
      sessionId = await getRedconarSession()
    } catch (error) {
      console.error(JSON.stringify({ error: 'Error obteniendo sesión: ' + error.message }))
      process.exit(1)
    }
  }

  try {
    const redconarProviders = await getRedconarProviders(sessionId)
    const dbProviders = await getDbProviders()

    // Crear mapas por CUIT
    const redconarByCuit = new Map()
    const dbByCuit = new Map()

    redconarProviders.forEach(p => {
      if (p.cuit) redconarByCuit.set(p.cuit, p)
    })

    dbProviders.forEach(p => {
      if (p.cuit) dbByCuit.set(p.cuit, p)
    })

    // Proveedores para vincular
    const toLink = dbProviders
      .filter(db => {
        if (!db.cuit || db.redconar_prov_id) return false
        return redconarByCuit.has(db.cuit)
      })
      .map(db => ({
        db_proveedor: db,
        redconar_proveedor: redconarByCuit.get(db.cuit)
      }))

    // Nuevos en Redconar (no importamos, solo reportamos)
    const newInRedconar = redconarProviders.filter(rp => {
      if (!rp.cuit) return false
      return !dbByCuit.has(rp.cuit)
    })

    // Faltan en Redconar
    const missingInRedconar = dbProviders.filter(db => {
      if (!db.cuit) return false
      return !redconarByCuit.has(db.cuit)
    })

    // Vincular proveedores
    const result = await linkProviders(toLink)

    // Retornar JSON
    console.log(JSON.stringify({
      linked: result.linked,
      linkErrors: result.errors,
      newInRedconar: newInRedconar.length,
      missingInRedconar: missingInRedconar.length,
      totalDb: dbProviders.length,
      totalRedconar: redconarProviders.length,
      sessionId: sessionId // Retornar para que se pueda reutilizar
    }))

  } catch (error) {
    console.error(JSON.stringify({ error: error.message }))
    process.exit(1)
  }
}

main()
