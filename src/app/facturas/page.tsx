import { supabase, type Factura } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadFactura } from '@/components/upload-factura'
import { FacturasTable } from '@/components/facturas-table'
import { FileText } from 'lucide-react'

async function getFacturas(): Promise<Factura[]> {
  const { data } = await supabase
    .from('facturas')
    .select('*, proveedores(*), consorcios(*)')
    .order('created_at', { ascending: false })

  return data ?? []
}

export default async function FacturasPage() {
  const facturas = await getFacturas()

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1920px] mx-auto md:pt-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="p-1.5 sm:p-2 bg-violet-100 rounded-lg flex-shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Facturas</h1>
        </div>
        <p className="text-sm sm:text-base text-slate-600 ml-8 sm:ml-11">Gestión de facturas con OCR de Redconar</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Facturas ({facturas.length})</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Subí una factura (PDF/JPG) para procesarla con OCR de Redconar
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
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
