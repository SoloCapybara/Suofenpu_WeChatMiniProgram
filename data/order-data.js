const deliveryTimes = ['立即配送', '30分钟后', '12:00-12:30', '18:00-18:30']
const invoiceOptions = ['不开发票', '个人发票', '公司发票']

const orderTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '处理中' },
  { key: 'completed', label: '已完成' },
  { key: 'other', label: '其他' },
]

const orderStatusText = {
  PENDING_PAYMENT: '待支付',
  PAID: '待接单',
  ACCEPTED: '已接单',
  PREPARING: '制作中',
  DELIVERING: '配送中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDED: '已退款',
}

module.exports = {
  deliveryTimes,
  invoiceOptions,
  orderTabs,
  orderStatusText,
}
