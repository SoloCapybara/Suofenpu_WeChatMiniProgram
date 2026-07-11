const { orderStatusText } = require('../data/order-data.js')
const { money } = require('../utils/money.js')

function getOrderGroup(status) {
  if (status === 'PENDING_PAYMENT' || status === 'PAID') return 'pending'
  if (status === 'ACCEPTED' || status === 'PREPARING' || status === 'DELIVERING') return 'processing'
  if (status === 'COMPLETED') return 'completed'
  return 'other'
}

function transformOrder(order) {
  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date()
  const firstItem = (order.items || [])[0] || {}
  const optionTags = [firstItem.spec, firstItem.spice].filter(Boolean).slice(0, 2)
  const status = order.status || 'PAID'
  const orderGroup = getOrderGroup(status)
  const isPending = orderGroup === 'pending'
  const isProcessing = orderGroup === 'processing'
  const isCompleted = orderGroup === 'completed'

  return {
    id: order.orderNo,
    orderNo: order.orderNo,
    title: firstItem.dishName || `订单 ${order.orderNo}`,
    items: (order.items || []).map((item) => `${item.dishName} ${item.spec} · ${item.spice} x${item.quantity}`).join('，'),
    imageUrl: '/assets/banner-1.jpg',
    optionTags,
    quantityText: `x${(order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 1}`,
    total: Number(order.totalAmount || 0),
    totalText: money(Number(order.totalAmount || 0)),
    status: orderStatusText[status] || status || '处理中',
    rawStatus: status,
    orderGroup,
    isPending,
    isProcessing,
    isCompleted,
    isOther: orderGroup === 'other',
    time: `${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')}`,
    dayText: createdAt.toDateString() === new Date().toDateString() ? '今天' : `${createdAt.getMonth() + 1}-${createdAt.getDate()}`,
    address: order.address,
    deliveryTime: order.deliveryTime,
    invoiceType: order.invoiceType,
    orderRemark: order.orderRemark,
  }
}

module.exports = {
  getOrderGroup,
  transformOrder,
}
