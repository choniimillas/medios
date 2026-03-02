import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export function LocacionDetails({ locacion, onEdit, onClose }) {
    const { t } = useTranslation()
    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from('locaciones').update({ deleted: true }).eq('id', locacion.id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locaciones'] })
            onClose()
        }
    })

    return (
        <div className="space-y-8">
            {/* Action Bar */}
            <div className="flex justify-end gap-2 pb-4 border-b border-slate-100">
                <button
                    onClick={onEdit}
                    className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {t('common.edit')}
                </button>
            </div>

            {/* Header Info */}
            <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">{t('leases.property')}</label>
                    <div className="mt-1 text-xl font-bold text-slate-900">{locacion.propiedad?.ref_n} - {locacion.propiedad?.ubicacion}</div>
                </div>
                <div className="col-span-2">
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">{t('leases.owner')}</label>
                    <div className="mt-1 text-lg font-medium text-blue-600">{locacion.locador?.nombre}</div>
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">{t('leases.start_date')}</label>
                    <div className="mt-1 text-lg font-medium text-slate-700">{locacion.inicio ? new Date(locacion.inicio).toLocaleDateString() : '—'}</div>
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">{t('leases.end_date')}</label>
                    <div className="mt-1 text-lg font-medium text-slate-700">{locacion.fin ? new Date(locacion.fin).toLocaleDateString() : '—'}</div>
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">{t('leases.agreed_canon')}</label>
                    <div className="mt-1 text-xl font-bold text-slate-900">${locacion.canon_pactado} {locacion.moneda}</div>
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">{t('leases.status')}</label>
                    <div className="mt-1 text-lg font-medium text-slate-700">{locacion.estado}</div>
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
