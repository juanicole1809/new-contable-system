import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Building, ArrowLeft, Edit2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

async function getConsorcio(id: string) {
  const { data, error } = await supabase
    .from('consorcios')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function ConsorcioDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  // Manejar params como Promise (Next.js 15) o objeto directo
  const resolvedParams = await Promise.resolve(params)
  const consorcio = await getConsorcio(resolvedParams.id)

  if (!consorcio) {
    notFound()
  }

  // Formatear fecha de creación
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-'
    
    try {
      const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
      if (dateMatch) {
        const [, year, month, day] = dateMatch
        return `${day}/${month}/${year}`
      }
      
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
      }
      
      return dateString
    } catch {
      return dateString || '-'
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1920px] mx-auto md:pt-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link href="/consorcios">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Consorcios
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
              <Building className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{consorcio.nombre}</h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1">Detalle del consorcio</p>
            </div>
          </div>
          <Link href={`/consorcios/${consorcio.id}/edit`}>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Edit2 className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Información del consorcio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Información General</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Datos del consorcio registrado en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Building className="w-3 h-3" />
                Dirección
              </span>
              <p className="text-base font-medium text-slate-900 mt-2">{consorcio.nombre}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">CUIT</span>
              <p className="text-base font-mono text-slate-900 mt-2">{consorcio.cuit}</p>
            </div>
            {consorcio.redconar_building_id && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Redconar ID</span>
                <p className="text-base font-medium text-slate-900 mt-2">{consorcio.redconar_building_id}</p>
              </div>
            )}
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Fecha de Registro
              </span>
              <p className="text-base font-medium text-slate-900 mt-2">{formatDate(consorcio.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
