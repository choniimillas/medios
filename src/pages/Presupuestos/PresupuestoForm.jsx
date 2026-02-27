import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

const schema = z.object({
  cliente_id: z.string().uuid('Seleccione un cliente'),
  anunciante_id: z.string().uuid('Seleccione un anunciante'),
  estado: z.string().optional(),
})

export function PresupuestoForm({ selectedPropiedades, onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { estado: 'Borrador' },
  })

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clientes').select('id, nombre').order('nombre')
      if (error) throw error
      return data ?? []
    },
  })

  const { data: anunciantes = [] } = useQuery({
    queryKey: ['anunciantes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('anunciantes').select('id, nombre').order('nombre')
      if (error) throw error
      return data ?? []
    },
  })

  const onSubmit = async (data) => {
    try {
      const { createPresupuesto } = await import('../../lib/api')
      await createPresupuesto({
        cliente_id: data.cliente_id,
        anunciante_id: data.anunciante_id,
        estado: data.estado,
        propiedad_ids: selectedPropiedades,
      })
      onSuccess()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">Nuevo presupuesto</h2>
        <p className="mb-4 text-sm text-slate-600">
          Propiedades seleccionadas: {selectedPropiedades.length}
        </p>
        {selectedPropiedades.length === 0 && (
          <p className="mb-4 text-sm text-amber-600">
            Debe seleccionar al menos una propiedad en la pestaña Propiedades.
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Cliente</label>
            <select
              {...register('cliente_id')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">Seleccione...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {errors.cliente_id && (
              <p className="mt-1 text-sm text-red-600">{errors.cliente_id.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Anunciante</label>
            <select
              {...register('anunciante_id')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">Seleccione...</option>
              {anunciantes.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
            {errors.anunciante_id && (
              <p className="mt-1 text-sm text-red-600">{errors.anunciante_id.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Estado</label>
            <input
              {...register('estado')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={selectedPropiedades.length === 0}
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              Crear presupuesto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
