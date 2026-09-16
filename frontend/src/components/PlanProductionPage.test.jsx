import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import PlanProductionPage from './PlanProductionPage'
import recipeService from '../services/recipes'

vi.mock('../services/recipes')

const recipe = {
  id: 1,
  name: 'Meat pie',
  yieldCount: 10,
  ingredients: [
    { ingredientId: 7, name: 'egg', unit: 'unit', unitType: 'discrete', currentStock: 0, quantityPerBatch: 1 }
  ]
}

beforeEach(() => {
  recipeService.getAll.mockResolvedValue([{ id: recipe.id, name: recipe.name, yieldCount: recipe.yieldCount }])
  recipeService.getRecipe.mockResolvedValue(recipe)
})

const planFor25Pies = {
  items: [{ recipeId: 1, pieCount: 25, batches: 2.5 }],
  lines: [
    {
      ingredientId: 7,
      name: 'egg',
      unit: 'unit',
      unitType: 'discrete',
      needed: 2.5,
      neededRounded: 3,
      currentStock: 0,
      shortfall: 3
    }
  ],
  purchaseList: [{ ingredientId: 7, name: 'egg', unit: 'unit', amount: 3 }]
}

const planWithGramRounding = {
  items: [{ recipeId: 1, pieCount: 10, batches: 1 }],
  lines: [
    {
      ingredientId: 3,
      name: 'salt',
      unit: 'g',
      unitType: 'continuous',
      needed: 22.5,
      currentStock: 0,
      rawShortfall: 22.5,
      shortfall: 30
    }
  ],
  purchaseList: [{ ingredientId: 3, name: 'salt', unit: 'g', amount: 30 }]
}

const planWithLargeGramAmount = {
  items: [{ recipeId: 1, pieCount: 2000, batches: 100 }],
  lines: [
    {
      ingredientId: 9,
      name: 'ground meat',
      unit: 'g',
      unitType: 'continuous',
      needed: 45000,
      currentStock: 0,
      rawShortfall: 45000,
      shortfall: 45000
    }
  ],
  purchaseList: [{ ingredientId: 9, name: 'ground meat', unit: 'g', amount: 45000 }]
}

describe('PlanProductionPage', () => {
  test('shows a max-producible hint sourced from current stock, one section per recipe', async () => {
    render(<PlanProductionPage />)

    expect(await screen.findByRole('heading', { name: 'Meat pie' })).toBeInTheDocument()
    expect(screen.getByText('Current inventory covers 0 meat pies')).toBeInTheDocument()
  })

  test('halves base-ingredient stock in the max-producible count, since it is shared with the other recipe', async () => {
    recipeService.getAll.mockResolvedValue([{ id: recipe.id, name: recipe.name, yieldCount: 10 }])
    recipeService.getRecipe.mockResolvedValue({
      id: recipe.id,
      name: recipe.name,
      yieldCount: 10,
      ingredients: [
        { ingredientId: 1, name: 'butter', unit: 'g', unitType: 'continuous', currentStock: 1000, quantityPerBatch: 250 }
      ]
    })

    render(<PlanProductionPage />)

    // Full stock (1000g / 250g per batch = 4 batches) would give 40 pies;
    // halved for the shared base it's 2 batches, i.e. 20 pies. Since the
    // recipe's only ingredient here is the base one, the Base section and
    // the recipe's own hint report the same underlying number, just with
    // different labels ("bases" vs. "meat pies").
    expect(await screen.findByRole('heading', { name: 'Base' })).toBeInTheDocument()
    expect(screen.getByText('Current inventory covers 20 bases')).toBeInTheDocument()
    expect(screen.getByText('Current inventory covers 20 meat pies')).toBeInTheDocument()
  })

  test('shows the base pie count once, separate from a recipe hint limited by its own ingredients', async () => {
    recipeService.getAll.mockResolvedValue([{ id: recipe.id, name: recipe.name, yieldCount: 10 }])
    recipeService.getRecipe.mockResolvedValue({
      id: recipe.id,
      name: recipe.name,
      yieldCount: 10,
      ingredients: [
        { ingredientId: 1, name: 'butter', unit: 'g', unitType: 'continuous', currentStock: 10000, quantityPerBatch: 250 },
        { ingredientId: 7, name: 'egg', unit: 'unit', unitType: 'discrete', currentStock: 3, quantityPerBatch: 1 }
      ]
    })

    render(<PlanProductionPage />)

    // Base (butter): (10000g * 0.5 share) / 250g = 20 batches -> 200 pies.
    // Recipe overall: egg caps it at 3 batches -> 30 pies, since 3 < 20.
    expect(await screen.findByText('Current inventory covers 200 bases')).toBeInTheDocument()
    expect(screen.getByText('Current inventory covers 30 meat pies')).toBeInTheDocument()
  })

  test('has a single combined calculate button feeding one shared purchase plan request', async () => {
    recipeService.getCombinedPurchasePlan.mockResolvedValue(planFor25Pies)

    render(<PlanProductionPage />)

    const input = await screen.findByRole('textbox')
    expect(screen.getAllByRole('button', { name: /calculate/i })).toHaveLength(1)

    const user = userEvent.setup()
    await user.clear(input)
    await user.type(input, '25')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(recipeService.getCombinedPurchasePlan).toHaveBeenCalledWith([{ recipeId: 1, pieCount: 25 }])
    expect(await screen.findByText('25 meat pies = 2.5 batches')).toBeInTheDocument()
    expect(screen.getByText(/egg: 3 unit/)).toBeInTheDocument()
  })

  test('takes a pie count per recipe and requests one combined plan covering both', async () => {
    const veganRecipe = {
      id: 2,
      name: 'Vegan pie',
      yieldCount: 10,
      ingredients: [
        { ingredientId: 8, name: 'carrot', unit: 'piece', unitType: 'discrete', currentStock: 0, quantityPerBatch: 2 }
      ]
    }
    recipeService.getAll.mockResolvedValue([
      { id: recipe.id, name: recipe.name, yieldCount: recipe.yieldCount },
      { id: veganRecipe.id, name: veganRecipe.name, yieldCount: veganRecipe.yieldCount }
    ])
    recipeService.getRecipe.mockImplementation((id) => Promise.resolve(id === recipe.id ? recipe : veganRecipe))

    recipeService.getCombinedPurchasePlan.mockResolvedValue({
      items: [
        { recipeId: 1, pieCount: 20, batches: 2 },
        { recipeId: 2, pieCount: 10, batches: 1 }
      ],
      lines: [
        { ingredientId: 7, name: 'egg', unit: 'unit', unitType: 'discrete', needed: 2, currentStock: 0, shortfall: 2 },
        { ingredientId: 8, name: 'carrot', unit: 'piece', unitType: 'discrete', needed: 2, currentStock: 0, shortfall: 2 }
      ],
      purchaseList: [
        { ingredientId: 7, name: 'egg', unit: 'unit', amount: 2 },
        { ingredientId: 8, name: 'carrot', unit: 'piece', amount: 2 }
      ]
    })

    render(<PlanProductionPage />)

    expect(await screen.findByRole('heading', { name: 'Vegan pie' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /calculate/i })).toHaveLength(1)

    const user = userEvent.setup()
    const [meatInput, veganInput] = screen.getAllByRole('textbox')
    await user.type(meatInput, '20')
    await user.type(veganInput, '10')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(recipeService.getCombinedPurchasePlan).toHaveBeenCalledWith([
      { recipeId: 1, pieCount: 20 },
      { recipeId: 2, pieCount: 10 }
    ])
    expect(await screen.findByText('20 meat pies = 2 batches, 10 vegan pies = 1 batches')).toBeInTheDocument()
    expect(screen.getByText(/egg: 2 unit/)).toBeInTheDocument()
    expect(screen.getByText(/carrot: 2 piece/)).toBeInTheDocument()
  })

  test('shows the raw shortfall in the table and the rounded amount in the purchase list', async () => {
    recipeService.getCombinedPurchasePlan.mockResolvedValue(planWithGramRounding)

    render(<PlanProductionPage />)

    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /calculate/i }))

    // "22.5 g" appears twice in the breakdown table: the Needed column and
    // the (unrounded) Shortfall column both show the raw 22.5 g value.
    expect(await screen.findAllByText('22.5 g')).toHaveLength(2)
    expect(screen.getByText(/Purchase list \(rounded values\)/)).toBeInTheDocument()
    expect(screen.getByText(/salt: 30 g/)).toBeInTheDocument()
  })

  test('shows gram amounts of 1000 g or more as kilograms with one decimal', async () => {
    recipeService.getCombinedPurchasePlan.mockResolvedValue(planWithLargeGramAmount)

    render(<PlanProductionPage />)

    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /calculate/i }))

    expect(await screen.findAllByText('45.0 kg')).toHaveLength(2)
    expect(screen.getByText(/ground meat: 45\.0 kg/)).toBeInTheDocument()
  })

  test('clear button only appears once a plan is shown, and resets back to the initial state', async () => {
    recipeService.getCombinedPurchasePlan.mockResolvedValue(planFor25Pies)

    render(<PlanProductionPage />)

    const user = userEvent.setup()
    const input = await screen.findByRole('textbox')
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()

    await user.type(input, '25')
    await user.click(screen.getByRole('button', { name: /calculate/i }))
    expect(await screen.findByText(/egg: 3 unit/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /clear/i }))

    expect(input).toHaveValue('')
    expect(screen.queryByText(/egg: 3 unit/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
  })
})
