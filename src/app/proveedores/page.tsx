import { supabase, type Proveedor } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateProveedorForm } from '@/components/create-proveedor-form'
import { Users } from 'lucide-react'

async function getProveedores(): Promise<Proveedor[]> {
  const { data } = await supabase
    .from('proveedores')
    .select('*')
    .order('created_at', { ascending: false })

  return data ?? []
}

export default async function ProveedoresPage() {
  const proveedores = await getProveedores()

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
        <CreateProveedorForm />
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
                    <TableHead className="font-semibold">CUIT</TableHead>
                    <TableHead className="font-semibold">Razón Social</TableHead>
                    <TableHead className="font-semibold">Nombre Fantasía</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Creado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proveedores.map((proveedor) => (
                    <TableRow key={proveedor.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{proveedor.cuit}</TableCell>
                      <TableCell>{proveedor.nombre}</TableCell>
                      <TableCell>{proveedor.nombre_fantasia || '-'}</TableCell>
                      <TableCell>{proveedor.mail || '-'}</TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(proveedor.created_at).toLocaleDateString('es-AR', {
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
  )
}
