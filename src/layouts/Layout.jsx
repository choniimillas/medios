import { Outlet } from 'react-router-dom'
import { Menu } from '../components/Menu'

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Menu />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
