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
  const isAllSelected = propiedades.length > 0 && propiedades.every(p => selectedPropiedades.includes(p.id))

  const toggleAll = () => {
    if (isAllSelected) {
      // Unselect only the ones currently visible to be intuitive with filters
      const visibleIds = propiedades.map(p => p.id)
      useAppStore.getState().setSelectedPropiedades(
        selectedPropiedades.filter(id => !visibleIds.includes(id))
      )
    } else {
      const newSelection = [...new Set([...selectedPropiedades, ...propiedades.map(p => p.id)])]
      useAppStore.getState().setSelectedPropiedades(newSelection)
    }
  }

  const clearSelection = useAppStore((s) => s.clearPropiedades)

  return (
    <div className="relative pb-20">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Propiedades</h1>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Buscar por ref, ubicación, localidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={disponibleFilter}
            onChange={(e) => setDisponibleFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todas</option>
            <option value="disponible">Disponibles</option>
            <option value="ocupado">Ocupadas</option>
          </select>
        </div>

        {selectedPropiedades.length > 0 && (
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <span>{selectedPropiedades.length} seleccionadas</span>
            <button
              onClick={clearSelection}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="w-10 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Ref</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Ubicación</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Localidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">m²</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Precio/mes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {propiedades.map((p) => {
                    const isSelected = selectedPropiedades.includes(p.id)
                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors hover:bg-slate-50 ${isSelected ? 'bg-blue-50/50' : ''}`}
                        onClick={() => togglePropiedad(p.id)}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePropiedad(p.id)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{p.ref_n}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{p.ubicacion}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{p.localidad}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{p.m2 ?? '—'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {p.precio_mensual ? `$${Number(p.precio_mensual).toLocaleString()}` : '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${p.disponible === 'Disponible' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}
                          >
                            {p.disponible ?? '—'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {propiedades.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-slate-500">
                        No se encontraron propiedades
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="h-[500px] lg:h-auto overflow-hidden rounded-lg border border-slate-200">
          <PropiedadesMap propiedades={propiedades} />
        </div>
      </div>

      {/* Floating Action Bar */}
      {selectedPropiedades.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full bg-slate-900 px-6 py-3 text-white shadow-2xl ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold">
              {selectedPropiedades.length}
            </div>
            <span className="text-sm font-medium">Seleccionadas</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearSelection}
              className="rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
              onClick={() => window.location.hash = '#/presupuestos'}
            >
              Crear Presupuesto
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
