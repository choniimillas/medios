import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { SlideOver } from '../../components/SlideOver'
import { LocacionDetails } from './LocacionDetails'
import { LocacionForm } from './LocacionForm'

export function LocacionesPage() {
    const { t } = useTranslation()
    const [search, setSearch] = useState('')
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedLocacion, setSelectedLocacion] = useState(null)

    const { data: locaciones = [], isLoading } = useQuery({
        queryKey: ['locaciones'],
        queryFn: async () => {
            let query = supabase
                .from('locaciones')
                .select(`
          *,
          locador:locadores(nombre),
          propiedad:propiedades(ref_n, ubicacion)
        `)
                .eq('deleted', false)
                .order('inicio', { ascending: false })

            const { data, error } = await query
            if (error) throw error
            return data ?? []
        }
    })

    // Filter client-side
    const filteredLocaciones = locaciones.filter(l =>
        l.locador?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        l.propiedad?.ref_n?.toLowerCase().includes(search.toLowerCase()) ||
        l.propiedad?.ubicacion?.toLowerCase().includes(search.toLowerCase())
    )

    const handleOpenDetails = (locacion) => {
        setSelectedLocacion(locacion)
        setIsDetailsOpen(true)
    }

    const handleEdit = () => {
        setIsDetailsOpen(false)
        setIsFormOpen(true)
    }

    const handleCreate = () => {
        setSelectedLocacion(null)
        setIsFormOpen(true)
    }

    return (
        <div className="flex flex-col h-[calc(100vh-112px)] overflow-hidden">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-800">{t('leases.title')}</h1>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('leases.new_lease')}
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
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{t('leases.property')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{t('leases.owner')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{t('leases.start_date')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{t('leases.end_date')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{t('leases.agreed_canon')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{t('leases.status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredLocaciones.map((l) => (
                                <tr
                                    key={l.id}
                                    onClick={() => handleOpenDetails(l)}
                                    className="group cursor-pointer transition-all hover:bg-slate-50/80"
                                >
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-900">{l.propiedad?.ref_n ?? '—'}</div>
                                        <div className="text-xs text-slate-500">{l.propiedad?.ubicacion}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-600">{l.locador?.nombre ?? '—'}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{l.inicio ? new Date(l.inicio).toLocaleDateString() : '—'}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{l.fin ? new Date(l.fin).toLocaleDateString() : '—'}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-700">
                                        {l.canon_pactado ? `$${l.canon_pactado} ${l.moneda}` : '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${l.estado === 'Activo' ? 'bg-green-100 text-green-700' :
                                            l.estado === 'Vencido' ? 'bg-red-100 text-red-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            {l.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredLocaciones.length === 0 && (
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
                title="Detalles de Locación"
            >
                {selectedLocacion && (
                    <LocacionDetails
                        locacion={selectedLocacion}
                        onEdit={handleEdit}
                        onClose={() => setIsDetailsOpen(false)}
                    />
                )}
            </SlideOver>

            <SlideOver
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={selectedLocacion ? t('leases.edit_lease') : t('leases.new_lease')}
            >
                {isFormOpen && (
                    <LocacionForm
                        locacion={selectedLocacion}
                        onClose={() => setIsFormOpen(false)}
                    />
                )}
            </SlideOver>
        </div>
    )
}
