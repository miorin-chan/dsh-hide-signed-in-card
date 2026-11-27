# 项目文档

- [产品设计](../DESIGN.md)：问题定位、目标体验、边界与成功标准。
- [使用说明](../README.zh.md)
- 插件在 `shell.overlay` 挂载无布局占位的样式，不替换账号组件，也不读取凭据。
- 已登录时，插件在 `plugins.bundle.config` 注册组件级样式的账号操作卡，
  复用 `@deepseek-ai/dsh-client-ui-primitives` 的 `Button`、`Modal`、`StateDot` 与图标，
  并内联官方 `LogoutIcon`（见 [LICENSE.deepseek-harness](../LICENSE.deepseek-harness)），提供意见反馈和退出登录。
  反馈链接指向 DSH 默认问卷并移除预填参数，不附带账号或设备资料。
  退出登录调用 DSH 账号接口，确认前查询任务影响，失败后可重试。
- DSH 升级后，重跑 `npm test` 和 `npm run check`，并在实际界面验证已登录隐藏、
  未登录保留、停用恢复，以及设置快捷键和底部其他状态提示仍可使用。
  检查插件独立详情及外观 Atlas 的设置区是否显示两项操作。
