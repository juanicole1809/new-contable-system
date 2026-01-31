import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getRedconarSession, sendFileForOCR } from '@/lib/redconar'

export async function POST(req: NextRequest) {
  try {
    // Obtener el archivo del form data
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no válido. Solo se acepta PDF o JPG.' },
        { status: 400 }
      )
    }

    // Obtener sesión de Redconar
    const sessionId = await getRedconarSession()
    if (!sessionId) {
      return NextResponse.json(
        { error: 'No se pudo conectar con Redconar. Verifique las credenciales.' },
        { status: 500 }
      )
    }

    // Enviar archivo a Redconar OCR
    const ocrResult = await sendFileForOCR(file, sessionId)

    if (!ocrResult.success || !ocrResult.data) {
      return NextResponse.json(
        { error: ocrResult.error || 'Error al procesar el OCR' },
        { status: 500 }
      )
    }

    // Guardar en Supabase
    const data = ocrResult.data

    // Convertir fecha de DD-MM-YYYY a YYYY-MM-DD para PostgreSQL
    let fechaFacturaDB: string | null = null
    if (data.fecha) {
      const [dia, mes, anio] = data.fecha.split('-')
      fechaFacturaDB = `${anio}-${mes}-${dia}`
    }

    const facturaData = {
      nro_factura: data.numero,
      detalle: data.descripcion,
      importe: data.monto_total,
      cuit_emisor: data.cuit_emisor,
      cuit_receptor: data.cuit_destinatario,
      fecha_factura: fechaFacturaDB,
      ocr_data: data
    }

    const { data: factura, error } = await supabase
      .from('facturas')
      .insert(facturaData)
      .select()
      .single()

    if (error) {
      console.error('Error al guardar en Supabase:', error)
      return NextResponse.json(
        { error: 'Error al guardar la factura en la base de datos' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      factura
    })

  } catch (error) {
    console.error('Error en upload:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
