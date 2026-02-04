'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { type Factura } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit2, Trash2, ChevronDown, Search, X, Filter, ChevronUp, Loader2, AlertTriangle } from 'lucide-react'
import { EditFacturaDialog } from '@/components/edit-factura-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { MultiSelect } from '@/components/ui/multi-select'
import { type Consorcio, type Proveedor } from '@/lib/supabase'

interface FacturasTableProps {
  facturas: Factura[]
}

interface Filters {
  search: string
  fechaDesde: string
  fechaHasta: string
  importeMin: string
  importeMax: string
  cuitEmisor: string
  consorcioId: string
  proveedorIds: string[]
}

type SortColumn = 'consorcio' | 'proveedor' | 'fecha' | 'nroFactura' | 'detalle' | 'importe'
type SortDirection = 'asc' | 'desc' | null

export function FacturasTable({ facturas }: FacturasTableProps) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [sortColumn, setSortColumn] = useState<SortColumn>('proveedor')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filters, setFilters] = useState<Filters>({
    search: '',
    fechaDesde: '',
    fechaHasta: '',
    importeMin: '',
    importeMax: '',
    cuitEmisor: '',
    consorcioId: '',
    proveedorIds: [],
  })

  // Obtener listas únicas de consorcios y proveedores
  const consorciosUnicos = useMemo(() => {
    const consorciosMap = new Map<string, Consorcio>()
    facturas.forEach((factura) => {
      if (factura.consorcios && !consorciosMap.has(factura.consorcios.id)) {
        consorciosMap.set(factura.consorcios.id, factura.consorcios)
      }
    })
    return Array.from(consorciosMap.values()).sort((a, b) => 
      a.nombre.localeCompare(b.nombre)
    )
  }, [facturas])

  const proveedoresUnicos = useMemo(() => {
    const proveedoresMap = new Map<string, Proveedor>()
    facturas.forEach((factura) => {
      if (factura.proveedores && !proveedoresMap.has(factura.proveedores.id)) {
        proveedoresMap.set(factura.proveedores.id, factura.proveedores)
      }
    })
    return Array.from(proveedoresMap.values()).sort((a, b) => 
      a.nombre.localeCompare(b.nombre)
    )
  }, [facturas])

  // Opciones para los selects
  const consorcioOptions = useMemo(() => {
    return consorciosUnicos.map((c) => ({
      value: c.id,
      label: c.nombre,
      subtitle: c.cuit || 'Sin CUIT',
    }))
  }, [consorciosUnicos])

  const proveedorOptions = useMemo(() => {
    return proveedoresUnicos.map((p) => ({
      value: p.id,
      label: p.nombre,
      subtitle: p.cuit
        ? `${p.cuit}${p.nombre_fantasia ? ` · ${p.nombre_fantasia}` : ''}`
        : p.nombre_fantasia || 'Sin CUIT',
    }))
  }, [proveedoresUnicos])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [facturaToEdit, setFacturaToEdit] = useState<Factura | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [facturaToDelete, setFacturaToDelete] = useState<Factura | null>(null)

  const filteredFacturas = useMemo(() => {
    return facturas.filter((factura) => {
      // Filtro de búsqueda (detalle o número de factura)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          factura.detalle?.toLowerCase().includes(searchLower) ||
          factura.nro_factura?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Filtro por consorcio
      if (filters.consorcioId) {
        if (factura.consorcio_id !== filters.consorcioId) return false
      }

      // Filtro por proveedor (múltiple)
      if (filters.proveedorIds.length > 0) {
        if (!factura.proveedor_id || !filters.proveedorIds.includes(factura.proveedor_id)) {
          return false
        }
      }

      // Filtro por fecha
      if (filters.fechaDesde && factura.fecha_factura) {
        if (factura.fecha_factura < filters.fechaDesde) return false
      }
      if (filters.fechaHasta && factura.fecha_factura) {
        if (factura.fecha_factura > filters.fechaHasta) return false
      }

      // Filtro por importe
      if (filters.importeMin && factura.importe) {
        if (factura.importe < parseFloat(filters.importeMin)) return false
      }
      if (filters.importeMax && factura.importe) {
        if (factura.importe > parseFloat(filters.importeMax)) return false
      }

      // Filtro por CUIT emisor
      if (filters.cuitEmisor) {
        const cuitLower = filters.cuitEmisor.toLowerCase()
        if (!factura.cuit_emisor?.toLowerCase().includes(cuitLower)) return false
      }

      return true
    })
  }, [facturas, filters])

  const hasActiveFilters = useMemo(() => {
    return filters.search !== '' ||
      filters.fechaDesde !== '' ||
      filters.fechaHasta !== '' ||
      filters.importeMin !== '' ||
      filters.importeMax !== '' ||
      filters.cuitEmisor !== '' ||
      filters.consorcioId !== '' ||
      filters.proveedorIds.length > 0
  }, [filters])

  // Sort logic - when sorting by consorcio or proveedor, always sort by consorcio first, then by proveedor
  const sortedFacturas = useMemo(() => {
    return [...filteredFacturas].sort((a, b) => {
      // Helper function to compare two values
      const compare = (valA: any, valB: any, direction: 'asc' | 'desc') => {
        if (valA < valB) return direction === 'asc' ? -1 : 1
        if (valA > valB) return direction === 'asc' ? 1 : -1
        return 0
      }

      // When sorting by consorcio or proveedor, use composite sort (consorcio first, then proveedor)
      if (sortColumn === 'consorcio' || sortColumn === 'proveedor') {
        const consorcioA = a.consorcios?.nombre?.toLowerCase() || ''
        const consorcioB = b.consorcios?.nombre?.toLowerCase() || ''
        const consorcioResult = compare(consorcioA, consorcioB, sortDirection || 'asc')

        // If consorcios are different, return that result
        if (consorcioResult !== 0) return consorcioResult

        // Same consorcio, sort by proveedor as secondary
        const proveedorA = a.proveedores?.nombre?.toLowerCase() || ''
        const proveedorB = b.proveedores?.nombre?.toLowerCase() || ''
        return compare(proveedorA, proveedorB, sortDirection || 'asc')
      }

      // For other columns, just sort by that column
      if (!sortDirection) return 0

      let compareA: any
      let compareB: any

      switch (sortColumn) {
        case 'fecha':
          compareA = a.fecha_factura || ''
          compareB = b.fecha_factura || ''
          break
        case 'nroFactura':
          compareA = a.nro_factura || ''
          compareB = b.nro_factura || ''
          break
        case 'detalle':
          compareA = a.detalle?.toLowerCase() || ''
          compareB = b.detalle?.toLowerCase() || ''
          break
        case 'importe':
          compareA = a.importe || 0
          compareB = b.importe || 0
          break
        default:
          return 0
      }

      return compare(compareA, compareB, sortDirection)
    })
  }, [filteredFacturas, sortColumn, sortDirection])

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      fechaDesde: '',
      fechaHasta: '',
      importeMin: '',
      importeMax: '',
      cuitEmisor: '',
      consorcioId: '',
      proveedorIds: [],
    })
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-'
    
    try {
      // Si la fecha viene en formato YYYY-MM-DD (con o sin hora), parsear manualmente
      const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
      if (dateMatch) {
        const [, year, month, day] = dateMatch
        // Retornar en formato DD/MM/YYYY
        return `${day}/${month}/${year}`
      }
      
      // Si viene en otro formato, intentar con Date
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
      }
      
      // Si no se puede parsear, retornar el string original
      return dateString
    } catch {
      return dateString || '-'
    }
  }

  const handleEdit = (factura: Factura) => {
    setFacturaToEdit(factura)
    setEditDialogOpen(true)
  }

  const handleDelete = (factura: Factura) => {
    setFacturaToDelete(factura)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!facturaToDelete) return

    setDeleteLoading(facturaToDelete.id)

    try {
      const response = await fetch(`/api/facturas/${facturaToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Error al eliminar la factura')
      }

      setDeleteDialogOpen(false)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar la factura')
    } finally {
      setDeleteLoading(null)
      setFacturaToDelete(null)
    }
  }

  const handleEditSuccess = () => {
    router.refresh()
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Botón para mostrar/ocultar filtros */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="h-9 gap-2"
        >
          <Filter className="w-4 h-4" />
          <span>{showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}</span>
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {Object.values(filters).filter(v => {
                if (typeof v === 'string') return v !== ''
                if (Array.isArray(v)) return v.length > 0
                return false
              }).length}
            </span>
          )}
          {showFilters ? (
            <ChevronUp className="w-4 h-4 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1" />
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="rounded-md border bg-white p-3 sm:p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Consorcio - Primera fila */}
          <div className="space-y-2">
            <Label htmlFor="consorcio" className="text-xs text-slate-600">
              Consorcio
            </Label>
            <SearchableSelect
              options={consorcioOptions}
              value={filters.consorcioId}
              onChange={(value) => setFilters({ ...filters, consorcioId: value })}
              placeholder="Seleccionar consorcio..."
              searchPlaceholder="Buscar consorcio..."
              emptyText="No se encontraron consorcios"
              allowClear={true}
              onClear={() => setFilters({ ...filters, consorcioId: '' })}
            />
          </div>

          {/* Proveedor - Primera fila */}
          <div className="space-y-2">
            <Label htmlFor="proveedor" className="text-xs text-slate-600">
              Proveedor
            </Label>
            <MultiSelect
              options={proveedorOptions}
              value={filters.proveedorIds}
              onChange={(value) => setFilters({ ...filters, proveedorIds: value })}
              placeholder="Seleccionar proveedores..."
              searchPlaceholder="Buscar proveedores..."
              emptyText="No se encontraron proveedores"
            />
          </div>

          {/* Búsqueda */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-xs text-slate-600">
              Buscar (Detalle / N° Factura)
            </Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="search"
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-8 h-9"
              />
            </div>
          </div>

          {/* Fecha desde */}
          <div className="space-y-2">
            <Label htmlFor="fechaDesde" className="text-xs text-slate-600">
              Fecha desde
            </Label>
            <Input
              id="fechaDesde"
              type="date"
              value={filters.fechaDesde}
              onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
              className="h-9"
            />
          </div>

          {/* Fecha hasta */}
          <div className="space-y-2">
            <Label htmlFor="fechaHasta" className="text-xs text-slate-600">
              Fecha hasta
            </Label>
            <Input
              id="fechaHasta"
              type="date"
              value={filters.fechaHasta}
              onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
              className="h-9"
            />
          </div>

          {/* Importe mínimo */}
          <div className="space-y-2">
            <Label htmlFor="importeMin" className="text-xs text-slate-600">
              Importe mínimo ($)
            </Label>
            <Input
              id="importeMin"
              type="number"
              placeholder="0.00"
              value={filters.importeMin}
              onChange={(e) => setFilters({ ...filters, importeMin: e.target.value })}
              className="h-9"
              step="0.01"
            />
          </div>

          {/* Importe máximo */}
          <div className="space-y-2">
            <Label htmlFor="importeMax" className="text-xs text-slate-600">
              Importe máximo ($)
            </Label>
            <Input
              id="importeMax"
              type="number"
              placeholder="0.00"
              value={filters.importeMax}
              onChange={(e) => setFilters({ ...filters, importeMax: e.target.value })}
              className="h-9"
              step="0.01"
            />
          </div>

          {/* CUIT Emisor */}
          <div className="space-y-2">
            <Label htmlFor="cuitEmisor" className="text-xs text-slate-600">
              CUIT Emisor
            </Label>
            <Input
              id="cuitEmisor"
              placeholder="20-12345678-9"
              value={filters.cuitEmisor}
              onChange={(e) => setFilters({ ...filters, cuitEmisor: e.target.value })}
              className="h-9"
            />
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-3 text-xs text-slate-500">
            Mostrando {sortedFacturas.length} de {facturas.length} facturas
          </div>
        )}
      </div>
      )}

      {/* Tabla */}
      <div className="rounded-md border overflow-hidden -mx-4 sm:-mx-6 lg:-mx-6 sm:mx-0">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-10 sm:w-12 font-semibold min-w-[40px] sm:min-w-[48px]"></TableHead>
                <TableHead
                  className="font-semibold w-[180px] max-w-[180px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100 select-none"
                  onClick={() => handleSort('consorcio')}
                >
                  <div className="flex items-center gap-1">
                    Consorcio
                    {sortColumn === 'consorcio' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> :
                      sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : null
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold w-[200px] max-w-[200px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100 select-none"
                  onClick={() => handleSort('proveedor')}
                >
                  <div className="flex items-center gap-1">
                    Proveedor
                    {sortColumn === 'proveedor' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> :
                      sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : null
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold w-[110px] max-w-[110px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100 select-none"
                  onClick={() => handleSort('fecha')}
                >
                  <div className="flex items-center gap-1">
                    Fecha Factura
                    {sortColumn === 'fecha' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> :
                      sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : null
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold w-[130px] max-w-[130px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100 select-none"
                  onClick={() => handleSort('nroFactura')}
                >
                  <div className="flex items-center gap-1">
                    N° Factura
                    {sortColumn === 'nroFactura' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> :
                      sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : null
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold w-[200px] max-w-[200px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100 select-none"
                  onClick={() => handleSort('detalle')}
                >
                  <div className="flex items-center gap-1">
                    Detalle
                    {sortColumn === 'detalle' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> :
                      sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : null
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold w-[120px] max-w-[120px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100 select-none"
                  onClick={() => handleSort('importe')}
                >
                  <div className="flex items-center gap-1">
                    Importe
                    {sortColumn === 'importe' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> :
                      sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : null
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-20 sm:w-24 min-w-[80px] sm:min-w-[96px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFacturas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    {hasActiveFilters ? 'No se encontraron facturas con los filtros aplicados' : 'No hay facturas'}
                  </TableCell>
                </TableRow>
              ) : (
                sortedFacturas.map((factura) => (
                  <React.Fragment key={factura.id}>
                    <TableRow 
                      className={`hover:bg-slate-50 group ${factura.detalle ? 'cursor-pointer' : ''}`}
                      onClick={() => factura.detalle && setExpandedId(expandedId === factura.id ? null : factura.id)}
                    >
                      {/* Columna para la flecha de expansión */}
                      <TableCell
                        className="w-10 sm:w-12"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {factura.detalle && (
                          <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform flex-shrink-0 text-slate-400 ${expandedId === factura.id ? 'rotate-180' : ''}`} />
                        )}
                      </TableCell>

                      {/* Consorcio */}
                      <TableCell className="w-[180px] max-w-[180px]">
                        {factura.consorcios ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs sm:text-sm truncate" title={factura.consorcios.nombre}>{factura.consorcios.nombre}</span>
                          </div>
                        ) : factura.cuit_receptor ? (
                          <div className="flex items-center gap-1 text-amber-600" title={`CUIT: ${factura.cuit_receptor} - Sin consorcio matcheado`}>
                            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-mono truncate">{factura.cuit_receptor}</span>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm text-slate-400">-</span>
                        )}
                      </TableCell>

                      {/* Proveedor */}
                      <TableCell className="w-[200px] max-w-[200px]">
                        {factura.proveedores ? (
                          <div className="flex flex-col" title={`${factura.proveedores.nombre_fantasia || factura.proveedores.nombre || ''}\n${factura.proveedores.nombre || ''}`}>
                            <div className="flex items-center gap-1">
                              <span className="text-xs sm:text-sm font-medium truncate">
                                {factura.proveedores.nombre_fantasia || factura.proveedores.nombre || '-'}
                              </span>
                              {!factura.proveedores.cuit && (
                                <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 text-amber-500" />
                              )}
                            </div>
                            {factura.proveedores.nombre_fantasia && factura.proveedores.nombre_fantasia !== factura.proveedores.nombre && (
                              <span className="text-xs text-slate-500 truncate">
                                {factura.proveedores.nombre}
                              </span>
                            )}
                          </div>
                        ) : factura.cuit_emisor ? (
                          <div className="flex items-center gap-1 text-amber-600" title={`CUIT: ${factura.cuit_emisor} - Sin proveedor matcheado`}>
                            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-mono truncate">{factura.cuit_emisor}</span>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm text-slate-400">-</span>
                        )}
                      </TableCell>

                      {/* Fecha Factura */}
                      <TableCell className="w-[110px] max-w-[110px] font-medium text-xs sm:text-sm">{formatDate(factura.fecha_factura)}</TableCell>

                      {/* N° Factura */}
                      <TableCell className="w-[130px] max-w-[130px] font-medium text-xs sm:text-sm">{factura.nro_factura || '-'}</TableCell>

                      {/* Detalle truncado */}
                      <TableCell className="w-[200px] max-w-[200px]">
                        <div className="truncate text-xs sm:text-sm" title={factura.detalle || '-'}>
                          {factura.detalle || '-'}
                        </div>
                      </TableCell>

                      {/* Importe */}
                      <TableCell className="w-[120px] max-w-[120px]">
                        {factura.importe ? (
                          <Badge variant="outline" className="font-semibold text-xs">
                            ${factura.importe.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(factura)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(factura)}
                            disabled={deleteLoading !== null}
                          >
                            {deleteLoading === factura.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expandedId === factura.id && factura.detalle && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-slate-50/50 border-b border-slate-200 px-3 sm:px-4">
                          <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {/* Descripción - ocupa todo el ancho */}
                            <div className="sm:col-span-2 lg:col-span-3 space-y-1 pb-3 border-b border-slate-200">
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Descripción</span>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {factura.detalle}
                              </p>
                            </div>

                            {/* Información adicional en grid */}
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fecha Factura</span>
                              <p className="text-sm font-medium text-slate-700">{formatDate(factura.fecha_factura)}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">N° Factura</span>
                              <p className="text-sm font-medium text-slate-700">{factura.nro_factura || '-'}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Importe</span>
                              <p className="text-sm font-medium text-slate-700">
                                {factura.importe ? `$${factura.importe.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Proveedor</span>
                              {factura.proveedores ? (
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-sm font-medium text-slate-700 truncate" title={factura.proveedores.nombre_fantasia || factura.proveedores.nombre}>
                                    {factura.proveedores.nombre_fantasia || factura.proveedores.nombre}
                                  </p>
                                  {factura.proveedores.nombre_fantasia && factura.proveedores.nombre_fantasia !== factura.proveedores.nombre && (
                                    <p className="text-xs text-slate-500 truncate" title={factura.proveedores.nombre}>
                                      {factura.proveedores.nombre}
                                    </p>
                                  )}
                                  {!factura.proveedores.cuit && (
                                    <p className="text-xs text-amber-600">Sin CUIT</p>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-amber-600">
                                  <AlertTriangle className="w-3 h-3" />
                                  <p className="text-sm font-mono truncate">{factura.cuit_emisor || 'Sin CUIT'}</p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Consorcio</span>
                              {factura.consorcios ? (
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-sm font-medium text-slate-700 truncate" title={factura.consorcios.nombre}>
                                    {factura.consorcios.nombre}
                                  </p>
                                  {!factura.consorcios.cuit && (
                                    <p className="text-xs text-amber-600">Sin CUIT</p>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-amber-600">
                                  <AlertTriangle className="w-3 h-3" />
                                  <p className="text-sm font-mono truncate">{factura.cuit_receptor || 'Sin CUIT'}</p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ingresado sistema</span>
                              <p className="text-sm font-medium text-slate-700">
                                {formatDate(factura.created_at)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditFacturaDialog
        factura={facturaToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Factura"
        description={`¿Estás seguro de eliminar la factura ${facturaToDelete?.nro_factura || 'sin número'}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        loading={deleteLoading !== null}
        variant="danger"
      />
    </div>
  )
}
