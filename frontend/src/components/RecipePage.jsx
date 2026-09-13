import { useEffect, useState } from 'react'
import recipeService from '../services/recipes'
import formatQuantity from '../utils/formatQuantity'
import BASE_INGREDIENT_NAMES from '../utils/baseIngredients'

const IngredientTable = ({ ingredients }) => (
  <table>
    <thead>
      <tr>
        <th>Ingredient</th>
        <th>Quantity per batch</th>
      </tr>
    </thead>
    <tbody>
      {ingredients.map((ingredient) => (
        <tr key={ingredient.ingredientId}>
          <td>{ingredient.name}</td>
          <td>{formatQuantity(ingredient.quantityPerBatch, ingredient.unit)}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

const RecipePage = () => {
  const [recipes, setRecipes] = useState([])

  useEffect(() => {
    recipeService
      .getAll()
      .then((summaries) => Promise.all(summaries.map(({ id }) => recipeService.getRecipe(id))))
      .then(setRecipes)
  }, [])

  if (recipes.length === 0) return null

  const baseIngredients = recipes[0].ingredients.filter((ingredient) =>
    BASE_INGREDIENT_NAMES.includes(ingredient.name)
  )

  return (
    <div>
      <div>
        <h2>Base</h2>
        <p className="hint">Shared dough for every pie recipe below</p>
        <IngredientTable ingredients={baseIngredients} />
      </div>

      {recipes.map((recipe) => (
        <div key={recipe.id}>
          <h2>{recipe.name}</h2>
          <p className="hint">
            Yields {recipe.yieldCount} pies per batch — start with 1 portion of the base
          </p>
          <IngredientTable
            ingredients={recipe.ingredients.filter(
              (ingredient) => !BASE_INGREDIENT_NAMES.includes(ingredient.name)
            )}
          />
        </div>
      ))}
    </div>
  )
}

export default RecipePage
