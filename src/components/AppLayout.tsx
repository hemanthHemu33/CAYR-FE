import { NavLink, Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div className="layout">
      <header>
        <h1>CAYR migration workspace</h1>
      </header>
      <nav>
        <NavLink to="/" className="nav-link">Home</NavLink>
        <NavLink to="/login" className="nav-link">Login</NavLink>
        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
