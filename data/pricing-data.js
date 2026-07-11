const PACKING_FEE_PER_ITEM = 1
const DELIVERY_FEE = 3

const coupons = [
  { id: 'none', label: '不使用优惠券', minSpend: 0, discount: 0 },
  { id: 'new5', label: '无门槛5元券', minSpend: 0, discount: 5 },
  { id: 'full30', label: '满30减5', minSpend: 30, discount: 5 },
  { id: 'full50', label: '满50减10', minSpend: 50, discount: 10 },
]

module.exports = {
  PACKING_FEE_PER_ITEM,
  DELIVERY_FEE,
  coupons,
}
