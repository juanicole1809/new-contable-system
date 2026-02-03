'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Loader2, AlertTriangle, CheckCircle2, Link2, Unlink } from 'lucide-react'

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

  // Opciones para los selects con búsqueda
  const proveedorOptions = useMemo(() => {
    return proveedores.map((p) => ({
      value: p.id,
      label: p.nombre,
      subtitle: p.cuit
        ? `${p.cuit}${p.nombre_fantasia ? ` · ${p.nombre_fantasia}` : ''}`
        : p.nombre_fantasia || 'Sin CUIT',
    }))
  }, [proveedores])

  const consorcioOptions = useMemo(() => {
    return consorcios.map((c) => ({
      value: c.id,
      label: c.nombre,
      subtitle: c.cuit || 'Sin CUIT',
    }))
  }, [consorcios])

  // Obtener proveedor y consorcio seleccionados
  const proveedorSeleccionado = useMemo(() => {
    if (!formData.proveedor_id) return null
    return proveedores.find(p => p.id === formData.proveedor_id) || null
  }, [formData.proveedor_id, proveedores])

  const consorcioSeleccionado = useMemo(() => {
    if (!formData.consorcio_id) return null
    return consorcios.find(c => c.id === formData.consorcio_id) || null
  }, [formData.consorcio_id, consorcios])

  // Verificar si el CUIT emisor coincide con el proveedor seleccionado
  const cuitEmisorMatches = useMemo(() => {
    if (!proveedorSeleccionado) return null
    if (!proveedorSeleccionado.cuit) return null // Proveedor sin CUIT
    return proveedorSeleccionado.cuit === formData.cuit_emisor
  }, [proveedorSeleccionado, formData.cuit_emisor])

  // Verificar si el CUIT receptor coincide con el consorcio seleccionado
  const cuitReceptorMatches = useMemo(() => {
    if (!consorcioSeleccionado) return null
    if (!consorcioSeleccionado.cuit) return null // Consorcio sin CUIT
    return consorcioSeleccionado.cuit === formData.cuit_receptor
  }, [consorcioSeleccionado, formData.cuit_receptor])

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

  // Cuando se selecciona un proveedor, actualizar el CUIT al del proveedor
  const handleProveedorChange = (proveedorId: string) => {
    const proveedor = proveedores.find(p => p.id === proveedorId)
    setFormData({
      ...formData,
      proveedor_id: proveedorId,
      cuit_emisor: proveedor?.cuit || formData.cuit_emisor,
    })
  }

  // Desasociar proveedor y permitir editar CUIT manualmente
  const handleUnlinkProveedor = () => {
    setFormData({
      ...formData,
      proveedor_id: '',
    })
  }

  // Cuando se selecciona un consorcio, actualizar el CUIT al del consorcio
  const handleConsorcioChange = (consorcioId: string) => {
    const consorcio = consorcios.find(c => c.id === consorcioId)
    setFormData({
      ...formData,
      consorcio_id: consorcioId,
      cuit_receptor: consorcio?.cuit || formData.cuit_receptor,
    })
  }

  // Desasociar consorcio y permitir editar CUIT manualmente
  const handleUnlinkConsorcio = () => {
    setFormData({
      ...formData,
      consorcio_id: '',
    })
  }

  // Matchear automáticamente proveedor por CUIT al cambiar el CUIT emisor
  const handleCuitEmisorChange = (cuit: string) => {
    setFormData({ ...formData, cuit_emisor: cuit })
    // Si hay un proveedor con ese CUIT, asociarlo automáticamente
    const proveedor = proveedores.find(p => p.cuit === cuit)
    if (proveedor && !formData.proveedor_id) {
      setFormData(prev => ({ ...prev, cuit_emisor: cuit, proveedor_id: proveedor.id }))
    } else if (!proveedor && formData.proveedor_id) {
      // Si el CUIT no coincide con ningún proveedor, desasociar
      setFormData(prev => ({ ...prev, cuit_emisor: cuit, proveedor_id: '' }))
    }
  }

  // Matchear automáticamente consorcio por CUIT al cambiar el CUIT receptor
  const handleCuitReceptorChange = (cuit: string) => {
    setFormData({ ...formData, cuit_receptor: cuit })
    // Si hay un consorcio con ese CUIT, asociarlo automáticamente
    const consorcio = consorcios.find(c => c.cuit === cuit)
    if (consorcio && !formData.consorcio_id) {
      setFormData(prev => ({ ...prev, cuit_receptor: cuit, consorcio_id: consorcio.id }))
    } else if (!consorcio && formData.consorcio_id) {
      // Si el CUIT no coincide con ningún consorcio, desasociar
      setFormData(prev => ({ ...prev, cuit_receptor: cuit, consorcio_id: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!factura) return

    setLoading(true)
    setError(null)

    // Determinar proveedor_id: si está vacío pero el CUIT coincide con algún proveedor, asociarlo
    let proveedorIdToSend = formData.proveedor_id || null
    if (!proveedorIdToSend && formData.cuit_emisor) {
      const proveedorMatch = proveedores.find(p => p.cuit === formData.cuit_emisor)
      if (proveedorMatch) {
        proveedorIdToSend = proveedorMatch.id
      }
    }

    // Determinar consorcio_id: si está vacío pero el CUIT coincide con algún consorcio, asociarlo
    let consorcioIdToSend = formData.consorcio_id || null
    if (!consorcioIdToSend && formData.cuit_receptor) {
      const consorcioMatch = consorcios.find(c => c.cuit === formData.cuit_receptor)
      if (consorcioMatch) {
        consorcioIdToSend = consorcioMatch.id
      }
    }

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
          proveedor_id: proveedorIdToSend,
          consorcio_id: consorcioIdToSend,
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Factura</DialogTitle>
          <DialogDescription>
            Modifica los datos de la factura. Puedes asignar un proveedor y/o consorcio, o editar los CUITs directamente.
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="proveedor">Proveedor</Label>
                  {formData.proveedor_id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      onClick={handleUnlinkProveedor}
                    >
                      <Unlink className="w-3 h-3 mr-1" />
                      Desasociar
                    </Button>
                  )}
                </div>
                <SearchableSelect
                  options={proveedorOptions}
                  value={formData.proveedor_id}
                  onChange={handleProveedorChange}
                  placeholder={formData.proveedor_id ? '' : 'Buscar por nombre o CUIT...'}
                  searchPlaceholder="Buscar proveedor por nombre o CUIT..."
                  emptyText="No se encontraron proveedores"
                  allowClear={!formData.proveedor_id}
                  onClear={() => setFormData({ ...formData, proveedor_id: '' })}
                />
                {formData.proveedor_id && proveedorSeleccionado && !proveedorSeleccionado.cuit && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1.5 rounded-md border border-blue-200">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>El proveedor seleccionado no tiene CUIT configurado</span>
                  </div>
                )}
                {formData.proveedor_id && proveedorSeleccionado?.cuit && cuitEmisorMatches === false && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded-md border border-amber-200">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>El CUIT del emisor no coincide con el proveedor seleccionado</span>
                  </div>
                )}
              </div>

              {/* Consorcio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="consorcio">Consorcio</Label>
                  {formData.consorcio_id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      onClick={handleUnlinkConsorcio}
                    >
                      <Unlink className="w-3 h-3 mr-1" />
                      Desasociar
                    </Button>
                  )}
                </div>
                <SearchableSelect
                  options={consorcioOptions}
                  value={formData.consorcio_id}
                  onChange={handleConsorcioChange}
                  placeholder={formData.consorcio_id ? '' : 'Buscar por nombre o CUIT...'}
                  searchPlaceholder="Buscar consorcio por nombre o CUIT..."
                  emptyText="No se encontraron consorcios"
                  allowClear={!formData.consorcio_id}
                  onClear={() => setFormData({ ...formData, consorcio_id: '' })}
                />
                {formData.consorcio_id && consorcioSeleccionado && !consorcioSeleccionado.cuit && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1.5 rounded-md border border-blue-200">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>El consorcio seleccionado no tiene CUIT configurado</span>
                  </div>
                )}
                {formData.consorcio_id && consorcioSeleccionado?.cuit && cuitReceptorMatches === false && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded-md border border-amber-200">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>El CUIT del receptor no coincide con el consorcio seleccionado</span>
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

              {/* CUIT Emisor - solo mostrar si NO hay proveedor asociado */}
              {!formData.proveedor_id && (
                <div className="space-y-2">
                  <Label htmlFor="cuit_emisor">CUIT Emisor</Label>
                  <Input
                    id="cuit_emisor"
                    value={formData.cuit_emisor}
                    onChange={(e) => handleCuitEmisorChange(e.target.value)}
                    placeholder="20-12345678-9"
                  />
                  {formData.cuit_emisor && (
                    <p className="text-xs text-slate-500">
                      Si el CUIT coincide con un proveedor existente, se asociará automáticamente al guardar
                    </p>
                  )}
                </div>
              )}

              {/* CUIT Receptor - solo mostrar si NO hay consorcio asociado */}
              {!formData.consorcio_id && (
                <div className="space-y-2">
                  <Label htmlFor="cuit_receptor">CUIT Receptor</Label>
                  <Input
                    id="cuit_receptor"
                    value={formData.cuit_receptor}
                    onChange={(e) => handleCuitReceptorChange(e.target.value)}
                    placeholder="30-12345678-9"
                  />
                  {formData.cuit_receptor && (
                    <p className="text-xs text-slate-500">
                      Si el CUIT coincide con un consorcio existente, se asociará automáticamente al guardar
                    </p>
                  )}
                </div>
              )}

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
