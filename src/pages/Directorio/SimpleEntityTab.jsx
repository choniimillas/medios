import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { SlideOver } from '../../components/SlideOver'

export function SimpleEntityTab({ table, title }) {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [nombre, setNombre] = useState('')

    const { data: items = [], isLoading } = useQuery({
        queryKey: [table],
        queryFn: async () => {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .order('nombre', { ascending: true })
            if (error) throw error
            return data ?? []
        }
    })

    // Filter client-side
    const filteredItems = items.filter(item =>
        item.nombre?.toLowerCase().includes(search.toLowerCase())
    )

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!nombre.trim()) throw new Error('El nombre es requerido')

            if (editingItem?.id) {
                const { error } = await supabase.from(table).update({ nombre }).eq('id', editingItem.id)
                if (error) throw error
            } else {
                const { error } = await supabase.from(table).insert([{ nombre }])
                if (error) throw error
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [table] })
            setIsFormOpen(false)
        },
        onError: (err) => alert(err.message)
    })

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from(table).delete().eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [table] })
        },
        onError: (err) => alert("No se puede eliminar porque está en uso por otra entidad.")
    })

    const handleCreate = () => {
        setEditingItem(null)
        setNombre('')
        setIsFormOpen(true)
    }

    const handleEdit = (item) => {
        setEditingItem(item)
        setNombre(item.nombre)
        setIsFormOpen(true)
    }

    return (
        <div className="flex h-full flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white p-4">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar..."
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
                    {`Nuevo ${title}`}
                </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50 p-4">
                {isLoading ? (
                    <div className="p-8 text-center text-sm text-slate-500">Cargando...</div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredItems.map(item => (
                            <div key={item.id} className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                                <div className="font-bold text-slate-800">{item.nombre}</div>
                                <div className="mt-4 flex gap-2">
                                    <button onClick={() => handleEdit(item)} className="text-xs font-semibold text-slate-500 hover:text-blue-600">Editar</button>
                                    <button onClick={() => { if (window.confirm('¿Eliminar?')) deleteMutation.mutate(item.id) }} className="text-xs font-semibold text-slate-500 hover:text-red-600">Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <SlideOver
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingItem ? `Editar ${title}` : `Nuevo ${title}`}
            >
                <div className="flex h-full flex-col">
                    <div className="flex-1 p-6">
                        <label className="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
                        <input
                            type="text"
                            autoFocus
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-blue-500"
                        />
                    </div>
                    <div className="border-t border-slate-100 bg-slate-50 p-6 flex justify-end gap-3">
                        <button onClick={() => setIsFormOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">Cancelar</button>
                        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !nombre.trim()} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50">
                            {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </SlideOver>
        </div>
    )
}

export function ClientesTab() { return <SimpleEntityTab table="clientes" title="Cliente" /> }
export function AnunciantesTab() { return <SimpleEntityTab table="anunciantes" title="Anunciante" /> }
