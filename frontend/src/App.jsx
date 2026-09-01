import { useState } from 'react'
import PlanProductionPage from './components/PlanProductionPage'
import InventoryPage from './components/InventoryPage'

const App = () => {
  const [page, setPage] = useState('plan')

  return (
    <div>
      <h1>myBarInventory</h1>
      <nav>
        <button
          type="button"
          className={page === 'plan' ? 'active' : ''}
          onClick={() => setPage('plan')}
        >
          Plan production
        </button>
        <button
          type="button"
          className={page === 'inventory' ? 'active' : ''}
          onClick={() => setPage('inventory')}
        >
          Inventory
        </button>
      </nav>
      {page === 'plan' ? <PlanProductionPage /> : <InventoryPage />}
    </div>
  )
}

export default App
