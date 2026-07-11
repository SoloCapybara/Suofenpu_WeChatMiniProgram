const { request } = require('./http.js')

function listMyOrders() {
  return request({
    url: '/api/orders/my',
    method: 'GET',
  })
}

function createOrder(data) {
  return request({
    url: '/api/orders',
    method: 'POST',
    header: {
      'content-type': 'application/json',
    },
    data,
  })
}

module.exports = {
  listMyOrders,
  createOrder,
}
