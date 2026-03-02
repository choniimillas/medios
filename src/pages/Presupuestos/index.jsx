import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { createPresupuesto } from '../../lib/api'
import { useAppStore } from '../../store/useAppStore'
import { SlideOver } from '../../components/SlideOver'
import { BudgetWizard } from './BudgetWizard'
import { BudgetDetails } from './BudgetDetails'

export function PresupuestosPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState(null)

  useEffect(() => {
    if (searchParams.get('wizard') === 'true') {
      setIsWizardOpen(true)
      // Clear param to avoid re-opening on refresh
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('wizard')
      setSearchParams(newParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const selectedPropiedades = useAppStore((s) => s.selectedPropiedades)
  const clearPropiedades = useAppStore((s) => s.clearPropiedades)

  const { data: presupuestos = [], isLoading } = useQuery({
    queryKey: ['presupuestos', search],
    queryFn: async () => {
      let query = supabase
        .from('presupuestos')
        .select(`
          *,
          cliente:clientes(nombre),
          anunciante:anunciantes(nombre)
        `)
        .order('fecha', { ascending: false })

      if (search) {
        // Search in number and client name
        query = query.or(`numero.ilike.%${search}%`) // Simplifying for now as nested or is tricky
      }

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    }
  })

  const createMutation = useMutation({
    mutationFn: createPresupuesto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] })
      setIsWizardOpen(false)
      clearPropiedades()
    }
  })

  const handleOpenDetails = (budget) => {
    setSelectedBudget(budget)
    setIsDetailsOpen(true)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-112px)] overflow-hidden">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">{t('budgets.title')}</h1>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('budgets.new_budget')}
          </button>
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
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{t('common.date')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{t('common.client')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{t('common.advertiser')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{t('common.status')}</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {presupuestos.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => handleOpenDetails(p)}
                  className="group cursor-pointer transition-all hover:bg-slate-50/80"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-900">{p.numero}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{p.fecha}</td>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{p.cliente?.nombre ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.anunciante?.nombre ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${p.estado === 'Aprobado' ? 'bg-green-100 text-green-700' :
                      p.estado === 'Rechazado' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                      {p.estado ?? 'Borrador'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {p.pdf_url ? (
                      <div className="flex items-center justify-center text-red-500 transition-transform group-hover:scale-110">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 2a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8l-6-6H7zm6 7V3.5L18.5 9H13z" />
                        </svg>
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {presupuestos.length === 0 && (
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

      {/* Slide-over Wizard */}
      <SlideOver
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title={t('budgets.new_budget')}
      >
        <BudgetWizard
          selectedPropiedades={selectedPropiedades}
          isLoading={createMutation.isPending}
          onSubmit={(data) => createMutation.mutate(data)}
          onClose={() => setIsWizardOpen(false)}
        />
      </SlideOver>

      {/* Slide-over Details */}
      <SlideOver
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={t('budgets.edit_budget')}
      >
        {selectedBudget && (
          <BudgetDetails
            budget={selectedBudget}
            onClose={() => setIsDetailsOpen(false)}
          />
        )}
      </SlideOver>
    </div>
  )
}
