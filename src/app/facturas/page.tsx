import { supabase, type Factura } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadFactura } from '@/components/upload-factura'
import { FacturasTable } from '@/components/facturas-table'
import { FileText } from 'lucide-react'

async function getFacturas(): Promise<Factura[]> {
  const { data } = await supabase
    .from('facturas')
    .select('*')
    .order('created_at', { ascending: false })

  return data ?? []
}

export default async function FacturasPage() {
  const facturas = await getFacturas()

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-violet-100 rounded-lg">
            <FileText className="w-6 h-6 text-violet-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Facturas</h1>
        </div>
        <p className="text-slate-600 ml-11">Gestión de facturas con OCR de Redconar</p>
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
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay facturas registradas</p>
            </div>
          ) : (
            <FacturasTable facturas={facturas} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
