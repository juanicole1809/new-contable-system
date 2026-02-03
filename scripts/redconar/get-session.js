/**
 * Script para obtener PHPSESSID de Redconar
 *
 * Uso:
 *   node scripts/redconar/get-session.js
 *
 * Retorna:
 *   El PHPSESSID o null si hubo error
 */

const https = require('https')
const { URL } = require('url')

require('dotenv').config()

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
 * Main
 */
async function main() {
  try {
    const sessionId = await getRedconarSession()
    console.log(sessionId)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main()
