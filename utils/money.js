function money(value) {
  const amount = Number(value || 0)
  return `¥${amount.toFixed(amount % 1 === 0 ? 0 : 1)}`
}

module.exports = {
  money,
}
