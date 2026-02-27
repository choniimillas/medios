import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function HomePage() {
  const { data: presupuestosCount } = useQuery({
    queryKey: ['presupuestos-count'],
    queryFn: async () => {
      const { count } = await supabase.from('presupuestos').select('*', { count: 'exact', head: true })
      return count ?? 0
    },
  })

  const { data: serviciosCount } = useQuery({
    queryKey: ['servicios-count'],
    queryFn: async () => {
      const { count } = await supabase.from('servicios').select('*', { count: 'exact', head: true })
      return count ?? 0
    },
  })

  const { data: propiedadesCount } = useQuery({
    queryKey: ['propiedades-count'],
    queryFn: async () => {
      const { count } = await supabase.from('propiedades').select('*', { count: 'exact', head: true })
      return count ?? 0
    },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Presupuestos" value={presupuestosCount ?? '—'} />
        <MetricCard title="Servicios / Contratos" value={serviciosCount ?? '—'} />
        <MetricCard title="Propiedades" value={propiedadesCount ?? '—'} />
      </div>
    </div>
  )
}

function MetricCard({ title, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
    </div>
  )
}
