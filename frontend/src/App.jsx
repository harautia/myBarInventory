import { useState } from 'react'
import PlanProductionPage from './components/PlanProductionPage'
import InventoryPage from './components/InventoryPage'

const PAGES = {
  plan: { label: 'Plan production', component: PlanProductionPage },
  inventory: { label: 'Inventory', component: InventoryPage }
}

const App = () => {
  const [page, setPage] = useState('plan')
  const ActivePage = PAGES[page].component

  return (
    <div>
      <h1>myBarInventory</h1>
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
      </nav>
      <ActivePage />
    </div>
  )
}

export default App
