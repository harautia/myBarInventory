import { useEffect, useState } from 'react'
import ingredientService from '../services/ingredients'
import { Alert, Button, Spinner, EmptyState } from './ui'

const InventoryPage = () => {
  const [ingredients, setIngredients] = useState([])
  const [drafts, setDrafts] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ingredientService.getAll().then((data) => {
      setIngredients(data)
      setLoading(false)
    })
  }, [])

  const handleChange = (id, value) => {
    setDrafts({ ...drafts, [id]: value })
  }

  const handleSaveAll = async () => {
    setError(null)
    const updates = Object.entries(drafts).map(([id, value]) => ({
      id: Number(id),
      newStock: Number(value)
    }))
    if (updates.length === 0) return
    if (updates.some(({ newStock }) => Number.isNaN(newStock) || newStock < 0)) {
      setError('Current stock must be a non-negative number')
      return
    }

    const updated = await Promise.all(
      updates.map(({ id, newStock }) => ingredientService.updateStock(id, newStock))
    )
    const updatedById = Object.fromEntries(updated.map((ingredient) => [ingredient.id, ingredient]))
    setIngredients(ingredients.map((ingredient) => updatedById[ingredient.id] ?? ingredient))
    setDrafts({})
  }

  return (
    <div>
      <h2>Ingredient stock</h2>
      {loading && <Spinner />}
      {!loading && ingredients.length === 0 && <EmptyState title="No ingredients yet" />}
      {!loading && ingredients.length > 0 && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th className="text-center">Current stock</th>
                <th className="text-center">New value</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => (
                <tr key={ingredient.id}>
                  <td>{ingredient.name} ({ingredient.unit})</td>
                  <td className="text-center">{ingredient.currentStock}</td>
                  <td className="text-center">
                    <input
                      className="stock-input"
                      type="text"
                      inputMode="decimal"
                      placeholder="-"
                      value={drafts[ingredient.id] ?? ''}
                      onChange={({ target }) => handleChange(ingredient.id, target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <Alert>{error}</Alert>}

      <Button onClick={handleSaveAll} disabled={Object.keys(drafts).length === 0}>
        Save changes
      </Button>
    </div>
  )
}

export default InventoryPage
