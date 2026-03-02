import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export function LocacionForm({ locacion, onClose }) {
    const { t } = useTranslation()
    const queryClient = useQueryClient()

    const [formData, setFormData] = useState({
        locador_id: locacion?.locador_id || '',
        propiedad_id: locacion?.propiedad_id || '',
        inicio: locacion?.inicio || '',
        fin: locacion?.fin || '',
        canon_pactado: locacion?.canon_pactado || '',
        moneda: locacion?.moneda || 'ARS',
        estado: locacion?.estado || 'Activo'
    })

    // Load locadores for dropdown
    const { data: locadores = [] } = useQuery({
        queryKey: ['locadores-list'],
        queryFn: async () => {
            const { data, error } = await supabase.from('locadores').select('id, nombre').order('nombre')
            if (error) throw error
            return data ?? []
        }
    })

    // Load propiedades for dropdown
    const { data: propiedades = [] } = useQuery({
        queryKey: ['propiedades-list'],
        queryFn: async () => {
            const { data, error } = await supabase.from('propiedades').select('id, ref_n, ubicacion').eq('deleted', false).order('ref_n')
            if (error) throw error
            return data ?? []
        }
    })

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (locacion?.id) {
                const { error } = await supabase.from('locaciones').update(data).eq('id', locacion.id)
                if (error) throw error
            } else {
                const { error } = await supabase.from('locaciones').insert([data])
                if (error) throw error
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locaciones'] })
            onClose()
        },
        onError: (err) => {
            alert(err.message)
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        saveMutation.mutate(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto p-6">

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">{t('leases.owner')}</label>
                    <select
                        required
                        value={formData.locador_id}
                        onChange={(e) => setFormData({ ...formData, locador_id: e.target.value })}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-blue-500"
                    >
                        <option value="">Seleccione Locador...</option>
                        {locadores.map(l => (
                            <option key={l.id} value={l.id}>{l.nombre}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">{t('leases.property')}</label>
                    <select
                        required
                        value={formData.propiedad_id}
                        onChange={(e) => setFormData({ ...formData, propiedad_id: e.target.value })}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-blue-500"
                    >
                        <option value="">Seleccione Propiedad...</option>
                        {propiedades.map(p => (
                            <option key={p.id} value={p.id}>{p.ref_n} - {p.ubicacion}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">{t('leases.start_date')}</label>
                        <input
                            type="date"
                            required
                            value={formData.inicio}
                            onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">{t('leases.end_date')}</label>
                        <input
                            type="date"
                            required
                            value={formData.fin}
                            onChange={(e) => setFormData({ ...formData, fin: e.target.value })}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">{t('leases.agreed_canon')}</label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            value={formData.canon_pactado}
                            onChange={(e) => setFormData({ ...formData, canon_pactado: e.target.value })}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">{t('leases.currency')}</label>
                        <select
                            value={formData.moneda}
                            onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-blue-500"
                        >
                            <option value="ARS">ARS</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">{t('leases.status')}</label>
                    <select
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-blue-500"
                    >
                        <option value="Activo">Activo</option>
                        <option value="Vencido">Vencido</option>
                        <option value="Rescindido">Rescindido</option>
                    </select>
                </div>

            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                    {saveMutation.isPending ? t('common.saving') : t('common.save')}
                </button>
            </div>
        </form>
    )
}
