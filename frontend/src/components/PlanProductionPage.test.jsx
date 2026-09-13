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
  recipeId: 1,
  pieCount: 25,
  batches: 2.5,
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
  recipeId: 1,
  pieCount: 10,
  batches: 1,
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
  recipeId: 1,
  pieCount: 2000,
  batches: 100,
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
    expect(screen.getByText('Current inventory can make 0 pies')).toBeInTheDocument()
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
    // halved for the shared base it's 2 batches, i.e. 20 pies.
    expect(await screen.findByText('Current inventory can make 20 pies')).toBeInTheDocument()
  })

  test('shows rounded egg quantity and the shortfall in the purchase list', async () => {
    recipeService.getPurchasePlan.mockResolvedValue(planFor25Pies)

    render(<PlanProductionPage />)

    const user = userEvent.setup()
    const input = await screen.findByRole('textbox')
    await user.clear(input)
    await user.type(input, '25')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(await screen.findByText('2.5')).toBeInTheDocument()
    expect(screen.getByText(/egg: 3 unit/)).toBeInTheDocument()
  })

  test('shows the raw shortfall in the table and the rounded amount in the purchase list', async () => {
    recipeService.getPurchasePlan.mockResolvedValue(planWithGramRounding)

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
    recipeService.getPurchasePlan.mockResolvedValue(planWithLargeGramAmount)

    render(<PlanProductionPage />)

    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /calculate/i }))

    expect(await screen.findAllByText('45.0 kg')).toHaveLength(2)
    expect(screen.getByText(/ground meat: 45\.0 kg/)).toBeInTheDocument()
  })

  test('clear button only appears once a plan is shown, and resets back to the initial state', async () => {
    recipeService.getPurchasePlan.mockResolvedValue(planFor25Pies)

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
