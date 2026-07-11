const menuCategories = [
  { key: 'recommend', name: '招牌推荐', icon: '/assets/icons/lucide/thumbs-up.svg' },
  { key: 'noodles', name: '螺蛳粉', icon: '/assets/icons/lucide/bowl.svg' },
  { key: 'snacks', name: '特色小吃', icon: '/assets/icons/lucide/sparkle.svg' },
  { key: 'drinks', name: '饮品甜品', icon: '/assets/icons/lucide/cup.svg' },
  { key: 'toppings', name: '加料配菜', icon: '/assets/icons/lucide/carrot.svg' },
  { key: 'combo', name: '套餐组合', icon: '/assets/icons/lucide/gift.svg' },
]

const categoryIconByCode = menuCategories.reduce((map, category) => {
  map[category.key] = category.icon
  return map
}, {})

module.exports = {
  categoryIconByCode,
  menuCategories,
}
