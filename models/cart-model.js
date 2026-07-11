const { coupons, PACKING_FEE_PER_ITEM, DELIVERY_FEE } = require('../data/pricing-data.js')
const { money } = require('../utils/money.js')

function makeLineKey(dishId, spec, spice, tableware, remark) {
  return [dishId, spec, spice, tableware, remark.trim()].join('|')
}

function decorateCartItem(item) {
  const lineTotal = item.unitPrice * item.qty
  return {
    ...item,
    unitPriceText: money(item.unitPrice),
    lineTotalText: money(lineTotal),
    optionText: `${item.spec} · ${item.spice} · ${item.tableware}`,
  }
}

function buildViewState(cartItems, selectedCouponId, dishSource) {
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
  const packingFee = cartCount * PACKING_FEE_PER_ITEM
  const deliveryFee = cartCount > 0 ? DELIVERY_FEE : 0
  const selectedCoupon = coupons.find((coupon) => coupon.id === selectedCouponId) || coupons[0]
  const usableCoupon = subtotal >= selectedCoupon.minSpend ? selectedCoupon : coupons[0]
  const couponDiscount = Math.min(usableCoupon.discount, subtotal + packingFee + deliveryFee)
  const payableTotal = Math.max(0, subtotal + packingFee + deliveryFee - couponDiscount)

  const dishes = dishSource.map((dish) => ({
    ...dish,
    qty: cartItems
      .filter((item) => item.dishId === dish.id)
      .reduce((sum, item) => sum + item.qty, 0),
    priceText: money(dish.price),
  }))

  return {
    dishes,
    cartItems: cartItems.map(decorateCartItem),
    cartCount,
    subtotal,
    subtotalText: money(subtotal),
    packingFee,
    packingFeeText: money(packingFee),
    deliveryFee,
    deliveryFeeText: money(deliveryFee),
    couponDiscount,
    couponDiscountText: `- ${money(couponDiscount)}`,
    couponSummaryText: couponDiscount > 0 ? `已优惠${money(couponDiscount)}` : '暂无可用优惠',
    cartTotal: payableTotal,
    cartTotalText: money(payableTotal),
    coupons: coupons.map((coupon) => ({
      ...coupon,
      discountText: coupon.discount > 0 ? `-¥${coupon.discount}` : '',
      disabled: subtotal < coupon.minSpend,
      checked: coupon.id === usableCoupon.id,
      ruleText: coupon.minSpend > 0 ? `满${coupon.minSpend}可用` : '当前可用',
    })),
    selectedCouponId: usableCoupon.id,
  }
}

module.exports = {
  makeLineKey,
  buildViewState,
}
