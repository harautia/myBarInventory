// 5 decimals to preserve quantities like 0.19125 kg (rice) without loss.
const round = (value) => Math.round(value * 100000) / 100000

// Gram shortfalls are rounded up to the nearest 10 g (e.g. 12 g -> 20 g),
// so the actual purchase amount is a realistic increment and stock never
// falls short -- any excess just becomes extra stock for next time.
const roundUpToTen = (value) => Math.ceil(value / 10) * 10

// Turns one ingredient's raw need (already summed across however many
// recipes/batches are drawing on it) into a purchase line: how much is
// needed, what's in stock, and the realistic shortfall to buy.
const buildLine = (ingredient, rawNeeded) => {
  const needed = round(rawNeeded)
  const isDiscrete = ingredient.unitType === 'discrete'
  const neededRounded = isDiscrete ? Math.ceil(needed) : needed
  const rawShortfall = Math.max(0, round(neededRounded - ingredient.currentStock))

  // Ingredients purchased under a different unit than they're tracked in
  // (e.g. garlic cloves bought as whole garlics, 10 cloves per whole) buy
  // whole packs; plain gram ingredients round the shortfall up to the
  // nearest 10 g; everything else is purchased as the precise shortfall.
  const purchaseUnit = ingredient.purchaseUnit || ingredient.unit
  const packSize = ingredient.purchasePackSize || 1
  let shortfall = rawShortfall
  if (rawShortfall > 0) {
    if (purchaseUnit !== ingredient.unit) {
      shortfall = Math.ceil(rawShortfall / packSize)
    } else if (ingredient.unit === 'g') {
      shortfall = roundUpToTen(rawShortfall)
    }
  }

  return {
    ingredientId: ingredient.ingredientId,
    name: ingredient.name,
    unit: ingredient.unit,
    unitType: ingredient.unitType,
    needed,
    ...(neededRounded !== needed ? { neededRounded } : {}),
    currentStock: ingredient.currentStock,
    ...(rawShortfall > 0 ? { rawShortfall } : {}),
    shortfall,
    purchaseUnit
  }
}

const toPurchaseList = (lines) =>
  lines
    .filter((line) => line.shortfall > 0)
    .map((line) => ({ ingredientId: line.ingredientId, name: line.name, unit: line.purchaseUnit, amount: line.shortfall }))

const buildPurchasePlan = (recipe, pieCount) => {
  const batches = pieCount / recipe.yieldCount
  const lines = recipe.ingredients.map((ingredient) => buildLine(ingredient, ingredient.quantityPerBatch * batches))

  return {
    recipeId: recipe.id,
    pieCount,
    batches,
    lines,
    purchaseList: toPurchaseList(lines)
  }
}

// Combines several recipes' plans into one shopping list. Ingredients
// shared between recipes (e.g. the base dough) are summed across every
// recipe drawing on them and checked against stock exactly once, instead
// of each recipe's plan separately assuming the full stock is available
// to it alone.
const buildCombinedPurchasePlan = (entries) => {
  const items = entries.map(({ recipe, pieCount }) => ({
    recipeId: recipe.id,
    pieCount,
    batches: pieCount / recipe.yieldCount
  }))

  const ingredientById = new Map()
  const rawNeededById = new Map()
  entries.forEach(({ recipe, pieCount }) => {
    const batches = pieCount / recipe.yieldCount
    recipe.ingredients.forEach((ingredient) => {
      ingredientById.set(ingredient.ingredientId, ingredient)
      const soFar = rawNeededById.get(ingredient.ingredientId) || 0
      rawNeededById.set(ingredient.ingredientId, soFar + ingredient.quantityPerBatch * batches)
    })
  })

  const lines = [...ingredientById.entries()].map(([ingredientId, ingredient]) =>
    buildLine(ingredient, rawNeededById.get(ingredientId))
  )

  return { items, lines, purchaseList: toPurchaseList(lines) }
}

module.exports = { buildPurchasePlan, buildCombinedPurchasePlan }
