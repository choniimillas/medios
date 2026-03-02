import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function PropertyForm({ initialData, onSubmit, onCancel, isLoading }) {
    const { t } = useTranslation()
    const [formData, setFormData] = useState({
        ref_n: '',
        ubicacion: '',
        localidad: '',
        base: '',
        altura: '',
        m2: '',
        precio_mensual: '',
        disponible: 'Disponible',
        latlong: '',
        ...initialData
    })

    // Reset form when initialData changes (for Edit mode)
    useEffect(() => {
        if (initialData) {
            setFormData({
                ref_n: '',
                ubicacion: '',
                localidad: '',
                base: '',
                altura: '',
                m2: '',
                precio_mensual: '',
                disponible: 'Disponible',
                latlong: '',
                ...initialData
            })
        } else {
            setFormData({
                ref_n: '',
                ubicacion: '',
                localidad: '',
                base: '',
                altura: '',
                m2: '',
                precio_mensual: '',
                disponible: 'Disponible',
                latlong: ''
            })
        }
    }, [initialData])

    // Auto-calculate m2 when base or height changes
    useEffect(() => {
        const base = parseFloat(formData.base) || 0
        const altura = parseFloat(formData.altura) || 0
        if (base && altura) {
            setFormData(prev => ({ ...prev, m2: (base * altura).toFixed(2) }))
        }
    }, [formData.base, formData.altura])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-slate-700">{t('properties.ref')}</label>
                    <input
                        type="text"
                        name="ref_n"
                        required
                        value={formData.ref_n}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-slate-700">{t('properties.status')}</label>
                    <select
                        name="disponible"
                        value={formData.disponible}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="Disponible">{t('common.disponible')}</option>
                        <option value="Ocupado">{t('common.ocupado')}</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">{t('properties.location')}</label>
                <input
                    type="text"
                    name="ubicacion"
                    required
                    value={formData.ubicacion}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">{t('properties.locality')}</label>
                    <input
                        type="text"
                        name="localidad"
                        required
                        value={formData.localidad}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Lat, Long</label>
                    <input
                        type="text"
                        name="latlong"
                        placeholder="-32.9, -60.6"
                        value={formData.latlong}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">{t('common.base', 'Base (m)')}</label>
                    <input
                        type="number"
                        step="0.01"
                        name="base"
                        value={formData.base}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">{t('common.height', 'Altura (m)')}</label>
                    <input
                        type="number"
                        step="0.01"
                        name="altura"
                        value={formData.altura}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">m²</label>
                    <input
                        type="text"
                        readOnly
                        value={formData.m2}
                        className="mt-1 block w-full rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">{t('properties.price')} ($)</label>
                <input
                    type="number"
                    name="precio_mensual"
                    value={formData.precio_mensual}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isLoading ? t('common.saving', 'Guardando...') : t('common.save')}
                </button>
            </div>
        </form>
    )
}
