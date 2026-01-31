'use client'

import React, { useState } from 'react'
import { type Factura } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash2, ChevronDown } from 'lucide-react'

interface FacturasTableProps {
  facturas: Factura[]
}

export function FacturasTable({ facturas }: FacturasTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-32 font-semibold">Fecha</TableHead>
            <TableHead className="w-32 font-semibold">N° Factura</TableHead>
            <TableHead className="w-48 font-semibold">Detalle</TableHead>
            <TableHead className="w-32 font-semibold">Importe</TableHead>
            <TableHead className="w-36 font-semibold">CUIT Emisor</TableHead>
            <TableHead className="w-36 font-semibold">CUIT Receptor</TableHead>
            <TableHead className="w-28 font-semibold">Creada</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facturas.map((factura) => (
            <React.Fragment key={factura.id}>
              <TableRow className="hover:bg-slate-50 group">
                {/* Fecha clickable para expandir */}
                <TableCell className="cursor-pointer hover:bg-slate-100" onClick={() => setExpandedId(expandedId === factura.id ? null : factura.id)}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{factura.fecha_factura || '-'}</span>
                    {factura.detalle && (
                      <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${expandedId === factura.id ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableCell>

                <TableCell className="font-medium">{factura.nro_factura || '-'}</TableCell>

                {/* Detalle truncado sin botón */}
                <TableCell className="max-w-48">
                  <div className="truncate" title={factura.detalle || '-'}>
                    {factura.detalle || '-'}
                  </div>
                </TableCell>

                <TableCell>
                  {factura.importe ? (
                    <Badge variant="outline" className="font-semibold">
                      ${factura.importe.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </Badge>
                  ) : '-'}
                </TableCell>
                <TableCell className="font-mono text-sm">{factura.cuit_emisor || '-'}</TableCell>
                <TableCell className="font-mono text-sm">{factura.cuit_receptor || '-'}</TableCell>
                <TableCell className="text-sm text-slate-500">
                  {new Date(factura.created_at).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {expandedId === factura.id && factura.detalle && (
                <TableRow>
                  <TableCell colSpan={8} className="bg-slate-50/50 border-b border-slate-200">
                    <div className="p-4 space-y-3">
                      <h4 className="text-sm font-semibold text-slate-700">Detalle completo</h4>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {factura.detalle}
                      </p>
                      {/* Información adicional en formato horizontal */}
                      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-slate-500 border-t border-slate-200 mt-3">
                        <span><strong>N° Factura:</strong> {factura.nro_factura || '-'}</span>
                        <span><strong>Importe:</strong> ${factura.importe?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '-'}</span>
                        <span><strong>CUIT Emisor:</strong> {factura.cuit_emisor || '-'}</span>
                        <span><strong>CUIT Receptor:</strong> {factura.cuit_receptor || '-'}</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
