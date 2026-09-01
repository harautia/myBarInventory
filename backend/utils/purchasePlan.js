const round2 = (value) => Math.round(value * 100) / 100

const buildPurchasePlan = (recipe, pieCount) => {
  const batches = pieCount / recipe.yieldCount

  const lines = recipe.ingredients.map((ingredient) => {
    const needed = round2(ingredient.quantityPerBatch * batches)
    const isDiscrete = ingredient.unitType === 'discrete'
    const neededRounded = isDiscrete ? Math.ceil(needed) : needed
    const shortfall = Math.max(0, round2(neededRounded - ingredient.currentStock))

    return {
      ingredientId: ingredient.ingredientId,
      name: ingredient.name,
      unit: ingredient.unit,
      unitType: ingredient.unitType,
      needed,
      ...(isDiscrete ? { neededRounded } : {}),
      currentStock: ingredient.currentStock,
      shortfall
    }
  })

  const purchaseList = lines
    .filter((line) => line.shortfall > 0)
    .map((line) => ({ ingredientId: line.ingredientId, name: line.name, unit: line.unit, amount: line.shortfall }))

  return {
    recipeId: recipe.id,
    pieCount,
    batches,
    lines,
    purchaseList
  }
}

module.exports = { buildPurchasePlan }
