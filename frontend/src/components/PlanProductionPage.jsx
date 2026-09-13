import { useEffect, useState } from 'react'
import recipeService from '../services/recipes'
import IngredientRow from './IngredientRow'
import formatQuantity from '../utils/formatQuantity'
import BASE_INGREDIENT_NAMES from '../utils/baseIngredients'

// Strips non-digits and collapses leading zeros (typing 0,0,1,0 lands on
// "10", never "0010") so the field can never hold a zero-padded number.
const sanitizePieCount = (raw) => raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '')

// The base dough is shared with the other pie recipe, so only half its
// current stock is assumed available to any one recipe.
const BASE_STOCK_SHARE = 0.5

// The most pies producible right now: the tightest ingredient (available
// stock / quantity-per-batch) sets the batch ceiling, converted to a pie
// count and floored since partial pies can't be sold.
const maxProducible = (recipe) => {
  const maxBatches = Math.min(
    ...recipe.ingredients.map((ingredient) => {
      const share = BASE_INGREDIENT_NAMES.includes(ingredient.name) ? BASE_STOCK_SHARE : 1
      return (ingredient.currentStock * share) / ingredient.quantityPerBatch
    })
  )
  return Math.max(0, Math.floor(maxBatches * recipe.yieldCount))
}

const RecipePlanner = ({ recipe }) => {
  const [pieCount, setPieCount] = useState('')
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState(null)

  const handleCalculate = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      const result = await recipeService.getPurchasePlan(recipe.id, Number(pieCount))
      setPlan(result)
    } catch (err) {
      setPlan(null)
      setError(err.response?.data?.error || 'failed to calculate purchase plan')
    }
  }

  const handleClear = () => {
    setPieCount('')
    setPlan(null)
    setError(null)
  }

  return (
    <div>
      <h3>{recipe.name}</h3>
      <p className="hint">Current inventory can make {maxProducible(recipe)} pies</p>
      <form onSubmit={handleCalculate}>
        <label>
          Pies to produce:{' '}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 10"
            value={pieCount}
            onChange={({ target }) => setPieCount(sanitizePieCount(target.value))}
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
            <h4>Purchase list (rounded values)</h4>
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

          <button type="button" onClick={handleClear}>
            Clear
          </button>
        </>
      )}
    </div>
  )
}

const PlanProductionPage = () => {
  const [recipes, setRecipes] = useState([])

  useEffect(() => {
    recipeService
      .getAll()
      .then((summaries) => Promise.all(summaries.map(({ id }) => recipeService.getRecipe(id))))
      .then(setRecipes)
  }, [])

  return (
    <div>
      <h2>Plan production</h2>
      {recipes.map((recipe) => (
        <RecipePlanner key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}

export default PlanProductionPage
