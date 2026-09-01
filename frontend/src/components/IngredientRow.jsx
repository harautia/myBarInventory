const formatNeeded = (line) => {
  const hasRoundedValue = line.neededRounded !== undefined
  const displayValue = hasRoundedValue ? line.neededRounded : line.needed

  if (hasRoundedValue && line.neededRounded !== line.needed) {
    const reason = line.unitType === 'discrete'
      ? `rounded up, can't buy a fraction of an ${line.name}`
      : `rounded up to the nearest 10 ${line.unit}`
    return `${line.needed} needed → ${line.neededRounded} (${reason})`
  }
  return displayValue
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
