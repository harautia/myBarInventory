const formatNeeded = (line) => {
  if (line.neededRounded !== undefined && line.neededRounded !== line.needed) {
    return `${line.needed} needed → ${line.neededRounded} (rounded up, can't buy a fraction of an ${line.name})`
  }
  return line.needed
}

const formatShortfall = (line) => {
  if (line.shortfall <= 0) return '—'
  const value = line.rawShortfall !== undefined ? line.rawShortfall : line.shortfall
  return `${value} ${line.unit}`
}

const IngredientRow = ({ line }) => (
  <tr className={line.shortfall > 0 ? 'shortfall' : ''}>
    <td>{line.name}</td>
    <td>{formatNeeded(line)} {line.unit}</td>
    <td>{line.currentStock} {line.unit}</td>
    <td>{formatShortfall(line)}</td>
  </tr>
)

export default IngredientRow
