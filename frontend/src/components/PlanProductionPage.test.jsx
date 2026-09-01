import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, expect } from 'vitest'
import PlanProductionPage from './PlanProductionPage'
import recipeService from '../services/recipes'

vi.mock('../services/recipes')

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

describe('PlanProductionPage', () => {
  test('shows rounded egg quantity and the shortfall in the purchase list', async () => {
    recipeService.getPurchasePlan.mockResolvedValue(planFor25Pies)

    render(<PlanProductionPage />)

    const user = userEvent.setup()
    await user.clear(screen.getByRole('spinbutton'))
    await user.type(screen.getByRole('spinbutton'), '25')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(await screen.findByText(/2\.5 needed → 3/)).toBeInTheDocument()
    expect(screen.getByText(/egg: 3 unit/)).toBeInTheDocument()
  })

  test('shows the raw shortfall in the table and the rounded amount in the purchase list', async () => {
    recipeService.getPurchasePlan.mockResolvedValue(planWithGramRounding)

    render(<PlanProductionPage />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    // "22.5 g" appears twice in the breakdown table: the Needed column and
    // the (unrounded) Shortfall column both show the raw 22.5 g value.
    expect(await screen.findAllByText('22.5 g')).toHaveLength(2)
    expect(screen.getByText(/Purchase list \(rounded values\)/)).toBeInTheDocument()
    expect(screen.getByText(/salt: 30 g/)).toBeInTheDocument()
  })
})
