'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Proveedor } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateProveedorForm } from '@/components/create-proveedor-form'
import { Users, RefreshCw, Link2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProveedoresClientProps {
  initialProveedores: Proveedor[]
}

export function ProveedoresClient({ initialProveedores }: ProveedoresClientProps) {
  const router = useRouter()
  const [proveedores, setProveedores] = useState(initialProveedores)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{
    linked: number
    linkErrors: number
    newInRedconar: number
    missingInRedconar: number
  } | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)

    try {
      const response = await fetch('/api/proveedores/sync-redconar', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al sincronizar')
      }

      const result = await response.json()
      setSyncResult(result)

      // Refrescar la página para mostrar los datos actualizados
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Error al sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  // Contadores
  const withRedconarId = proveedores.filter(p => p.redconar_prov_id).length
  const withoutRedconarId = proveedores.filter(p => p.cuit && !p.redconar_prov_id).length
  const withoutCuit = proveedores.filter(p => !p.cuit).length

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Proveedores</h1>
          </div>
          <p className="text-slate-600 ml-11">Gestión de proveedores del sistema</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={syncing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar con Redconar'}
          </Button>
          <CreateProveedorForm />
        </div>
      </div>

      {/* Resultado de sincronización */}
      {syncResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Resultado de sincronización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{syncResult.linked}</div>
                <div className="text-sm text-slate-600">Vinculados</div>
              </div>
              {syncResult.linkErrors > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{syncResult.linkErrors}</div>
                  <div className="text-sm text-slate-600">Errores</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{syncResult.newInRedconar}</div>
                <div className="text-sm text-slate-600">Nuevos en Redconar</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{syncResult.missingInRedconar}</div>
                <div className="text-sm text-slate-600">Faltan en Redconar</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{proveedores.length}</div>
              <div className="text-sm text-slate-600">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{withRedconarId}</div>
              <div className="text-sm text-slate-600 flex items-center justify-center gap-1">
                <Link2 className="w-3 h-3" />
                Con Redconar
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{withoutRedconarId}</div>
              <div className="text-sm text-slate-600">Sin vincular</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-600">{withoutCuit}</div>
              <div className="text-sm text-slate-600">Sin CUIT</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proveedores ({proveedores.length})</CardTitle>
          <CardDescription>
            Lista de proveedores registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {proveedores.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay proveedores registrados</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-72 font-semibold">Proveedor</TableHead>
                    <TableHead className="w-36 font-semibold">CUIT</TableHead>
                    <TableHead className="w-56 font-semibold">Email</TableHead>
                    <TableHead className="w-24 font-semibold">Redconar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proveedores.map((proveedor) => (
                    <TableRow key={proveedor.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex flex-col" title={`${proveedor.nombre_fantasia || proveedor.nombre || ''}\n${proveedor.nombre || ''}`}>
                          <span className="font-medium truncate">
                            {proveedor.nombre_fantasia || proveedor.nombre || '-'}
                          </span>
                          <span className="text-xs text-slate-500 truncate">
                            {proveedor.nombre || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {proveedor.cuit || '-'}
                          {!proveedor.cuit && (
                            <span title="Sin CUIT">
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{proveedor.mail || '-'}</TableCell>
                      <TableCell>
                        {proveedor.redconar_prov_id ? (
                          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 gap-1">
                            <Link2 className="w-3 h-3" />
                            Vinculado
                          </Badge>
                        ) : proveedor.cuit ? (
                          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                            Sin vincular
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
