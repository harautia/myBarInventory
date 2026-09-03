import formatQuantity from '../utils/formatQuantity'

const formatNeeded = (line) => {
  // This message only ever fires for discrete items (pieces/whole units),
  // never grams, so it's plain numbers rather than routed through
  // formatQuantity's kg conversion.
  if (line.neededRounded !== undefined && line.neededRounded !== line.needed) {
    return `${line.needed} needed → ${line.neededRounded} (rounded up, can't buy a fraction of an ${line.name}) ${line.unit}`
  }
  return formatQuantity(line.needed, line.unit)
}

const formatShortfall = (line) => {
  if (line.shortfall <= 0) return '—'
  const value = line.rawShortfall !== undefined ? line.rawShortfall : line.shortfall
  return formatQuantity(value, line.unit)
}

const IngredientRow = ({ line }) => (
  <tr className={line.shortfall > 0 ? 'shortfall' : ''}>
    <td>{line.name}</td>
    <td>{formatNeeded(line)}</td>
    <td>{formatQuantity(line.currentStock, line.unit)}</td>
    <td>{formatShortfall(line)}</td>
  </tr>
)

export default IngredientRow
