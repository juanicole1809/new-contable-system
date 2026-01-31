// Redconar API Client

const REDCONAR_LOGIN_URL = 'https://www.redconar.net/userValidator.php'
const REDCONAR_OCR_URL = 'https://www.redconar.net/ajax/egresos/recognizingOutflows/formsAssistance.php'

export interface OCRData {
  cuit_emisor: string
  cuit_destinatario: string
  descripcion: string
  fecha: string
  monto_total: number
  numero: string
  proveedor: string
  tipo: string
}

export interface OCRResponse {
  success: boolean
  data?: OCRData
  error?: string
}

// Obtener PHPSESSID mediante login
export async function getRedconarSession(): Promise<string | null> {
  const email = process.env.REDCONAR_EMAIL
  const password = process.env.REDCONAR_PASSWORD

  if (!email || !password) {
    console.error('REDCONAR_EMAIL or REDCONAR_PASSWORD not set')
    return null
  }

  const params = new URLSearchParams({
    usuario: email,
    contrasena: password,
    home_: 'https://www.redconar.net/login/ingresar.php?'
  })

  try {
    const response = await fetch(REDCONAR_LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      redirect: 'manual', // Importante: no seguir redirects para capturar cookies
    })

    // Extraer PHPSESSID de las cookies
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      const match = setCookie.match(/PHPSESSID=([^;]+)/)
      if (match) {
        return match[1]
      }
    }

    console.error('No se pudo extraer PHPSESSID de la respuesta')
    return null
  } catch (error) {
    console.error('Error en login a Redconar:', error)
    return null
  }
}

// Enviar archivo para OCR
export async function sendFileForOCR(
  file: File,
  sessionId: string
): Promise<OCRResponse> {
  try {
    const formData = new FormData()
    formData.append('file_img', file)

    const response = await fetch(REDCONAR_OCR_URL, {
      method: 'POST',
      headers: {
        'Cookie': `PHPSESSID=${sessionId}`,
      },
      body: formData,
    })

    const responseText = await response.text()

    // Verificar si la respuesta es HTML (sesión expirada)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      return {
        success: false,
        error: 'Sesión expirada. Intente nuevamente.'
      }
    }

    const parsed = JSON.parse(responseText)

    // Verificar estructura de respuesta
    if (!Array.isArray(parsed) || parsed.length < 2) {
      return {
        success: false,
        error: 'Formato de respuesta inválido'
      }
    }

    // parsed[0] es "0" para éxito, "1" para error
    if (parsed[0] !== '0') {
      return {
        success: false,
        error: parsed[1] || 'Error desconocido en OCR'
      }
    }

    const data = parsed[1] as OCRData

    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}
