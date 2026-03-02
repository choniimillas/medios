import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'

export function MetricasPage() {
    const { t } = useTranslation()

    // Fetch all properties to calculate occupancy
    const { data: propiedades = [], isLoading: loadingProps } = useQuery({
        queryKey: ['metricas-propiedades'],
        queryFn: async () => {
            const { data, error } = await supabase.from('propiedades').select('id, disponible').eq('deleted', false)
            if (error) throw error
            return data ?? []
        }
    })

    // Fetch active services to calculate MRR
    const { data: serviciosData = [], isLoading: loadingServs } = useQuery({
        queryKey: ['metricas-servicios'],
        queryFn: async () => {
            const { data, error } = await supabase.from('servicio_propiedad').select('sp_inicio, sp_fin, presupuesto:presupuestos(lineas:presupuesto_propiedades(precio_mensual))')
            // To get real MRR we need prices from the budget lines or just the related property's active prices.
            // Wait, let's fetch 'presupuesto_propiedades' and cross reference, or simpler: just fetch 'propiedades' and sum the precio_mensual of 'Ocupado' properties as an estimate.
            if (error) throw error
            return data ?? []
        }
    })

    // Simpler approach for MRR: grab all 'Ocupado' properties and sum their base 'precio_mensual'.
    // This avoids complex joins for the MVP dashboard while still providing a solid number.
    const { data: allPropsData = [], isLoading: loadingMRR } = useQuery({
        queryKey: ['metricas-mrr-props'],
        queryFn: async () => {
            const { data, error } = await supabase.from('propiedades').select('disponible, precio_mensual').eq('deleted', false)
            if (error) throw error
            return data ?? []
        }
    })

    const isLoading = loadingProps || loadingMRR

    // Calculations
    const totalProperties = allPropsData.length
    const occupiedProperties = allPropsData.filter(p => p.disponible === 'Ocupado').length
    const availableProperties = totalProperties - occupiedProperties
    const occupancyRate = totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0

    const mrr = allPropsData
        .filter(p => p.disponible === 'Ocupado')
        .reduce((sum, p) => sum + (Number(p.precio_mensual) || 0), 0)

    const potentialMrr = allPropsData
        .reduce((sum, p) => sum + (Number(p.precio_mensual) || 0), 0)

    return (
        <div className="flex flex-col h-[calc(100vh-112px)] overflow-hidden">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-800">{t('nav.metrics')}</h1>
            </div>

            <div className="flex-1 overflow-auto rounded-2xl bg-slate-50 p-6">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-sm font-medium text-slate-500">{t('common.loading')}</div>
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* Top Level KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Tasa de Ocupación</h3>
                                <div className="flex items-end gap-3 mb-4">
                                    <span className="text-4xl font-extrabold text-blue-600">{occupancyRate}%</span>
                                    <span className="text-sm text-slate-500 pb-1">{occupiedProperties} de {totalProperties} props.</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${occupancyRate}%` }}></div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">MRR Activo Estimado</h3>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-extrabold text-green-600">${mrr.toLocaleString()}</span>
                                    <span className="text-sm text-slate-500 pb-1">ARS / {t('common.mo')}</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-4">Basado en precios base de propiedades ocupadas.</p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">MRR Potencial Máximo</h3>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-extrabold text-slate-700">${potentialMrr.toLocaleString()}</span>
                                    <span className="text-sm text-slate-500 pb-1">ARS / {t('common.mo')}</span>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${occupancyRate > 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {(potentialMrr - mrr).toLocaleString()} de brecha
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="rounded-xl border border-slate-200 bg-slate-800 p-5 text-white shadow-sm">
                                <div className="text-slate-400 text-xs font-medium uppercase mb-1">Total Propiedades</div>
                                <div className="text-2xl font-bold">{totalProperties}</div>
                            </div>
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                                <div className="text-emerald-600 text-xs font-medium uppercase mb-1">Ocupadas</div>
                                <div className="text-2xl font-bold text-emerald-700">{occupiedProperties}</div>
                            </div>
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                                <div className="text-blue-600 text-xs font-medium uppercase mb-1">Disponibles</div>
                                <div className="text-2xl font-bold text-blue-700">{availableProperties}</div>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="text-slate-400 text-xs font-medium uppercase mb-1">Ocupación</div>
                                <div className="text-2xl font-bold text-slate-700">{occupancyRate}%</div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                                <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-slate-900">Métricas Detalladas en Desarrollo</h3>
                            <p className="mt-2 text-sm text-slate-500">Próximamente agregaremos gráficos de ingresos históricos y proyecciones de ventas basadas en contratos activos y presupuestos pendientes.</p>
                        </div>

                    </div>
                )}
            </div>
        </div>
    )
}
