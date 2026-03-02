import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'

export function Menu() {
  const { t, i18n } = useTranslation()
  const userRole = useAppStore((s) => s.userRole)

  const navItems = [
    { to: '/', label: t('nav.home') },
    { to: '/propiedades', label: t('nav.properties') },
    { to: '/presupuestos', label: t('nav.budgets') },
    { to: '/servicios', label: t('nav.services') },
    { to: '/locaciones', label: t('nav.leases') },
    { to: '/directorio', label: 'Directorio' },
    { to: '/metricas', label: t('nav.metrics') },
    { to: '/compras', label: t('nav.settings') }
  ]

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <nav className="bg-slate-800 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold">{t('common.app_name')}</span>
            <div className="flex gap-1">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-slate-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="rounded bg-slate-700 px-2 py-1 text-xs font-medium text-slate-300 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="es">ES</option>
              <option value="en">EN</option>
              <option value="pt">PT</option>
            </select>
            {userRole && (
              <span className="rounded-full bg-slate-600 px-3 py-1 text-xs font-medium">
                {userRole}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
