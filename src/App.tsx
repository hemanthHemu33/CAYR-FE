import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import './App.css'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import PagePlaceholder from './pages/PagePlaceholder'

function HomePage() {
  return (
    <section className="page-card">
      <h2>Migration started</h2>
      <p>First migrated screen: Login.</p>
      <p>Legacy source: <code>old-project/web/app/login.html</code> and <code>old-project/web/app/js/login.js</code>.</p>
    </section>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'dashboard',
        element: <PagePlaceholder title="Dashboard" legacyFiles={['old-project/web/app/dashboard.html', 'old-project/web/app/js/dashboard.js']} />,
      },
      {
        path: 'user-db-list',
        element: <PagePlaceholder title="User DB List" legacyFiles={['old-project/web/app/userDBList.html', 'old-project/web/app/js/userDBList.js']} />,
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
