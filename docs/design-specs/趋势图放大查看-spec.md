# 趋势图放大查看

## 规范映射清单

- 页面框架：沿用 Dashboard 与现有卡片网格。
- 模块：所有 AnalysisChart 卡片右上角的放大入口及放大窗口。
- 组件：复用 AnalysisChart、Source Design Modal 的遮罩与焦点管理、Button、IconRichText、IconExitRichText、TrendRangeControl。
- 核心功能：放大窗口显示同一图表的数据、单位、图例和现有 TopN 控件。
- 交互闭环：TopN 更改同时更新原图与放大图，不关闭窗口；退出全屏、Escape 或点击遮罩返回页面。

## 布局与状态

- 全屏及退出全屏入口使用 28×28px 的线性（outline）按钮，分别使用 iconbox 的 rich-text、exit-rich-text 图标，悬停提示分别为“全屏”“退出全屏”，位于已有 TopN 控件右侧。
- 参考 BABI 可视化分析页面的全屏图表：窗口宽高均为视口的 95%，无独立 header、footer、关闭图标及额外内容边框/内边距；图表本身是唯一展示面，圆角 8px。
- 图表右上角保留 TopN 与图例重置，提供“退出全屏”图标；所有图表全屏后均不显示“查看月趋势”入口。
- 全屏容器按 8px 圆角裁剪内容，内容层继承圆角，避免白色背景覆盖圆角区域。
- 全屏图表四周内容 padding 为 20px。
- 原卡片保留位置与高度，图表仅渲染一份，避免 tooltip 与图例状态分叉。
- 保留图例隐藏状态、TopN 范围及双 Y 轴样式；打开或关闭窗口时解除固定 tooltip。
- 不再用 TopN 范围作为图表组件的 React key，避免筛选导致放大窗口被卸载。
- 退出全屏保持页面滚动位置。
