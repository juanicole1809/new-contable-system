import { supabase, type Consorcio } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateConsorcioForm } from '@/components/create-consorcio-form'
import { ConsorciosGrid } from '@/components/consorcios-grid'
import { Building } from 'lucide-react'

async function getConsorcios(): Promise<Consorcio[]> {
  const { data } = await supabase
    .from('consorcios')
    .select('*')
    .order('nombre', { ascending: true })

  return data ?? []
}

export default async function ConsorciosPage() {
  const consorcios = await getConsorcios()

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1920px] mx-auto md:pt-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
              <Building className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Consorcios</h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 ml-8 sm:ml-11">Gestión de consorcios del sistema</p>
        </div>
        <CreateConsorcioForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Consorcios ({consorcios.length})</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Lista de consorcios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <ConsorciosGrid consorcios={consorcios} />
        </CardContent>
      </Card>
    </div>
  )
}
