import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../store/useAppStore'
import { CheckIcon } from '../../components/icons'
import { PropiedadesMap } from '../../components/PropiedadesMap'

export function PropiedadesPage() {
  const [search, setSearch] = useState('')
  const [disponibleFilter, setDisponibleFilter] = useState('all')
  const selectedPropiedades = useAppStore((s) => s.selectedPropiedades)
  const togglePropiedad = useAppStore((s) => s.togglePropiedad)

  const { data: propiedades = [], isLoading } = useQuery({
    queryKey: ['propiedades', search, disponibleFilter],
    queryFn: async () => {
      let q = supabase.from('propiedades').select('*').eq('deleted', false)
      if (search) q = q.or(`ref_n.ilike.%${search}%,ubicacion.ilike.%${search}%,localidad.ilike.%${search}%`)
      if (disponibleFilter === 'disponible') q = q.eq('disponible', 'Disponible')
      if (disponibleFilter === 'ocupado') q = q.neq('disponible', 'Disponible')
      const { data, error } = await q.order('ref_n')
      if (error) throw error
      return data ?? []
    },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Propiedades</h1>
      <div className="mb-4 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Buscar por ref, ubicación, localidad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={disponibleFilter}
          onChange={(e) => setDisponibleFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">Todas</option>
          <option value="disponible">Disponibles</option>
          <option value="ocupado">Ocupadas</option>
        </select>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Cargando...</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Ref</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Ubicación</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Localidad</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">m²</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Precio/mes</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Selección</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {propiedades.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-800">{p.ref_n}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{p.ubicacion}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{p.localidad}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{p.m2 ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{p.precio_mensual ?? '—'}</td>
                  <td>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        p.disponible === 'Disponible' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.disponible ?? '—'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => togglePropiedad(p.id)}
                      className="rounded p-1 hover:bg-slate-100"
                      title={selectedPropiedades.includes(p.id) ? 'Quitar selección' : 'Seleccionar'}
                    >
                      {selectedPropiedades.includes(p.id) ? (
                        <CheckIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <span className="h-5 w-5 rounded border border-slate-300" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
        <div className="lg:min-h-[500px]">
          <PropiedadesMap propiedades={propiedades} />
        </div>
      </div>
    </div>
  )
}
