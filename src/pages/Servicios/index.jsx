import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export function ServiciosPage() {
  const { data: servicios = [], isLoading } = useQuery({
    queryKey: ['servicios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servicios')
        .select(`
          *,
          cliente:clientes(nombre),
          anunciante:anunciantes(nombre)
        `)
        .order('inicio', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Contratos de Servicio</h1>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Cargando...</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Número</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Inicio</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Fin</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-600">Anunciante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {servicios.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-800">{s.numero}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{s.inicio}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{s.fin}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{s.cliente?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{s.anunciante?.nombre ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
