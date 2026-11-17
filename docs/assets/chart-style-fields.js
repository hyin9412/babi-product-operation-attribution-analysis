// Sources: analysisUI.tsx / analysis.css and @visactor/vchart 1.13.10
// theme/builtin/common/{component/tooltip,component/axis,mark,series/line},
// theme/builtin/light/color-scheme and theme/token/builtin/default.
window.CHART_STYLE_GROUPS = [
  ["卡片与文字颜色 · 页面样式", [
    ["cardBackground", "卡片背景", "#ffffff", "color"],
    ["cardBorderColor", "卡片边框颜色", "#eaedf1", "color"],
    ["titleColor", "标题颜色", "#0c0d0e", "color"],
    ["titleWeight", "标题字重", "500", "select", [["400", "常规"], ["500", "中等"], ["600", "半粗"], ["700", "粗体"]]],
    ["unitColor", "单位颜色", "#737a87", "color"]
  ]],
  ["普通系列色板 · 源码 10 色", [
    "#1664FF", "#1AC6FF", "#FF8A00", "#3CC780", "#7442D4",
    "#FFC400", "#304D77", "#B48DEB", "#009488", "#FF7DDA"
  ].map((color, index) => [`palette${index}`, `系列 ${index + 1}`, color, "color"])],
  ["扩展系列色板 · 源码 20 色", [
    "#1664FF", "#B2CFFF", "#1AC6FF", "#94EFFF", "#FF8A00",
    "#FFCE7A", "#3CC780", "#B9EDCD", "#7442D4", "#DDC5FA",
    "#FFC400", "#FAE878", "#304D77", "#8B959E", "#B48DEB",
    "#EFE3FF", "#009488", "#59BAA8", "#FF7DDA", "#FFCFEE"
  ].map((color, index) => [`extendedPalette${index}`, `扩展系列 ${index + 1}`, color, "color"])],
  ...["x", "y"].map(axis => [`${axis.toUpperCase()} 轴 · 源码 + VChart 默认`, [
    [`${axis}LabelVisible`, "显示轴标签", true, "checkbox"],
    [`${axis}LabelFontSize`, "轴标签字号", 12, 8, 32],
    [`${axis}LabelColor`, "轴标签颜色", "#737a87", "color"],
    [`${axis}LabelWeight`, "轴标签字重", "normal", "select", [["normal", "常规"], ["bold", "粗体"]]],
    [`${axis}LabelOpacity`, "轴标签不透明度", 1, 0, 1],
    [`${axis}LabelSpace`, "轴标签与轴的间距", axis === "x" ? 8 : 12, 0, 40],
    [`${axis}DomainVisible`, "显示轴线", axis === "x", "checkbox"],
    [`${axis}DomainColor`, "轴线颜色", axis === "x" ? "#dce4ef" : "#d9dde4", "color"],
    [`${axis}DomainWidth`, "轴线宽度", 1, 0, 8],
    [`${axis}DomainOpacity`, "轴线不透明度", 1, 0, 1],
    [`${axis}TickVisible`, "显示刻度线", false, "checkbox"],
    [`${axis}TickSize`, "刻度线长度", 4, 0, 20],
    [`${axis}TickColor`, "刻度线颜色", "#d9dde4", "color"],
    [`${axis}TickWidth`, "刻度线宽度", 1, 0, 8],
    [`${axis}GridVisible`, "显示网格线", axis === "y", "checkbox"],
    [`${axis}GridColor`, "网格线颜色", axis === "y" ? "#e9eef6" : "#f1f2f5", "color"],
    [`${axis}GridWidth`, "网格线宽度", 1, 0, 8],
    [`${axis}GridOpacity`, "网格线不透明度", 1, 0, 1],
    [`${axis}GridDash`, "网格线型", axis === "y" ? "dash" : "solid", "select", [["solid", "实线"], ["dash", "虚线"]]],
    [`${axis}GridDashLength`, "网格虚线线段长度", 3, 0, 24],
    [`${axis}GridDashGap`, "网格虚线间隔", 3, 0, 24]
  ]]),
  ["折线 · 源码 + VChart 默认", [
    ["lineWidth", "折线宽度", 2.3, 0.1, 12],
    ["lineOpacity", "折线不透明度", 1, 0, 1],
    ["lineDash", "线型（预览全部系列）", "solid", "select", [["solid", "实线"], ["dash", "虚线"], ["dot", "点线"]]],
    ["lineDashLength", "虚线线段长度", 6, 0, 32],
    ["lineDashGap", "虚线间隔", 4, 0, 32],
    ["lineDotLength", "点线线段长度", 2, 0, 16],
    ["lineDotGap", "点线间隔", 3, 0, 16],
    ["lineCap", "线段端点形状", "round", "select", [["round", "圆形"], ["butt", "平直"], ["square", "方形"]]],
    ["lineJoin", "折线连接形状", "round", "select", [["round", "圆形"], ["miter", "尖角"], ["bevel", "斜角"]]]
  ]],
  ["数据点 · 源码 + VChart 默认", [
    ["pointVisible", "常态展示折线数据点", false, "checkbox"],
    ["pointHoverVisible", "Hover 展示折线数据点", true, "checkbox"],
    ["pointHoverSize", "Hover 数据点大小", 10, 2, 32],
    ["pointSize", "数据点大小", 5, 0, 32],
    ["pointShape", "数据点形状", "circle", "select", [["circle", "圆形"], ["square", "方形"], ["diamond", "菱形"], ["triangle", "三角形"]]],
    ["pointOpacity", "数据点填充不透明度", 1, 0, 1],
    ["pointStroke", "数据点描边颜色", "#ffffff", "color"],
    ["pointStrokeWidth", "数据点描边宽度", 1, 0, 8]
  ]],
  ["折线图 · Hover 辅助线", [
    ["crosshairVisible", "显示 hover 辅助线", true, "checkbox"],
    ["crosshairColor", "辅助线颜色", "#C9CDD4", "color"],
    ["crosshairWidth", "辅助线宽度", 1, 0.5, 8],
    ["crosshairDash", "辅助线线型", "solid", "select", [["solid", "实线"], ["dash", "虚线"]]]
  ]],
  ["柱形 · 当前为默认直角", [
    ["barRadius", "柱形圆角", 0, 0, 24],
    ["barOpacity", "柱形填充不透明度", 1, 0, 1]
  ]],
  ["图例外观 · 页面样式", [
    ["legendColor", "图例文字颜色", "#737a87", "color"],
    ["legendMarkerType", "图例标记样式", "square", "select", [["square", "方块"], ["dash", "虚线"]]],
    ["legendMarkerSize", "图例色块大小", 10, 2, 24],
    ["legendMarkerDashWidth", "图例虚线标记宽度", 10, 8, 48],
    ["legendMarkerRadius", "图例方块圆角（固定）", 1.54, 1.54, 1.54],
    ["legendHiddenOpacity", "隐藏系列的图例不透明度", 0.35, 0, 1]
  ]],
  ["图例交互 · 背景与宽度", [
    ["legendWidthMode", "图例背景宽度模式", "auto", "select", [["auto", "随色块＋文字自适应"], ["fixed", "固定宽度"]]],
    ["legendFixedWidth", "图例背景固定宽度（固定模式生效）", 120, 40, 600],
    ["legendMaxWidth", "自适应最大宽度（超出文字省略）", 228, 40, 600],
    ["legendButtonPadding", "色块＋文字 → 背景左右边距", 4, 0, 32],
    ["legendButtonHeight", "图例背景高度", 20, 16, 48],
    ["legendButtonRadius", "图例背景圆角", 2, 0, 24],
    ["legendHoverBackground", "悬停图例背景颜色", "#f2f3f5", "color"],
    ["legendHoverColor", "悬停图例文字颜色", "#0c0d0e", "color"]
  ]],
  ["图例交互 · 文字与状态", [
    ["legendLineHeight", "图例文字行高", 20, 12, 48],
    ["legendFontWeight", "图例文字字重", "400", "select", [["400", "常规"], ["500", "中等"], ["600", "半粗"]]],
    ["legendFocusColor", "键盘聚焦描边颜色", "#1664ff", "color"],
    ["legendFocusWidth", "键盘聚焦描边宽度", 2, 0, 8],
    ["legendFocusOffset", "键盘聚焦描边偏移", 2, 0, 12]
  ]],
  ["图例交互 · 仅展示图标", [
    ["legendActionGap", "文字按钮 → 操作图标", 4, 0, 32],
    ["legendActionSize", "操作按钮尺寸", 20, 16, 48],
    ["legendActionIconSize", "操作图标尺寸（含内部留白）", 20, 12, 48],
    ["legendActionStrokeWidth", "操作图标线宽", 1.33, 0.5, 4],
    ["legendActionColor", "操作图标颜色", "#333333", "color"],
    ["legendActionBackground", "操作按钮背景", "#f6f8fa", "color"],
    ["legendActionHoverColor", "操作图标悬停颜色", "#333333", "color"],
    ["legendActionHoverBackground", "操作按钮悬停背景", "#f6f8fa", "color"],
    ["legendActionRadius", "操作按钮圆角", 2, 0, 24],
    ["legendActionVisibility", "操作图标显示方式", "hover", "select", [["hover", "悬停 / 聚焦时显示"], ["always", "始终显示"]]]
  ]],
  ["图例交互 · 操作提示浮层", [
    ["legendHintVisible", "显示操作提示", true, "checkbox"],
    ["legendHintGap", "提示浮层 → 按钮", 8, 0, 40],
    ["legendHintPaddingX", "提示水平内边距", 12, 0, 40],
    ["legendHintPaddingY", "提示垂直内边距", 8, 0, 40],
    ["legendHintFontSize", "提示字号", 12, 8, 24],
    ["legendHintLineHeight", "提示行高", 20, 12, 40],
    ["legendHintColor", "提示文字颜色", "#42464e", "color"],
    ["legendHintBackground", "提示背景", "#ffffff", "color"],
    ["legendHintBorderColor", "提示边框颜色", "#dde2e9", "color"],
    ["legendHintBorderWidth", "提示边框宽度", 0.5, 0, 4],
    ["legendHintRadius", "提示圆角", 4, 0, 24],
    ["legendHintShadowX", "提示阴影水平偏移", 0, -20, 20],
    ["legendHintShadowY", "提示阴影垂直偏移", 4, -20, 20],
    ["legendHintShadowBlur", "提示阴影模糊", 12, 0, 40],
    ["legendHintShadowColor", "提示阴影颜色", "#000000", "color"],
    ["legendHintShadowOpacity", "提示阴影不透明度", 0.1, 0, 1]
  ]],
  ["Tooltip 面板 · VChart 默认主题", [
    ["tooltipVisible", "启用 hover tooltip", true, "checkbox"],
    ["tooltipShowUnit", "数值显示单位", false, "checkbox"],
    ["tooltipAbbreviateAmount", "金额自动缩写（万 / 亿，保留 2 位）", true, "checkbox"],
    ["tooltipBackground", "面板背景", "#ffffff", "color"],
    ["tooltipPaddingTop", "面板上内边距", 10, 0, 40],
    ["tooltipPaddingRight", "面板右内边距", 10, 0, 40],
    ["tooltipPaddingBottom", "面板下内边距", 10, 0, 40],
    ["tooltipPaddingLeft", "面板左内边距", 10, 0, 40],
    ["tooltipBorderColor", "面板边框颜色", "#ffffff", "color"],
    ["tooltipBorderWidth", "面板边框宽度", 0, 0, 8],
    ["tooltipRadius", "面板圆角", 3, 0, 24],
    ["tooltipRowGap", "内容行间距", 6, 0, 32],
    ["tooltipOffsetX", "距鼠标水平偏移", 10, 0, 60],
    ["tooltipOffsetY", "距鼠标垂直偏移", 10, 0, 60],
    ["tooltipShadowX", "阴影水平偏移", 0, -20, 20],
    ["tooltipShadowY", "阴影垂直偏移", 4, -20, 20],
    ["tooltipShadowBlur", "阴影模糊", 12, 0, 40],
    ["tooltipShadowSpread", "阴影扩散", 0, 0, 20],
    ["tooltipShadowColor", "阴影颜色", "#21252c", "color"],
    ["tooltipShadowOpacity", "阴影不透明度", 0.1, 0, 1],
    ["tooltipShapeType", "Tooltip 图例标记样式", "square", "select", [["square", "方块"], ["dash", "虚线"]]],
    ["tooltipShapeSize", "内容方块大小", 10, 0, 24],
    ["tooltipShapeRadius", "Tooltip 方块圆角（固定）", 1.54, 1.54, 1.54],
    ["tooltipShapeDashWidth", "Tooltip 虚线标记宽度", 10, 8, 48],
    ["tooltipShapeGap", "色块与字段间距", 6, 0, 32]
  ]],
  ...[["Title", "标题", "#21252c", "bold", 0], ["Key", "字段名", "#606773", "normal", 26], ["Value", "数值", "#21252c", "bold", 0]].map(([part, label, color, weight, spacing]) => [`Tooltip ${label} · VChart 默认主题`, [
    [`tooltip${part}FontSize`, `${label}字号`, 14, 8, 32],
    [`tooltip${part}LineHeight`, `${label}行高`, 21, 10, 48],
    [`tooltip${part}Color`, `${label}颜色`, color, "color"],
    [`tooltip${part}Weight`, `${label}字重`, weight, "select", [["normal", "常规"], ["bold", "粗体"]]],
    [`tooltip${part}Spacing`, `${label}后间距`, spacing, 0, 60]
  ]])
];
