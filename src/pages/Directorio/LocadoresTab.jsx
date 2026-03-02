import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { SlideOver } from '../../components/SlideOver'

export function LocadoresTab() {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)

    const initialForm = {
        nombre: '', dni_cuit: '', direccion: '', telefono: '',
        email: '', forma_pago: '', banco: '', cbu: '', observaciones: ''
    }
    const [formData, setFormData] = useState(initialForm)

    const { data: locadores = [], isLoading } = useQuery({
        queryKey: ['locadores'],
        queryFn: async () => {
            const { data, error } = await supabase.from('locadores').select('*').eq('deleted', false).order('nombre')
            if (error) throw error
            return data ?? []
        }
    })

    const filteredLocadores = locadores.filter(item =>
        item.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        item.dni_cuit?.includes(search)
    )

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!formData.nombre.trim()) throw new Error('El nombre es requerido')

            if (editingItem?.id) {
                const { error } = await supabase.from('locadores').update(formData).eq('id', editingItem.id)
                if (error) throw error
            } else {
                const { error } = await supabase.from('locadores').insert([formData])
                if (error) throw error
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locadores'] })
            setIsFormOpen(false)
        },
        onError: (err) => alert(err.message)
    })

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('locadores').update({ deleted: true }).eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locadores'] })
        }
    })

    const handleCreate = () => {
        setEditingItem(null)
        setFormData(initialForm)
        setIsFormOpen(true)
    }

    const handleEdit = (item) => {
        setEditingItem(item)
        setFormData({
            nombre: item.nombre || '',
            dni_cuit: item.dni_cuit || '',
            direccion: item.direccion || '',
            telefono: item.telefono || '',
            email: item.email || '',
            forma_pago: item.forma_pago || '',
            banco: item.banco || '',
            cbu: item.cbu || '',
            observaciones: item.observaciones || ''
        })
        setIsFormOpen(true)
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white p-4">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar locadores..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    />
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Locador
                </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50 p-4">
                {isLoading ? (
                    <div className="p-8 text-center text-sm text-slate-500">Cargando...</div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredLocadores.map(item => (
                            <div key={item.id} className="group relative whitespace-normal rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                                <div className="font-bold text-slate-800">{item.nombre}</div>
                                {item.dni_cuit && <div className="text-xs text-slate-500 mt-1 font-mono">ID: {item.dni_cuit}</div>}
                                {item.telefono && <div className="text-sm text-slate-600 mt-2">{item.telefono}</div>}
                                {item.email && <div className="text-sm text-slate-600 truncate">{item.email}</div>}
                                <div className="mt-4 flex gap-3 border-t border-slate-100 pt-3">
                                    <button onClick={() => handleEdit(item)} className="text-xs font-semibold text-slate-500 hover:text-blue-600">Editar</button>
                                    <button onClick={() => { if (window.confirm('¿Eliminar locador?')) deleteMutation.mutate(item.id) }} className="text-xs font-semibold text-slate-500 hover:text-red-600">Eliminar</button>
                                </div>
                            </div>
                        ))}
                        {filteredLocadores.length === 0 && (
                            <div className="col-span-full py-12 text-center text-sm text-slate-500">No se encontraron locadores.</div>
                        )}
                    </div>
                )}
            </div>

            <SlideOver
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingItem ? 'Editar Locador' : 'Nuevo Locador'}
            >
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Nombre / Razón Social *</label>
                            <input type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">DNI / CUIT</label>
                                <input type="text" value={formData.dni_cuit} onChange={e => setFormData({ ...formData, dni_cuit: e.target.value })} className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Teléfono</label>
                                <input type="text" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white" />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Dirección</label>
                            <input type="text" value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white" />
                        </div>

                        <h4 className="font-bold text-slate-900 pt-4 border-t border-slate-100">Datos Bancarios</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="mb-1 block text-sm font-medium text-slate-700">Forma de Pago</label>
                                <input type="text" value={formData.forma_pago} onChange={e => setFormData({ ...formData, forma_pago: e.target.value })} className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Banco</label>
                                <input type="text" value={formData.banco} onChange={e => setFormData({ ...formData, banco: e.target.value })} className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">CBU / CVU</label>
                                <input type="text" value={formData.cbu} onChange={e => setFormData({ ...formData, cbu: e.target.value })} className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white" />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Observaciones</label>
                            <textarea rows={3} value={formData.observaciones} onChange={e => setFormData({ ...formData, observaciones: e.target.value })} className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white"></textarea>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 bg-slate-50 p-6 flex justify-end gap-3">
                        <button onClick={() => setIsFormOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">Cancelar</button>
                        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !formData.nombre.trim()} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50">
                            {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </SlideOver>
        </div>
    )
}
