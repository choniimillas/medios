import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export function BudgetWizard({ selectedPropiedades, onClose, onSubmit, isLoading }) {
    const { t } = useTranslation()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        cliente_id: '',
        anunciante_id: '',
        estado: 'Borrador',
        lineas: []
    })

    // Fetch clients and advertisers
    const { data: clientes = [] } = useQuery({
        queryKey: ['clientes'],
        queryFn: async () => {
            const { data, error } = await supabase.from('clientes').select('id, nombre').order('nombre')
            if (error) throw error
            return data ?? []
        }
    })

    const { data: anunciantes = [] } = useQuery({
        queryKey: ['anunciantes'],
        queryFn: async () => {
            const { data, error } = await supabase.from('anunciantes').select('id, nombre').order('nombre')
            if (error) throw error
            return data ?? []
        }
    })

    // Fetch selected properties details to initialize lineas
    const { data: propertiesDetails = [] } = useQuery({
        queryKey: ['properties-details', selectedPropiedades],
        queryFn: async () => {
            if (selectedPropiedades.length === 0) return []
            const { data, error } = await supabase
                .from('propiedades')
                .select('id, ref_n, ubicacion, precio_mensual, costo_colocacion')
                .in('id', selectedPropiedades)
            if (error) throw error
            return data ?? []
        },
        enabled: selectedPropiedades.length > 0
    })

    useEffect(() => {
        if (propertiesDetails.length > 0 && formData.lineas.length === 0) {
            setFormData(prev => ({
                ...prev,
                lineas: propertiesDetails.map(p => ({
                    propiedad_id: p.id,
                    ref_n: p.ref_n,
                    ubicacion: p.ubicacion,
                    precio_mensual: p.precio_mensual || 0,
                    costo_colocacion: p.costo_colocacion || 0
                }))
            }))
        }
    }, [propertiesDetails])

    const handleNext = () => setStep(s => s + 1)
    const handleBack = () => setStep(s => s - 1)

    const handleLineaChange = (index, field, value) => {
        const newLineas = [...formData.lineas]
        newLineas[index][field] = parseFloat(value) || 0
        setFormData(prev => ({ ...prev, lineas: newLineas }))
    }

    const isStep1Valid = formData.cliente_id && formData.anunciante_id

    return (
        <div className="flex flex-col h-full">
            {/* Stepper Header */}
            <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
                {[1, 2].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {s}
                        </div>
                        <span className={`text-sm font-medium ${step >= s ? 'text-slate-900' : 'text-slate-400'}`}>
                            {s === 1 ? t('budgets.step_client') : t('budgets.step_config')}
                        </span>
                        {s === 1 && <div className="mx-4 h-px w-12 bg-slate-200" />}
                    </div>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">{t('common.client')}</label>
                            <select
                                value={formData.cliente_id}
                                onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">{t('budgets.select_client')}</option>
                                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">{t('common.advertiser')}</label>
                            <select
                                value={formData.anunciante_id}
                                onChange={(e) => setFormData({ ...formData, anunciante_id: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">{t('budgets.select_advertiser')}</option>
                                {anunciantes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                            </select>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-4">
                            <p className="text-sm font-medium text-blue-800">
                                {t('properties.selected')}: {selectedPropiedades.length}
                            </p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        {formData.lineas.map((linea, index) => (
                            <div key={linea.propiedad_id} className="rounded-lg border border-slate-200 p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-slate-900">{linea.ref_n}</h4>
                                    <span className="text-xs text-slate-500 truncate max-w-[200px]">{linea.ubicacion}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">
                                            {t('budgets.monthly_price')}
                                        </label>
                                        <div className="relative mt-1">
                                            <span className="absolute left-3 top-2 text-slate-400 font-medium">$</span>
                                            <input
                                                type="number"
                                                value={linea.precio_mensual}
                                                onChange={(e) => handleLineaChange(index, 'precio_mensual', e.target.value)}
                                                className="block w-full rounded-md border border-slate-300 pl-7 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">
                                            {t('budgets.setup_cost')}
                                        </label>
                                        <div className="relative mt-1">
                                            <span className="absolute left-3 top-2 text-slate-400 font-medium">$</span>
                                            <input
                                                type="number"
                                                value={linea.costo_colocacion}
                                                onChange={(e) => handleLineaChange(index, 'costo_colocacion', e.target.value)}
                                                className="block w-full rounded-md border border-slate-300 pl-7 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
                <button
                    onClick={step === 1 ? onClose : handleBack}
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    {step === 1 ? t('common.cancel') : t('common.back')}
                </button>
                <button
                    disabled={step === 1 ? !isStep1Valid : isLoading}
                    onClick={step === 1 ? handleNext : () => onSubmit(formData)}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? t('common.saving') : (step === 1 ? t('common.next') : t('budgets.new_budget'))}
                </button>
            </div>
        </div>
    )
}
