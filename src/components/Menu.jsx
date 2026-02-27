import { NavLink } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/propiedades', label: 'Propiedades' },
  { to: '/presupuestos', label: 'Presupuestos' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/compras', label: 'Compras' },
]

export function Menu() {
  const userRole = useAppStore((s) => s.userRole)

  return (
    <nav className="bg-slate-800 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold">Medios</span>
            <div className="flex gap-1">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'bg-slate-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
          {userRole && (
            <span className="rounded-full bg-slate-600 px-3 py-1 text-xs font-medium">
              {userRole}
            </span>
          )}
        </div>
      </div>
    </nav>
  )
}
