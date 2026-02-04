'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Upload, Check, AlertCircle, X } from 'lucide-react'

const MAX_FILES = 5

interface UploadProgress {
  fileName: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  message?: string
  nroFactura?: string
  importe?: number
}

export function UploadFactura() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (files.length > MAX_FILES) {
      alert(`Máximo ${MAX_FILES} archivos a la vez`)
      return
    }

    setUploading(true)
    setProgress(files.map(f => ({ fileName: f.name, status: 'pending' })))

    // Process files sequentially
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Update status to uploading
      setProgress(prev => prev.map((p, idx) =>
        idx === i ? { ...p, status: 'uploading' } : p
      ))

      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/facturas/upload', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (response.ok && result.success) {
          setProgress(prev => prev.map((p, idx) =>
            idx === i
              ? {
                  ...p,
                  status: 'success',
                  nroFactura: result.factura.nro_factura,
                  importe: result.factura.importe
                }
              : p
          ))
        } else {
          setProgress(prev => prev.map((p, idx) =>
            idx === i
              ? { ...p, status: 'error', message: result.error || 'Error al procesar' }
              : p
          ))
        }
      } catch (error) {
        setProgress(prev => prev.map((p, idx) =>
          idx === i
            ? { ...p, status: 'error', message: 'Error de conexión' }
            : p
        ))
      }
    }

    setUploading(false)
    router.refresh()

    // Clear progress after 5 seconds
    setTimeout(() => setProgress([]), 5000)

    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const clearProgress = () => setProgress([])

  return (
    <div className="mb-4 sm:mb-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg"
        onChange={handleFileChange}
        disabled={uploading}
        multiple
        className="hidden"
        id="file-upload"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="text-sm sm:text-base bg-blue-600 hover:bg-blue-700"
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? 'Procesando...' : `📄 Subir Facturas (hasta ${MAX_FILES})`}
      </Button>

      {/* Progress list */}
      {progress.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {progress.filter(p => p.status === 'success').length} de {progress.length} procesadas
            </span>
            <button
              onClick={clearProgress}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Limpiar
            </button>
          </div>
          {progress.map((p, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 p-2 rounded-md text-xs ${
                p.status === 'success'
                  ? 'bg-green-50 text-green-800'
                  : p.status === 'error'
                    ? 'bg-red-50 text-red-800'
                    : p.status === 'uploading'
                      ? 'bg-blue-50 text-blue-800'
                      : 'bg-slate-50 text-slate-600'
              }`}
            >
              {p.status === 'success' && <Check className="w-4 h-4 flex-shrink-0" />}
              {p.status === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {p.status === 'uploading' && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
              <span className="truncate flex-1">{p.fileName}</span>
              {p.status === 'success' && p.nroFactura && (
                <span className="font-medium">
                  {p.nroFactura} · ${p.importe?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              )}
              {p.status === 'error' && (
                <span className="text-red-700">{p.message}</span>
              )}
              {p.status === 'pending' && (
                <span className="text-slate-500">Esperando...</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
