'use client'

import { useState, useMemo } from 'react'
import { type Consorcio } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Building, Search, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ConsorciosGridProps {
  consorcios: Consorcio[]
}

export function ConsorciosGrid({ consorcios }: ConsorciosGridProps) {
  const [search, setSearch] = useState('')

  const filteredConsorcios = useMemo(() => {
    if (!search.trim()) return consorcios

    const searchLower = search.toLowerCase()
    return consorcios.filter((consorcio) => {
      return (
        consorcio.nombre?.toLowerCase().includes(searchLower) ||
        consorcio.cuit?.toLowerCase().includes(searchLower) ||
        consorcio.redconar_building_id?.toLowerCase().includes(searchLower)
      )
    })
  }, [consorcios, search])

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Buscar por dirección, CUIT o Redconar ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10"
        />
      </div>

      {/* Resultados de búsqueda */}
      {search && (
        <div className="text-sm text-slate-500">
          Mostrando {filteredConsorcios.length} de {consorcios.length} consorcios
        </div>
      )}

      {/* Grid de Cards */}
      {filteredConsorcios.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{search ? 'No se encontraron consorcios con la búsqueda' : 'No hay consorcios registrados'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredConsorcios.map((consorcio) => (
            <div
              key={consorcio.id}
              className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Header de la card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                    <Building className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900 truncate" title={consorcio.nombre}>
                      {consorcio.nombre}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Información */}
              <div className="space-y-2 sm:space-y-3 mb-4 flex-1">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">CUIT</span>
                  <p className="text-xs sm:text-sm font-mono text-slate-700 mt-1 break-all">{consorcio.cuit}</p>
                </div>
                {consorcio.redconar_building_id && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Redconar ID</span>
                    <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1 break-all">{consorcio.redconar_building_id}</p>
                  </div>
                )}
              </div>

              {/* Botón de acción */}
              <div className="pt-4 border-t border-slate-200 mt-auto">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full text-xs sm:text-sm px-2 sm:px-3"
                  asChild
                >
                  <Link href={`/consorcios/${consorcio.id}`} className="flex items-center justify-center gap-1 sm:gap-2">
                    <span className="hidden sm:inline">Ingresar</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
