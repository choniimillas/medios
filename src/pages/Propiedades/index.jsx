import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../store/useAppStore'
import { useNavigate } from 'react-router-dom'
import { PropiedadesMap } from '../../components/PropiedadesMap'
import { SlideOver } from '../../components/SlideOver'
import { PropertyForm } from '../../components/PropertyForm'

export function PropiedadesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [disponibleFilter, setDisponibleFilter] = useState('all')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)

  const selectedPropiedades = useAppStore((s) => s.selectedPropiedades)
  const togglePropiedad = useAppStore((s) => s.togglePropiedad)

  const { data: propiedades = [], isLoading } = useQuery({
    queryKey: ['propiedades', search, disponibleFilter],
    queryFn: async () => {
      let query = supabase
        .from('propiedades')
        .select('*')
        .order('ref_n', { ascending: true })

      if (search) {
        query = query.or(`ref_n.ilike.%${search}%,ubicacion.ilike.%${search}%,localidad.ilike.%${search}%`)
      }

      if (disponibleFilter !== 'all') {
        query = query.eq('disponible', disponibleFilter === 'disponible' ? 'Disponible' : 'Ocupado')
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })

  // Mutations
  const upsertMutation = useMutation({
    mutationFn: async (formData) => {
      const { data, error } = await supabase
        .from('propiedades')
        .upsert(formData)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedades'] })
      setIsEditorOpen(false)
      setEditingProperty(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('propiedades').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedades'] })
      setIsEditorOpen(false)
      setEditingProperty(null)
    }
  })

  const handleEdit = (p) => {
    setEditingProperty(p)
    setIsEditorOpen(true)
  }

  const handleAddNew = () => {
    setEditingProperty(null)
    setIsEditorOpen(true)
  }

  const isAllSelected = propiedades.length > 0 && propiedades.every(p => selectedPropiedades.includes(p.id))

  const toggleAll = () => {
    if (isAllSelected) {
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
    <div className="relative h-[calc(100vh-112px)] flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">{t('properties.title')}</h1>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('common.add')}
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={disponibleFilter}
            onChange={(e) => setDisponibleFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">{t('common.all')}</option>
            <option value="disponible">{t('common.disponible')}</option>
            <option value="ocupado">{t('common.ocupado')}</option>
          </select>
        </div>

        {selectedPropiedades.length > 0 && (
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <span>{selectedPropiedades.length} {t('properties.selected')}</span>
            <button
              onClick={clearSelection}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {t('properties.clear_selection')}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 grid gap-6 lg:grid-cols-2 min-h-0">
        <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">{t('common.loading')}</div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr>
                    <th className="w-10 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('properties.ref')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('properties.location')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">m²</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('properties.price')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('properties.status')}</th>
                    <th className="w-10 px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {propiedades.map((p) => {
                    const isSelected = selectedPropiedades.includes(p.id)
                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors hover:bg-slate-50 cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
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
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <div className="font-medium text-slate-900">{p.ubicacion}</div>
                          <div className="text-xs text-slate-400">{p.localidad}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{p.m2 ?? '—'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {p.precio_mensual ? `$${Number(p.precio_mensual).toLocaleString()}` : '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${p.disponible === 'Disponible' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}
                          >
                            {p.disponible === 'Disponible' ? t('common.disponible') : t('common.ocupado')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEdit(p)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {propiedades.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-slate-500">
                        {t('common.no_results')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex-1 min-h-[400px] overflow-hidden rounded-lg border border-slate-200 shadow-sm relative">
          <PropiedadesMap propiedades={propiedades} selectedPropiedades={selectedPropiedades} />
        </div>
      </div>

      {/* Slide-over Editor */}
      <SlideOver
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingProperty ? t('properties.edit_property') : t('properties.add_property')}
      >
        <PropertyForm
          initialData={editingProperty}
          isLoading={upsertMutation.isPending}
          onSubmit={(data) => upsertMutation.mutate(data)}
          onCancel={() => setIsEditorOpen(false)}
        />
        {editingProperty && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-semibold text-slate-900">{t('common.danger_zone', 'Zona de Peligro')}</h3>
            <p className="mt-1 text-xs text-slate-500">{t('common.delete_warning')}</p>
            <button
              onClick={() => {
                if (window.confirm(t('common.confirm_delete'))) {
                  deleteMutation.mutate(editingProperty.id)
                }
              }}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {t('common.delete')}
            </button>
          </div>
        )}
      </SlideOver>

      {/* Floating Action Bar */}
      {selectedPropiedades.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-4 rounded-full bg-slate-900 px-6 py-3 text-white shadow-2xl ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold">
              {selectedPropiedades.length}
            </div>
            <span className="text-sm font-medium uppercase tracking-wide">{t('properties.selected')}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearSelection}
              className="rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
              onClick={() => navigate('/presupuestos?wizard=true')}
            >
              {t('properties.create_budget')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
