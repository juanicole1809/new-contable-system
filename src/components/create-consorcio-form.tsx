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

export function CreateConsorcioForm() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    cuit: '',
    nombre: '',
    redconar_building_id: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/consorcios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setOpen(false)
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear consorcio')
      }
    } catch (error) {
      alert('Error al crear consorcio')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Consorcio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo Consorcio</DialogTitle>
            <DialogDescription>
              Crea un nuevo consorcio en el sistema
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
              <Label htmlFor="nombre">Dirección *</Label>
              <Input
                id="nombre"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Av. San Martin 1234"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="redconar_id">Redconar Building ID</Label>
              <Input
                id="redconar_id"
                value={formData.redconar_building_id}
                onChange={(e) => setFormData({ ...formData, redconar_building_id: e.target.value })}
                placeholder="12345"
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
