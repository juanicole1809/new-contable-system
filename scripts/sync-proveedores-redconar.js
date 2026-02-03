/**
 * Script para sincronizar proveedores desde Redconar
 *
 * Uso:
 *   node scripts/sync-proveedores-redconar.js
 *
 * Flujo:
 * 1. Obtiene la lista de proveedores desde Redconar (ajaxScriptProviders.php)
 * 2. Obtiene la lista de proveedores desde nuestra DB (Supabase)
 * 3. Compara y muestra:
 *    - Proveedores en Redconar que NO tenemos (nuevos)
 *    - Proveedores que tenemos que NO están en Redconar (eliminados)
 *    - Proveedores que matchean por CUIT (para actualizar el redconar_prov_id)
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuración Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Credenciales Redconar
const REDCONAR_EMAIL = process.env.REDCONAR_EMAIL
const REDCONAR_PASSWORD = process.env.REDCONAR_PASSWORD

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

    // Skip placeholder
    if (!id || text === 'Seleccione un proveedor...') {
      continue
    }

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
 * Obtiene el PHPSESSID de Redconar
 */
async function getRedconarSession() {
  const https = require('https')
  const URL = require('url').URL

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
      // No seguimos redirects para capturar las cookies
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Buscar PHPSESSID en los headers de respuesta
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

      // Si no hubo redirect, intentar obtener de todas formas
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        const cookies = res.headers['set-cookie'] || []
        const sessionCookie = cookies.find(cookie => cookie.includes('PHPSESSID'))

        if (sessionCookie) {
          const sessionId = sessionCookie.match(/PHPSESSID=([^;]+)/)?.[1]
          if (sessionId) resolve(sessionId)
          else reject(new Error('No se pudo extraer PHPSESSID de la cookie'))
        } else {
          reject(new Error('No se encontró cookie PHPSESSID. Response: ' + data.substring(0, 200)))
        }
      })
    })

    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

/**
 * Obtiene los proveedores desde Redconar
 */
async function getRedconarProviders(sessionId) {
  const https = require('https')
  const URL = require('url').URL

  return new Promise((resolve, reject) => {
    const url = new URL('https://www.redconar.net/ajax/proveedores/ajaxScriptProviders.php')

    const postData = new URLSearchParams({
      selbId: '16528', // ID de building válido (cualquiera funciona para obtener todos)
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

      res.on('data', (chunk) => {
        data += chunk
      })

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
 * Compara proveedores de Redconar con los de la DB
 */
function compareProviders(redconarProviders, dbProviders) {
  // Crear mapas por CUIT
  const redconarByCuit = new Map()
  const dbByCuit = new Map()

  redconarProviders.forEach(p => {
    if (p.cuit) {
      redconarByCuit.set(p.cuit, p)
    }
  })

  dbProviders.forEach(p => {
    if (p.cuit) {
      dbByCuit.set(p.cuit, p)
    }
  })

  // Proveedores en Redconar que NO tenemos en DB (nuevos)
  const newInRedconar = redconarProviders.filter(rp => {
    if (!rp.cuit) return false
    return !dbByCuit.has(rp.cuit)
  })

  // Proveedores en DB que NO están en Redconar (eliminados o sin CUIT en Redconar)
  const missingInRedconar = dbProviders.filter(db => {
    if (!db.cuit) return false
    return !redconarByCuit.has(db.cuit)
  })

  // Proveedores que matchean por CUIT (para actualizar redconar_prov_id)
  const toUpdate = dbProviders
    .filter(db => {
      if (!db.cuit || !db.redconar_prov_id) return false
      const redconar = redconarByCuit.get(db.cuit)
      return redconar && redconar.redconar_prov_id !== db.redconar_prov_id
    })
    .map(db => ({
      db_proveedor: db,
      redconar_proveedor: redconarByCuit.get(db.cuit)
    }))

  // Proveedores sin redconar_prov_id que lo podrían tener
  const toLink = dbProviders
    .filter(db => {
      if (!db.cuit || db.redconar_prov_id) return false
      return redconarByCuit.has(db.cuit)
    })
    .map(db => ({
      db_proveedor: db,
      redconar_proveedor: redconarByCuit.get(db.cuit)
    }))

  return {
    newInRedconar,
    missingInRedconar,
    toUpdate,
    toLink,
    stats: {
      redconar_total: redconarProviders.length,
      redconar_with_cuit: redconarProviders.filter(p => p.cuit).length,
      db_total: dbProviders.length,
      db_with_cuit: dbProviders.filter(p => p.cuit).length,
      db_with_redconar_prov_id: dbProviders.filter(p => p.redconar_prov_id).length
    }
  }
}

/**
 * Main
 */
async function main() {
  console.log('🔐 Obteniendo sesión de Redconar...')
  const sessionId = await getRedconarSession()
  console.log('✅ Sesión obtenida')

  console.log('📥 Obteniendo proveedores de Redconar...')
  const redconarProviders = await getRedconarProviders(sessionId)
  console.log(`✅ ${redconarProviders.length} proveedores de Redconar`)

  console.log('📥 Obteniendo proveedores de Supabase...')
  const dbProviders = await getDbProviders()
  console.log(`✅ ${dbProviders.length} proveedores en Supabase`)

  console.log('\n📊 Comparando proveedores...\n')
  const comparison = compareProviders(redconarProviders, dbProviders)

  // Stats
  console.log('📈 ESTADÍSTICAS:')
  console.log(`   Redconar: ${comparison.stats.redconar_total} total (${comparison.stats.redconar_with_cuit} con CUIT)`)
  console.log(`   DB:       ${comparison.stats.db_total} total (${comparison.stats.db_with_cuit} con CUIT, ${comparison.stats.db_with_redconar_prov_id} con redconar_prov_id)`)

  // Nuevos en Redconar
  if (comparison.newInRedconar.length > 0) {
    console.log(`\n✨ NUEVOS EN REDCONAR (${comparison.newInRedconar.length}):`)
    console.log('   Estos proveedores están en Redconar pero NO en nuestra DB:')
    comparison.newInRedconar.slice(0, 10).forEach(p => {
      console.log(`   - ${p.nombre} (${p.cuit}) [redconar_prov_id: ${p.redconar_prov_id}]`)
    })
    if (comparison.newInRedconar.length > 10) {
      console.log(`   ... y ${comparison.newInRedconar.length - 10} más`)
    }
  } else {
    console.log('\n✅ No hay proveedores nuevos en Redconar')
  }

  // Faltan en Redconar
  if (comparison.missingInRedconar.length > 0) {
    console.log(`\n⚠️  FALTAN EN REDCONAR (${comparison.missingInRedconar.length}):`)
    console.log('   Estos proveedores están en nuestra DB pero NO en Redconar:')
    comparison.missingInRedconar.slice(0, 10).forEach(p => {
      console.log(`   - ${p.nombre} (${p.cuit})`)
    })
    if (comparison.missingInRedconar.length > 10) {
      console.log(`   ... y ${comparison.missingInRedconar.length - 10} más`)
    }
  } else {
    console.log('\n✅ Todos nuestros proveedores están en Redconar')
  }

  // Para vincular (tienen CUIT pero sin redconar_prov_id)
  if (comparison.toLink.length > 0) {
    console.log(`\n🔗 PARA VINCULAR (${comparison.toLink.length}):`)
    console.log('   Estos proveedores tienen CUIT que matchea con Redconar pero no tienen redconar_prov_id:')
    comparison.toLink.slice(0, 10).forEach(({ db_proveedor, redconar_proveedor }) => {
      console.log(`   - ${db_proveedor.nombre} (${db_proveedor.cuit}) → redconar_prov_id: ${redconar_proveedor.redconar_prov_id}`)
    })
    if (comparison.toLink.length > 10) {
      console.log(`   ... y ${comparison.toLink.length - 10} más`)
    }
  } else {
    console.log('\n✅ Todos los proveedores con CUIT tienen redconar_prov_id')
  }

  // Para actualizar (redconar_prov_id incorrecto)
  if (comparison.toUpdate.length > 0) {
    console.log(`\n🔄 PARA ACTUALIZAR (${comparison.toUpdate.length}):`)
    console.log('   Estos proveedores tienen un redconar_prov_id que no coincide con el CUIT:')
    comparison.toUpdate.forEach(({ db_proveedor, redconar_proveedor }) => {
      console.log(`   - ${db_proveedor.nombre}: ${db_proveedor.redconar_prov_id} → ${redconar_proveedor.redconar_prov_id}`)
    })
  }

  console.log('\n✅ Script finalizado')
}

main().catch(console.error)
