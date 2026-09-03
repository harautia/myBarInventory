import { useState } from 'react'
import recipeService from '../services/recipes'
import IngredientRow from './IngredientRow'
import formatQuantity from '../utils/formatQuantity'

const RECIPE_ID = 1

const PlanProductionPage = () => {
  const [pieCount, setPieCount] = useState(10)
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState(null)

  const handleCalculate = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      const result = await recipeService.getPurchasePlan(RECIPE_ID, Number(pieCount))
      setPlan(result)
    } catch (err) {
      setPlan(null)
      setError(err.response?.data?.error || 'failed to calculate purchase plan')
    }
  }

  return (
    <div>
      <h2>Plan production</h2>
      <form onSubmit={handleCalculate}>
        <label>
          Pies to produce:{' '}
          <input
            type="number"
            min="1"
            value={pieCount}
            onChange={({ target }) => setPieCount(target.value)}
          />
        </label>
        <button type="submit">Calculate</button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {plan && (
        <>
          <p className="hint">{plan.pieCount} pies = {plan.batches} batches of the recipe</p>
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Needed</th>
                <th>In stock</th>
                <th>Shortfall</th>
              </tr>
            </thead>
            <tbody>
              {plan.lines.map((line) => (
                <IngredientRow key={line.ingredientId} line={line} />
              ))}
            </tbody>
          </table>

          <div className="purchase-list">
            <h3>Purchase list (rounded values)</h3>
            {plan.purchaseList.length === 0 ? (
              <p>Nothing to buy — stock already covers this plan.</p>
            ) : (
              <ul>
                {plan.purchaseList.map((item) => (
                  <li key={item.ingredientId}>
                    {item.name}: {formatQuantity(item.amount, item.unit)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default PlanProductionPage
