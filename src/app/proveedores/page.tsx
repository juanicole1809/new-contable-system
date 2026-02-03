import { supabase, type Proveedor } from '@/lib/supabase'
import { ProveedoresClient } from './proveedores-client'

async function getProveedores(): Promise<Proveedor[]> {
  const { data } = await supabase
    .from('proveedores')
    .select('*')
    .order('created_at', { ascending: false })

  return data ?? []
}

export default async function ProveedoresPage() {
  const proveedores = await getProveedores()

  return <ProveedoresClient initialProveedores={proveedores} />
}
