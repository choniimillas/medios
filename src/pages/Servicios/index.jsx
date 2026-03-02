import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { SlideOver } from '../../components/SlideOver'
import { ServicioDetails } from './ServicioDetails'

export function ServiciosPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)

  const { data: servicios = [], isLoading } = useQuery({
    queryKey: ['servicios', search],
    queryFn: async () => {
      let query = supabase
        .from('servicios')
        .select(`
          *,
          cliente:clientes(nombre),
          anunciante:anunciantes(nombre),
          presupuesto:presupuestos(numero)
        `)
        .order('inicio', { ascending: false })

      if (search) {
        query = query.or(`numero.ilike.%${search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    }
  })

  const handleOpenDetails = (servicio) => {
    setSelectedService(servicio)
    setIsDetailsOpen(true)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-112px)] overflow-hidden">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">{t('nav.services')}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-full items-center justify-center p-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-sm font-medium text-slate-500">{t('common.loading')}</p>
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{t('common.number')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Inicio</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Fin</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{t('common.client')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{t('common.advertiser')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Presupuesto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {servicios.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => handleOpenDetails(s)}
                  className="group cursor-pointer transition-all hover:bg-slate-50/80"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-900">{s.numero}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{s.inicio ? new Date(s.inicio).toLocaleDateString() : '—'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{s.fin ? new Date(s.fin).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{s.cliente?.nombre ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{s.anunciante?.nombre ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{s.presupuesto?.numero ?? '—'}</td>
                </tr>
              ))}
              {servicios.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-full bg-slate-50 p-4">
                        <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-400">{t('common.no_results')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <SlideOver
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Detalles del Servicio"
      >
        {selectedService && (
          <ServicioDetails
            servicio={selectedService}
            onClose={() => setIsDetailsOpen(false)}
          />
        )}
      </SlideOver>
    </div>
  )
}
