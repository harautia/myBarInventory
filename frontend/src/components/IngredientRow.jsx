const formatNeeded = (line) => {
  if (line.neededRounded !== undefined && line.neededRounded !== line.needed) {
    return `${line.needed} needed → ${line.neededRounded} (rounded up, can't buy a fraction of an ${line.name})`
  }
  return line.needed
}

const formatShortfall = (line) => {
  if (line.shortfall <= 0) return '—'
  if (line.rawShortfall !== undefined) {
    return `${line.shortfall} ${line.unit} (${line.rawShortfall} ${line.unit} short, rounded up to the nearest 10 ${line.unit} — extra goes to stock)`
  }
  return `${line.shortfall} ${line.unit}`
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
