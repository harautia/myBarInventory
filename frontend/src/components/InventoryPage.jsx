import { useEffect, useState } from 'react'
import ingredientService from '../services/ingredients'

const InventoryPage = () => {
  const [ingredients, setIngredients] = useState([])
  const [drafts, setDrafts] = useState({})

  useEffect(() => {
    ingredientService.getAll().then(setIngredients)
  }, [])

  const handleChange = (id, value) => {
    setDrafts({ ...drafts, [id]: value })
  }

  const handleSave = async (id) => {
    const newStock = Number(drafts[id])
    if (Number.isNaN(newStock) || newStock < 0) return
    const updated = await ingredientService.updateStock(id, newStock)
    setIngredients(ingredients.map((ingredient) => (ingredient.id === id ? updated : ingredient)))
    const rest = { ...drafts }
    delete rest[id]
    setDrafts(rest)
  }

  return (
    <div>
      <h2>Ingredient stock</h2>
      <table>
        <thead>
          <tr>
            <th>Ingredient</th>
            <th>Unit</th>
            <th>Current stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
            <tr key={ingredient.id}>
              <td>{ingredient.name}</td>
              <td>{ingredient.unit}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={drafts[ingredient.id] ?? ingredient.currentStock}
                  onChange={({ target }) => handleChange(ingredient.id, target.value)}
                />
              </td>
              <td>
                <button type="button" onClick={() => handleSave(ingredient.id)}>
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InventoryPage
