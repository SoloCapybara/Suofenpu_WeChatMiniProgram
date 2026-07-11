const { specOptions, spiceOptions, tablewareOptions } = require('../data/spec-data.js')
const { money } = require('../utils/money.js')

function defaultSpecState() {
  return {
    selectedDish: null,
    selectedSpec: specOptions[0].label,
    selectedSpice: spiceOptions[1],
    selectedTableware: tablewareOptions[0],
    specQty: 1,
    itemRemark: '',
    specTotalText: money(0),
  }
}

function getSpecOption(label) {
  return specOptions.find((item) => item.label === label) || specOptions[0]
}

module.exports = {
  defaultSpecState,
  getSpecOption,
}
