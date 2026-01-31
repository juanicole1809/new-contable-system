import { supabase, type Factura } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadFactura } from '@/components/upload-factura'

async function getFacturas(): Promise<Factura[]> {
  const { data } = await supabase
    .from('facturas')
    .select('*')
    .order('created_at', { ascending: false })

  return data ?? []
}

export default async function HomePage() {
  const facturas = await getFacturas()

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contable Software</h1>
          <p className="text-gray-600 mt-2">Gestión de Facturas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Facturas ({facturas.length})</CardTitle>
            <CardDescription>
              Subí una factura (PDF/JPG) para procesarla con OCR de Redconar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadFactura />

            {facturas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay facturas registradas
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Factura</TableHead>
                      <TableHead>Detalle</TableHead>
                      <TableHead>Importe</TableHead>
                      <TableHead>CUIT Emisor</TableHead>
                      <TableHead>CUIT Receptor</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Creada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturas.map((factura) => (
                      <TableRow key={factura.id}>
                        <TableCell className="font-medium">{factura.nro_factura || '-'}</TableCell>
                        <TableCell className="max-w-md truncate">{factura.detalle || '-'}</TableCell>
                        <TableCell>
                          {factura.importe
                            ? `$${factura.importe.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                            : '-'}
                        </TableCell>
                        <TableCell>{factura.cuit_emisor || '-'}</TableCell>
                        <TableCell>{factura.cuit_receptor || '-'}</TableCell>
                        <TableCell>{factura.fecha_factura || '-'}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(factura.created_at).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
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
    </main>
  )
}
