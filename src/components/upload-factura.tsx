'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

export function UploadFactura() {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/facturas/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMessage({
          type: 'success',
          text: `Factura ${result.factura.nro_factura} procesada correctamente. Importe: $${result.factura.importe}`
        })
        // Recargar la página para ver la nueva factura
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Error al procesar la factura'
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error de conexión. Intente nuevamente.'
      })
    } finally {
      setUploading(false)
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="mb-4 sm:mb-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="block w-full sm:w-auto">
        <Button
          asChild
          disabled={uploading}
          className="w-full sm:w-auto text-sm sm:text-base"
        >
          <span>
            {uploading ? 'Procesando...' : '📄 Subir Factura (PDF/JPG)'}
          </span>
        </Button>
      </label>

      {message && (
        <div className={`mt-3 p-2 sm:p-3 rounded-md text-xs sm:text-sm ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
