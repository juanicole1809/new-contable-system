'use client'

import React, { useState, useEffect } from 'react'
import { type Factura, type Proveedor, type Consorcio } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, AlertTriangle } from 'lucide-react'

interface EditFacturaDialogProps {
  factura: Factura | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface FormData {
  nro_factura: string
  detalle: string
  importe: string
  cuit_emisor: string
  cuit_receptor: string
  fecha_factura: string
  proveedor_id: string
  consorcio_id: string
}

export function EditFacturaDialog({
  factura,
  open,
  onOpenChange,
  onSuccess,
}: EditFacturaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [consorcios, setConsorcios] = useState<Consorcio[]>([])
  const [formData, setFormData] = useState<FormData>({
    nro_factura: factura?.nro_factura || '',
    detalle: factura?.detalle || '',
    importe: factura?.importe?.toString() || '',
    cuit_emisor: factura?.cuit_emisor || '',
    cuit_receptor: factura?.cuit_receptor || '',
    fecha_factura: factura?.fecha_factura || '',
    proveedor_id: factura?.proveedor_id || '',
    consorcio_id: factura?.consorcio_id || '',
  })

  // Cargar proveedores y consorcios cuando se abre el diálogo
  useEffect(() => {
    if (open && !loadingData && proveedores.length === 0) {
      loadProveedoresYConsorcios()
    }
  }, [open])

  const loadProveedoresYConsorcios = async () => {
    setLoadingData(true)
    try {
      const [proveedoresRes, consorciosRes] = await Promise.all([
        supabase.from('proveedores').select('*').order('nombre'),
        supabase.from('consorcios').select('*').order('nombre'),
      ])

      if (proveedoresRes.data) setProveedores(proveedoresRes.data)
      if (consorciosRes.data) setConsorcios(consorciosRes.data)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  // Reset form cuando cambia la factura
  useEffect(() => {
    if (factura) {
      setFormData({
        nro_factura: factura.nro_factura || '',
        detalle: factura.detalle || '',
        importe: factura.importe?.toString() || '',
        cuit_emisor: factura.cuit_emisor || '',
        cuit_receptor: factura.cuit_receptor || '',
        fecha_factura: factura.fecha_factura || '',
        proveedor_id: factura.proveedor_id || '',
        consorcio_id: factura.consorcio_id || '',
      })
      setError(null)
    }
  }, [factura])

  // Cuando cambia el proveedor, actualizar el CUIT
  const handleProveedorChange = (proveedorId: string) => {
    const proveedor = proveedores.find(p => p.id === proveedorId)
    setFormData({
      ...formData,
      proveedor_id: proveedorId,
      cuit_emisor: proveedor?.cuit || formData.cuit_emisor,
    })
  }

  // Cuando cambia el consorcio, actualizar el CUIT
  const handleConsorcioChange = (consorcioId: string) => {
    const consorcio = consorcios.find(c => c.id === consorcioId)
    setFormData({
      ...formData,
      consorcio_id: consorcioId,
      cuit_receptor: consorcio?.cuit || formData.cuit_receptor,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!factura) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/facturas/${factura.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nro_factura: formData.nro_factura || null,
          detalle: formData.detalle || null,
          importe: formData.importe ? parseFloat(formData.importe) : null,
          cuit_emisor: formData.cuit_emisor || null,
          cuit_receptor: formData.cuit_receptor || null,
          fecha_factura: formData.fecha_factura || null,
          proveedor_id: formData.proveedor_id || null,
          consorcio_id: formData.consorcio_id || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar la factura')
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Factura</DialogTitle>
          <DialogDescription>
            Modifica los datos de la factura. Puedes asignar un proveedor y/o consorcio.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Proveedor */}
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor</Label>
                <select
                  id="proveedor"
                  value={formData.proveedor_id}
                  onChange={(e) => handleProveedorChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sin proveedor</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.nombre_fantasia ? `(${p.nombre_fantasia})` : ''} - {p.cuit}
                    </option>
                  ))}
                </select>
                {formData.cuit_emisor && !formData.proveedor_id && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span>CUIT sin matchear: {formData.cuit_emisor}</span>
                  </div>
                )}
              </div>

              {/* Consorcio */}
              <div className="space-y-2">
                <Label htmlFor="consorcio">Consorcio</Label>
                <select
                  id="consorcio"
                  value={formData.consorcio_id}
                  onChange={(e) => handleConsorcioChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sin consorcio</option>
                  {consorcios.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} - {c.cuit}
                    </option>
                  ))}
                </select>
                {formData.cuit_receptor && !formData.consorcio_id && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span>CUIT sin matchear: {formData.cuit_receptor}</span>
                  </div>
                )}
              </div>

              {/* Número de Factura */}
              <div className="space-y-2">
                <Label htmlFor="nro_factura">Número de Factura</Label>
                <Input
                  id="nro_factura"
                  value={formData.nro_factura}
                  onChange={(e) => setFormData({ ...formData, nro_factura: e.target.value })}
                  placeholder="00003-00002916"
                />
              </div>

              {/* Fecha de Factura */}
              <div className="space-y-2">
                <Label htmlFor="fecha_factura">Fecha de Factura</Label>
                <Input
                  id="fecha_factura"
                  type="date"
                  value={formData.fecha_factura}
                  onChange={(e) => setFormData({ ...formData, fecha_factura: e.target.value })}
                />
              </div>

              {/* Importe */}
              <div className="space-y-2">
                <Label htmlFor="importe">Importe ($)</Label>
                <Input
                  id="importe"
                  type="number"
                  step="0.01"
                  value={formData.importe}
                  onChange={(e) => setFormData({ ...formData, importe: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              {/* CUIT Emisor (readonly, se actualiza al seleccionar proveedor) */}
              <div className="space-y-2">
                <Label htmlFor="cuit_emisor">CUIT Emisor</Label>
                <Input
                  id="cuit_emisor"
                  value={formData.cuit_emisor}
                  onChange={(e) => setFormData({ ...formData, cuit_emisor: e.target.value })}
                  placeholder="20-12345678-9"
                />
              </div>

              {/* CUIT Receptor (readonly, se actualiza al seleccionar consorcio) */}
              <div className="space-y-2">
                <Label htmlFor="cuit_receptor">CUIT Receptor</Label>
                <Input
                  id="cuit_receptor"
                  value={formData.cuit_receptor}
                  onChange={(e) => setFormData({ ...formData, cuit_receptor: e.target.value })}
                  placeholder="30-12345678-9"
                />
              </div>

              {/* Detalle */}
              <div className="space-y-2">
                <Label htmlFor="detalle">Detalle / Descripción</Label>
                <Textarea
                  id="detalle"
                  value={formData.detalle}
                  onChange={(e) => setFormData({ ...formData, detalle: e.target.value })}
                  placeholder="Descripción de la factura..."
                  rows={3}
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
