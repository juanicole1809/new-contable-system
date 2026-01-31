import { supabase, type Consorcio } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateConsorcioForm } from '@/components/create-consorcio-form'
import { Building } from 'lucide-react'

async function getConsorcios(): Promise<Consorcio[]> {
  const { data } = await supabase
    .from('consorcios')
    .select('*')
    .order('created_at', { ascending: false })

  return data ?? []
}

export default async function ConsorciosPage() {
  const consorcios = await getConsorcios()

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Building className="w-6 h-6 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Consorcios</h1>
          </div>
          <p className="text-slate-600 ml-11">Gestión de consorcios del sistema</p>
        </div>
        <CreateConsorcioForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consorcios ({consorcios.length})</CardTitle>
          <CardDescription>
            Lista de consorcios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {consorcios.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay consorcios registrados</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Dirección</TableHead>
                    <TableHead className="font-semibold">CUIT</TableHead>
                    <TableHead className="font-semibold">Redconar ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consorcios.map((consorcio) => (
                    <TableRow key={consorcio.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{consorcio.nombre}</TableCell>
                      <TableCell>{consorcio.cuit}</TableCell>
                      <TableCell>{consorcio.redconar_building_id || '-'}</TableCell>
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
