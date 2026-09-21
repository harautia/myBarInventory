import { useEffect, useState } from 'react'
import PlanProductionPage from './components/PlanProductionPage'
import InventoryPage from './components/InventoryPage'
import RecipePage from './components/RecipePage'
import LoginPage from './components/LoginPage'
import authService from './services/auth'
import { Button, Spinner } from './components/ui'

const PAGES = {
  plan: { label: 'Plan production', component: PlanProductionPage },
  inventory: { label: 'Inventory', component: InventoryPage },
  recipe: { label: 'Recipe', component: RecipePage }
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

  if (authState === 'checking') {
    return (
      <div className="app-loading">
        <Spinner label="Checking session…" />
      </div>
    )
  }
  if (authState === 'out') return <LoginPage onSuccess={() => setAuthState('in')} />

  const ActivePage = PAGES[page].component

  return (
    <div>
      <header className="app-header">
        <img src="/favicon.png" alt="" width="32" height="32" />
        <h1>Imaginary Inventory of Bar Serving Meat Pies</h1>
      </header>
      <nav>
        {Object.entries(PAGES).map(([key, { label }]) => (
          <Button key={key} variant="nav" active={page === key} onClick={() => setPage(key)}>
            {label}
          </Button>
        ))}
        <Button variant="secondary" onClick={handleLogout}>
          Log out
        </Button>
      </nav>
      <ActivePage />
      <footer className="app-footer">
        <p>
          &copy; {new Date().getFullYear()} Riverbend Solutions &mdash; Hannu Rautiainen &mdash;{' '}
          <a href="mailto:harautia1976@gmail.com">harautia1976@gmail.com</a>
        </p>
      </footer>
    </div>
  )
}

export default App
