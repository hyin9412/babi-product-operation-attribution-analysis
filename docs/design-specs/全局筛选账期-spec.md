# 全局筛选账期

- 页面框架：沿用透明化分析 Dashboard 和交互说明演示的现有布局。
- 模块：全局筛选中的必填账期，沿用现有筛选顺序和标签。
- 组件：源力 DatePicker.MonthPicker，经项目现有 babi-design 预览适配层导出，沿用源力主题。
- API 依据：已安装 DatePicker/interface.d.ts 的 MonthPickerProps、PickerProps。
- 值：沿用各 Tab 当前草稿值和默认账期，格式为 YYYY-MM。
- 可选范围：沿用 analysisData.months；其他月份禁用。
- 交互：按月选择，不允许清空；修改后进入待查询状态，点击查询后更新数据和摘要。
- 布局：占满原筛选网格单元，保留现有间距与查询按钮对齐。
- 映射自检：框架、筛选模块、月份组件、必填与查询功能、展开/收起摘要闭环均已覆盖。
- 规范适用：用户明确指定 DatePicker 及现有筛选布局，优先于通用筛选模块的默认 Select 用法；无需新增其他模块。
