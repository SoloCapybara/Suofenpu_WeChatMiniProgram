# 小程序前台模块约定

第一版先保持 `pages/index` 单页面入口不变，避免频繁改动路由和页面跳转。业务代码必须按下面边界拆分，后续再逐步把 WXML/WXSS 拆成组件。

## 目录职责

- `pages/index/`：首页、菜单、订单、购物车、我的的页面容器，只写页面状态、事件绑定和 `setData` 编排。
- `pages/index/modules/`：当前首页容器的事件方法分组。页面入口 `index.js` 只组合这些模块。
- `data/`：静态配置、枚举、费用策略、默认展示数据。不要在这里写请求和页面逻辑。
- `models/`：纯数据转换和计算，例如购物车金额、订单状态映射、商品格式化、规格默认值。
- `services/`：后端接口调用。页面不能直接拼 `/api/...`，统一通过这里请求。
- `styles/`：按页面区域拆分的 WXSS。`pages/index/index.wxss` 只保留 `@import`。
- `utils/`：通用小工具，例如金额格式化、日期格式化。
- `assets/`：图片、头像、本地图标。图标优先使用第三方图标库下载到本地。

## 维护粒度

- 新接口：先在 `services/` 增加方法，再由页面调用。
- 新枚举或固定选项：放到 `data/`，例如订单状态、配送时间、发票类型。
- 新金额计算规则：放到 `models/cart-model.js` 或独立 pricing model，不写在页面事件里。
- 新订单展示字段：优先改 `models/order-model.js`。
- 新商品字段适配：优先改 `models/dish-model.js`。
- 新弹窗默认状态：优先改对应 model，例如规格弹窗在 `models/spec-model.js`。
- 新样式：按区域放到 `styles/`，不要继续堆到页面 WXSS 里。
- 新页面事件：按业务域放到 `pages/index/modules/`，不要继续写进 `pages/index/index.js`。

## 当前页面方法分组

- `agreement-actions.js`：协议弹窗、用户协议、隐私政策入口。
- `auth-actions.js`：登录面板、微信登录、退出登录、用户资料展示。
- `navigation-actions.js`：底部 tab、订单 tab、首页服务入口、定位。
- `menu-actions.js`：菜单加载、规格选择、加入购物车、菜单减数量。
- `order-cart-actions.js`：购物车数量、优惠券、配送/发票/备注、下单、我的订单加载。

## 后续组件拆分建议

下一步可以把 `pages/index/index.wxml` 拆成以下组件：

- `components/home-section/`
- `components/menu-section/`
- `components/cart-section/`
- `components/orders-section/`
- `components/mine-section/`
- `components/login-sheet/`
- `components/spec-sheet/`
- `components/bottom-tabbar/`

拆组件时，每个组件自带 `.wxml/.wxss/.js/.json`，父页面只负责传数据和接事件。
