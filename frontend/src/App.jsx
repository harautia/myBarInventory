import { useEffect, useState } from 'react'
import PlanProductionPage from './components/PlanProductionPage'
import InventoryPage from './components/InventoryPage'
import LoginPage from './components/LoginPage'
import authService from './services/auth'

const PAGES = {
  plan: { label: 'Plan production', component: PlanProductionPage },
  inventory: { label: 'Inventory', component: InventoryPage }
}

const App = () => {
  const [page, setPage] = useState('plan')
  const [authState, setAuthState] = useState('checking')

  useEffect(() => {
    authService.getSession().then(({ authenticated }) => {
      setAuthState(authenticated ? 'in' : 'out')
    })
  }, [])

  const handleLogout = async () => {
    await authService.logout()
    setAuthState('out')
  }

  if (authState === 'checking') return null
  if (authState === 'out') return <LoginPage onSuccess={() => setAuthState('in')} />

  const ActivePage = PAGES[page].component

  return (
    <div>
      <h1>Imaginary Inventory of Bar Serving Meat Pies</h1>
      <nav>
        {Object.entries(PAGES).map(([key, { label }]) => (
          <button
            key={key}
            type="button"
            className={page === key ? 'active' : ''}
            onClick={() => setPage(key)}
          >
            {label}
          </button>
        ))}
        <button type="button" onClick={handleLogout}>
          Log out
        </button>
      </nav>
      <ActivePage />
    </div>
  )
}

export default App
