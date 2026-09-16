import { useEffect, useState } from 'react'
import recipeService from '../services/recipes'
import IngredientRow from './IngredientRow'
import formatQuantity from '../utils/formatQuantity'
import BASE_INGREDIENT_NAMES from '../utils/baseIngredients'

// Strips non-digits and collapses leading zeros (typing 0,0,1,0 lands on
// "10", never "0010") so the field can never hold a zero-padded number.
const sanitizePieCount = (raw) => raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '')

// Only two pie recipes exist today, distinguished by name.
const pieLabel = (recipe) => (recipe.name.toLowerCase().includes('vegan') ? 'vegan pies' : 'meat pies')
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

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

// Same ceiling as maxProducible, but restricted to the shared base
// ingredients only, so their contribution can be shown once (mirroring the
// "Base" chapter on the Recipe page) instead of being implied inside every
// recipe's combined number. Returns null when the recipe has no base
// ingredients to report on.
const maxBaseProducible = (recipe) => {
  const baseIngredients = recipe.ingredients.filter((ingredient) => BASE_INGREDIENT_NAMES.includes(ingredient.name))
  if (baseIngredients.length === 0) return null

  const maxBatches = Math.min(
    ...baseIngredients.map((ingredient) => (ingredient.currentStock * BASE_STOCK_SHARE) / ingredient.quantityPerBatch)
  )
  return Math.max(0, Math.floor(maxBatches * recipe.yieldCount))
}

const PlanProductionPage = () => {
  const [recipes, setRecipes] = useState([])
  const [pieCounts, setPieCounts] = useState({})
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    recipeService
      .getAll()
      .then((summaries) => Promise.all(summaries.map(({ id }) => recipeService.getRecipe(id))))
      .then(setRecipes)
  }, [])

  const basePieCount = recipes.length > 0 ? maxBaseProducible(recipes[0]) : null

  const handlePieCountChange = (recipeId, value) => {
    setPieCounts((previous) => ({ ...previous, [recipeId]: sanitizePieCount(value) }))
  }

  const handleCalculate = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      const items = recipes.map((recipe) => ({
        recipeId: recipe.id,
        pieCount: Number(pieCounts[recipe.id] || 0)
      }))
      const result = await recipeService.getCombinedPurchasePlan(items)
      setPlan(result)
    } catch (err) {
      setPlan(null)
      setError(err.response?.data?.error || 'failed to calculate purchase plan')
    }
  }

  const handleClear = () => {
    setPieCounts({})
    setPlan(null)
    setError(null)
  }

  return (
    <div>
      <h2>Plan production</h2>

      {basePieCount !== null && (
        <div>
          <h3>Base</h3>
          <p className="hint">Shared dough for every pie recipe below</p>
          <p className="hint">Current inventory covers {basePieCount} bases</p>
        </div>
      )}

      {recipes.map((recipe) => (
        <div key={recipe.id}>
          <h3>{recipe.name}</h3>
          <p className="hint">
            Current inventory covers {maxProducible(recipe)} {pieLabel(recipe)}
          </p>
        </div>
      ))}

      {recipes.length > 0 && (
        <div className="plan-form">
          <h3>Calculate a purchase plan</h3>
          <p className="hint">Enter how many of each pie to produce</p>
          <form onSubmit={handleCalculate} className="plan-form-fields">
            {recipes.map((recipe) => (
              <label key={recipe.id} className="plan-form-row">
                <span>{capitalize(pieLabel(recipe))}</span>
                <input
                  className="stock-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 10"
                  value={pieCounts[recipe.id] || ''}
                  onChange={({ target }) => handlePieCountChange(recipe.id, target.value)}
                />
              </label>
            ))}
            <button type="submit">Calculate</button>
          </form>
        </div>
      )}

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {plan && (
        <>
          <p className="hint">
            {plan.items
              .map((item) => {
                const recipe = recipes.find((r) => r.id === item.recipeId)
                return `${item.pieCount} ${recipe ? pieLabel(recipe) : 'pies'} = ${item.batches} batches`
              })
              .join(', ')}
          </p>
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

export default PlanProductionPage
