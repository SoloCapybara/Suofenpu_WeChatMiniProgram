const { request } = require('./http.js')

function getStoreInfo() {
  return request({
    url: '/api/store',
    method: 'GET',
  })
}

function getHomeBanners() {
  return request({
    url: '/api/store/banners',
    method: 'GET',
  })
}

module.exports = {
  getStoreInfo,
  getHomeBanners,
}
