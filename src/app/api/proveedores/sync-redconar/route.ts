import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    // Ejecutar el script de sincronización
    const scriptPath = `${process.cwd()}/scripts/redconar/sync-proveedores.js`
    const { stdout, stderr } = await execAsync(`node ${scriptPath}`)

    // La salida puede tener mensajes de dotenv, extraer solo el JSON
    const lines = stdout.trim().split('\n')
    const jsonLine = lines.find(line => line.trim().startsWith('{'))

    if (!jsonLine) {
      throw new Error('No se encontró JSON en la respuesta')
    }

    const result = JSON.parse(jsonLine.trim())
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error sincronizando proveedores:', error)

    // Si el error tiene stdout, intentar extraer el JSON
    if (error.stdout) {
      try {
        const lines = error.stdout.trim().split('\n')
        const jsonLine = lines.find(line => line.trim().startsWith('{'))
        if (jsonLine) {
          const result = JSON.parse(jsonLine.trim())
          return NextResponse.json(result)
        }
      } catch {
        // No es JSON, retornar error normal
      }
    }

    return NextResponse.json(
      { error: 'Error sincronizando proveedores: ' + error.message },
      { status: 500 }
    )
  }
}
