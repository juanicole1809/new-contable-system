import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Legacy client for backward compatibility (API routes, scripts, etc.)
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
  proveedor_id: string | null
  consorcio_id: string | null
  created_at: string
  // Join fields (when fetching with relations)
  proveedores?: Proveedor
  consorcios?: Consorcio
}

export type Proveedor = {
  id: string
  cuit: string | null
  nombre: string
  nombre_fantasia: string | null
  mail: string | null
  redconar_prov_id: string | null
  created_at: string
}

export type Consorcio = {
  id: string
  cuit: string | null
  nombre: string
  redconar_building_id: string | null
  created_at: string
}
