import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../store/useAppStore'
import { PresupuestoForm } from './PresupuestoForm'

export function PresupuestosPage() {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()
  const selectedPropiedades = useAppStore((s) => s.selectedPropiedades)
  const clearPropiedades = useAppStore((s) => s.clearPropiedades)

  const { data: presupuestos = [], isLoading } = useQuery({
    queryKey: ['presupuestos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('presupuestos')
        .select(`
          *,
          cliente:clientes(nombre),
          anunciante:anunciantes(nombre)
        `)
        .order('fecha', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Presupuestos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Nuevo presupuesto
        </button>
      </div>

      {showForm && (
        <PresupuestoForm
          selectedPropiedades={selectedPropiedades}
          onClose={() => {
            setShowForm(false)
            clearPropiedades()
          }}
          onSuccess={() => {
            setShowForm(false)
            clearPropiedades()
            queryClient.invalidateQueries({ queryKey: ['presupuestos'] })
          }}
        />
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Cargando...</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Número</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Anunciante</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {presupuestos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-800">{p.numero}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{p.fecha}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{p.cliente?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{p.anunciante?.nombre ?? '—'}</td>
                  <td>
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800">
                      {p.estado ?? '—'}
                    </span>
                  </td>
                  <td>
                    {p.pdf_url ? (
                      <a
                        href={p.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver PDF
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
