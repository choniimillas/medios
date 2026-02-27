import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export function ComprasPage() {
  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('productos').select('*').order('nombre')
      if (error) return [] // Table may not exist
      return data ?? []
    },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Compras</h1>
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Dashboard de productos y solicitudes. (Tabla productos opcional si existe en schema.)
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Cargando...</div>
        ) : productos.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No hay productos. Añada la tabla productos en Supabase si aplica.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {productos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className={`px-4 py-3 text-sm ${p.stock === 0 ? 'font-bold text-pink-500' : 'text-slate-800'}`}>
                    {p.nombre}
                  </td>
                  <td className={`px-4 py-3 text-sm ${p.stock === 0 ? 'font-bold text-pink-500' : 'text-slate-800'}`}>
                    {p.stock ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
