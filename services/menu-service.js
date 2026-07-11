const { request } = require('./http.js')

function listDishes() {
  return request({
    url: '/api/menu/dishes',
    method: 'GET',
  })
}

function listCategories() {
  return request({
    url: '/api/menu/categories',
    method: 'GET',
  })
}

module.exports = {
  listCategories,
  listDishes,
}
