import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'

export function ServicioDetails({ servicio, onClose }) {
    const { t } = useTranslation()
    const queryClient = useQueryClient()

    const { data: propiedades = [], isLoading } = useQuery({
        queryKey: ['servicio_propiedad', servicio.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('servicio_propiedad')
                .select(`
          id,
          sp_inicio,
          sp_fin,
          propiedad:propiedades(
            id,
            ref_n,
            ubicacion,
            localidad
          )
        `)
                .eq('sp_servicio', servicio.id)
            if (error) throw error
            return data ?? []
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from('servicios').delete().eq('id', servicio.id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['servicios'] })
            onClose()
        }
    })

    return (
        <div className="space-y-8">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">{t('common.number')}</label>
                    <div className="mt-1 text-lg font-bold text-slate-900">{servicio.numero}</div>
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">Presupuesto Ref.</label>
                    <div className="mt-1 text-lg font-medium text-slate-700">{servicio.presupuesto?.numero || '—'}</div>
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">Inicio</label>
                    <div className="mt-1 text-lg font-medium text-slate-700">{servicio.inicio ? new Date(servicio.inicio).toLocaleDateString() : '—'}</div>
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">Fin</label>
                    <div className="mt-1 text-lg font-medium text-slate-700">{servicio.fin ? new Date(servicio.fin).toLocaleDateString() : '—'}</div>
                </div>
                <div className="col-span-2">
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">{t('common.client')}</label>
                    <div className="mt-1 text-xl font-bold text-blue-600">{servicio.cliente?.nombre}</div>
                </div>
                <div className="col-span-2">
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">{t('common.advertiser')}</label>
                    <div className="mt-1 text-lg font-medium text-slate-700">{servicio.anunciante?.nombre}</div>
                </div>
            </div>

            {/* Properties List */}
            <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4 tracking-wide uppercase">Propiedades Asignadas</h4>
                {isLoading ? (
                    <div className="py-4 text-sm text-slate-500">{t('common.loading')}</div>
                ) : propiedades.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                        {propiedades.map((sp) => {
                            const p = sp.propiedad || {}
                            return (
                                <div key={sp.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{p.ref_n}</span>
                                                {p.ubicacion}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">{p.localidad}</div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50">
                        <p className="text-sm text-slate-500">No hay propiedades asignadas a este servicio.</p>
                    </div>
                )}
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
                    Eliminar Servicio
                </button>
            </div>
        </div>
    )
}
