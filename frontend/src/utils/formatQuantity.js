// Displays gram amounts over 1000g as kilograms with one decimal
// (e.g. 1250 g -> "1.3 kg"); everything else is shown as-is.
const formatQuantity = (value, unit) => {
  if (unit === 'g' && value >= 1000) {
    return `${(value / 1000).toFixed(1)} kg`
  }
  return `${value} ${unit}`
}

export default formatQuantity
