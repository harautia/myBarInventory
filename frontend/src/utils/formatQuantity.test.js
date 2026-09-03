import { describe, test, expect } from 'vitest'
import formatQuantity from './formatQuantity'

describe('formatQuantity', () => {
  test('leaves gram amounts under 1000 g as-is', () => {
    expect(formatQuantity(191.25, 'g')).toBe('191.25 g')
    expect(formatQuantity(999, 'g')).toBe('999 g')
  })

  test('converts gram amounts of 1000 g or more to kg with one decimal', () => {
    expect(formatQuantity(1000, 'g')).toBe('1.0 kg')
    expect(formatQuantity(1250, 'g')).toBe('1.3 kg')
    expect(formatQuantity(4500, 'g')).toBe('4.5 kg')
  })

  test('leaves non-gram units unaffected regardless of magnitude', () => {
    expect(formatQuantity(1500, 'l')).toBe('1500 l')
    expect(formatQuantity(2, 'piece')).toBe('2 piece')
  })
})
