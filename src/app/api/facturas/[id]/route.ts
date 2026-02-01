import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Campos permitidos para editar
    const allowedFields = [
      'nro_factura',
      'detalle',
      'importe',
      'cuit_emisor',
      'cuit_receptor',
      'fecha_factura',
      'proveedor_id',
      'consorcio_id'
    ]

    // Filtrar solo los campos permitidos que fueron enviados
    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron campos válidos para actualizar' },
        { status: 400 }
      )
    }

    const { data: factura, error } = await supabase
      .from('facturas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar factura:', error)
      return NextResponse.json(
        { error: 'Error al actualizar la factura' },
        { status: 500 }
      )
    }

    if (!factura) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, factura })
  } catch (error) {
    console.error('Error en PUT /api/facturas/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('facturas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error al eliminar factura:', error)
      return NextResponse.json(
        { error: 'Error al eliminar la factura' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/facturas/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
