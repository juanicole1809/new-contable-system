import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Building, ArrowLeft } from 'lucide-react'
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

export default async function EditConsorcioPage({
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
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
            <Building className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Editar Consorcio</h1>
        </div>
        <p className="text-sm sm:text-base text-slate-600 ml-8 sm:ml-11">{consorcio.nombre}</p>
      </div>

      {/* Formulario de edición */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Editar Información</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Modifica los datos del consorcio
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Dirección</span>
              <p className="text-base font-medium text-slate-900">{consorcio.nombre}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">CUIT</span>
              <p className="text-base font-mono text-slate-900">{consorcio.cuit}</p>
            </div>
            {consorcio.redconar_building_id && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Redconar ID</span>
                <p className="text-base font-medium text-slate-900">{consorcio.redconar_building_id}</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500 italic">
              El formulario de edición se implementará en una próxima iteración.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
