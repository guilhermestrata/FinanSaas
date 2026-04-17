import { NavLink, Outlet } from 'react-router-dom'
import './appShell.css'

export function AppShell() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand__title">FinanSaaS</div>
          <div className="brand__tag">Planejamento financeiro interativo</div>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/manage">Gestão</NavLink>
          <NavLink to="/spreadsheet">Planilha</NavLink>
        </nav>
      </header>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
