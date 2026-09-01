const formatNeeded = (line) => {
  if (line.unitType === 'discrete' && line.neededRounded !== line.needed) {
    return `${line.needed} needed → ${line.neededRounded} (rounded up, can't buy a fraction of an ${line.name})`
  }
  return line.unitType === 'discrete' ? line.neededRounded : line.needed
}

const IngredientRow = ({ line }) => (
  <tr className={line.shortfall > 0 ? 'shortfall' : ''}>
    <td>{line.name}</td>
    <td>{formatNeeded(line)} {line.unit}</td>
    <td>{line.currentStock} {line.unit}</td>
    <td>{line.shortfall > 0 ? `${line.shortfall} ${line.unit}` : '—'}</td>
  </tr>
)

export default IngredientRow
