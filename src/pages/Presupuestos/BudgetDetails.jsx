import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { generatePdf, approveBudget } from '../../lib/api'

export function BudgetDetails({ budget, onClose }) {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const [isGenerating, setIsGenerating] = useState(false)

    // Approval state
    const [isApprovalOpen, setIsApprovalOpen] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from('presupuestos').delete().eq('id', budget.id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['presupuestos'] })
            onClose()
        }
    })

    const approveMutation = useMutation({
        mutationFn: async () => {
            if (!startDate || !endDate) throw new Error('Las fechas son requeridas')
            return await approveBudget({
                presupuesto_id: budget.id,
                inicio: startDate,
                fin: endDate
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['presupuestos'] })
            queryClient.invalidateQueries({ queryKey: ['servicios'] }) // Refresh services too
            setIsApprovalOpen(false)
            onClose()
        },
        onError: (err) => {
            alert(err.message)
        }
    })

    const handleGeneratePdf = async () => {
        try {
            setIsGenerating(true)
            await generatePdf(budget.id)
            queryClient.invalidateQueries({ queryKey: ['presupuestos'] })
        } catch (e) {
            alert(e.message)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">{t('common.number')}</label>
                    <div className="mt-1 text-lg font-bold text-slate-900">{budget.numero}</div>
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">{t('common.date')}</label>
                    <div className="mt-1 text-lg font-medium text-slate-700">{budget.fecha}</div>
                </div>
                <div className="col-span-2">
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">{t('common.client')}</label>
                    <div className="mt-1 text-xl font-bold text-blue-600">{budget.cliente?.nombre}</div>
                </div>
                <div className="col-span-2">
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">{t('common.advertiser')}</label>
                    <div className="mt-1 text-lg font-medium text-slate-700">{budget.anunciante?.nombre}</div>
                </div>
            </div>

            {/* Primary Actions */}
            <div className="space-y-4">
                {budget.estado !== 'Aprobado' && (
                    <div className="rounded-xl bg-green-50 p-6 border border-green-100 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-green-900">Aprobar Presupuesto</h4>
                                <p className="text-sm text-green-700">Esto creará un Servicio activo con las ubicaciones.</p>
                            </div>
                            <button
                                onClick={() => setIsApprovalOpen(!isApprovalOpen)}
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 transition-colors"
                            >
                                Configurar Servicio
                            </button>
                        </div>

                        {isApprovalOpen && (
                            <div className="pt-4 mt-2 border-t border-green-200/50 flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-green-800 mb-1">Fecha Inicio</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                            className="w-full rounded-lg border-green-200 bg-white placeholder-slate-400 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-green-800 mb-1">Fecha Fin</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            className="w-full rounded-lg border-green-200 bg-white placeholder-slate-400 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-slate-800"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsApprovalOpen(false)}
                                        className="rounded-lg px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => approveMutation.mutate()}
                                        disabled={approveMutation.isPending || !startDate || !endDate}
                                        className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
                                    >
                                        {approveMutation.isPending ? 'Procesando...' : 'Confirmar Aprobación'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* PDF Action */}
                <div className="rounded-xl bg-slate-50 p-6 border border-slate-100 flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-slate-900">{t('budgets.generate_pdf')}</h4>
                        <p className="text-sm text-slate-500">{t('common.version')}: {budget.version || 1}</p>
                    </div>
                    {budget.pdf_url ? (
                        <div className="flex gap-2">
                            <a
                                href={budget.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {t('budgets.view_pdf')}
                            </a>
                            <button
                                onClick={handleGeneratePdf}
                                disabled={isGenerating}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
                            >
                                {isGenerating ? t('common.loading') : t('common.update', 'Actualizar')}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleGeneratePdf}
                            disabled={isGenerating}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
                        >
                            {isGenerating ? t('common.loading') : t('budgets.generate_pdf')}
                        </button>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-12 pt-8 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-4">{t('common.danger_zone')}</h4>
                <button
                    onClick={() => {
                        if (window.confirm(t('common.confirm_delete'))) {
                            deleteMutation.mutate()
                        }
                    }}
                    className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t('common.delete')}
                </button>
            </div>
        </div>
    )
}
