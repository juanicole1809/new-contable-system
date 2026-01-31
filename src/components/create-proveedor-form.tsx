'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'

export function CreateProveedorForm() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    cuit: '',
    nombre: '',
    nombre_fantasia: '',
    mail: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setOpen(false)
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear proveedor')
      }
    } catch (error) {
      alert('Error al crear proveedor')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo Proveedor</DialogTitle>
            <DialogDescription>
              Crea un nuevo proveedor en el sistema
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cuit">CUIT *</Label>
              <Input
                id="cuit"
                required
                value={formData.cuit}
                onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                placeholder="20-12345678-9"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nombre">Razón Social *</Label>
              <Input
                id="nombre"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="GS CLEANING SRL"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nombre_fantasia">Nombre Fantasía</Label>
              <Input
                id="nombre_fantasia"
                value={formData.nombre_fantasia}
                onChange={(e) => setFormData({ ...formData, nombre_fantasia: e.target.value })}
                placeholder="GS Cleaning"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mail">Email</Label>
              <Input
                id="mail"
                type="email"
                value={formData.mail}
                onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                placeholder="contacto@proveedor.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
