import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Factura = {
  id: string
  nro_factura: string | null
  detalle: string | null
  importe: number | null
  cuit_emisor: string | null
  cuit_receptor: string | null
  fecha_factura: string | null
  ocr_data: any
  created_at: string
}

export type Proveedor = {
  id: string
  cuit: string
  nombre: string
  nombre_fantasia: string | null
  mail: string | null
  created_at: string
}

export type Consorcio = {
  id: string
  cuit: string
  nombre: string
  redconar_building_id: string | null
  created_at: string
}
