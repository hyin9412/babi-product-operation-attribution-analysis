export const checklistSource = 'https://b913a99e9972.aime-app.bytedance.net/';

export const checklistStatuses = ['待核对', '未修复', '修复中', '待验证', '已修复'] as const;
export type ChecklistStatus = typeof checklistStatuses[number];

export interface DesignChecklistItem {
  id: number;
  module: string;
  priority: 'P0' | 'P1';
  text: string;
  owner?: string;
  references?: { label: string; url: string }[];
}

export const designChecklist: DesignChecklistItem[] = [
  { id: 1, module: '全局', priority: 'P0', text: '页面 Page Title 改为「透明化分析」。' },
  { id: 2, module: '全局筛选', priority: 'P0', text: '筛选面板默认收起状态，用户可手动展开选择。展开/收起 icon 在 hover 时需变蓝（使用 @primary-5 token）。' },
  { id: 3, module: '全局筛选', priority: 'P1', text: '需要支持搜索的字段：部门收支_产品线名称、商品名称/APP名称。将原「商品 / APP 名称」简化为「商品名称」。' },
  { id: 4, module: '经营状态卡片', priority: 'P0', text: '经营状态卡片颜色映射规则：盈利=绿色、有亏损大区=红色、暂不能判断=黄色、需要关注=蓝色、数据缺失/趋势待补=灰色。长文本默认截断，hover 显示全部。' },
  { id: 5, module: '结论块', priority: 'P0', text: '结论部分全部替换成 AI 数据解读块样式，使用源力的 AI 数据解读块样式组件；如果没找到，则使用 Figma 中的样式。内容根据真实内容替换。', references: [{ label: 'Figma 中的样式', url: 'https://www.figma.com/design/lX5i7W9KsKxtSVrXIuLZC0/%E6%94%B6%E6%94%AF%E7%AE%A1%E7%90%86?node-id=4248-58316&t=0ORnk2kAS0CdiMGX-4' }] },
  { id: 6, module: '图表样式', priority: 'P0', text: '图表里，单位为 % 的，都去掉单位信息，直接在 Y 轴数值上标注。' },
  { id: 7, module: '表格样式', priority: 'P1', owner: '白旭', text: '商品概览页表格补充排序规则（当前排序逻辑不明，需明确各类内容排序）。表格固定第一列，对象栏左对齐，管理动作列额外固定。' },
  { id: 8, module: '数值样式', priority: 'P0', text: '环比 / 同比 / 偏差类数值统一采用红涨绿跌样式（正=红、负=绿），0 值为灰色，全部统一加红/绿箭头。全页面保持一致。' },
  { id: 9, module: '指标口径', priority: 'P0', text: '收支分析 Tab，数值卡片，季度目标偏差数值、年度目标偏差数值也需要加口径，形式和月度目标偏差数值展示一样——数值添加下划线，hover 展示对应口径说明与计算公式（含真实数值）。需要补上真实数值带入公式。' },
  { id: 10, module: '收支分析', priority: 'P0', text: '收支分析 Tab，第一个数值卡片，没有「1月至今累计实际值」「年度目标累计占比」信息，灰色背景色块高度充满卡片。' },
  { id: 11, module: '指标单位', priority: 'P0', text: 'PP 与百分比使用规则：利润率的同比、环比差值用 PP（两个百分比相减），其余场景使用百分比。同比/环比偏差部分应用红涨绿跌，其余为正常数字展示。' },
  { id: 12, module: '冗余信息', priority: 'P1', text: '移除页面外部冗余说明文字：「收入成本利润年度目标为全年总值」和「成本利润率直接对比目标利润率」。' },
  { id: 13, module: '收支分析', priority: 'P0', text: '收支分析模块结构调整：原表格下方直接拼接月趋势的长页面结构，改为拆分为「表格视图」「趋势视图」两个 Tab 切换。同类组件统一应用该结构。' },
  { id: 14, module: '收支分析', priority: 'P0', text: '所有月趋势模块，换成和表格的视图切换，用管道式 Tab 形式进行切换。表格维度列旁添加趋势小 icon，点击后跳转至对应维度的趋势视图 Tab，图例仅保留选中维度数据。当前仅支持单条维度下钻，不做批量勾选。维度根据不同商品，有的是计费单元*大区*售卖区域粒度，有的是计费单元*大区粒度。\nicon 位置：有售卖区域列时放在该列旁，无则放在大区列旁。icon 用 iconBox 里折线图样式。' },
  { id: 15, module: '趋势图', priority: 'P0', text: '归因分析页面所有图表，不展示总结信息、更多信息、标记点。但是不改动 playground 里的效果。' },
  { id: 16, module: '售卖量', priority: 'P0', text: '删除页面中所有售卖量相关的图表和表格内容，与最新版产品设计保持一致。' },
  { id: 17, module: '图表联动', priority: 'P0', text: '图表与全局筛选联动逻辑：所有图表是否展示月度/季度/年度目标值，均与全局筛选联动。未选中对应维度目标时隐藏对应图表，将后续图表上提。偏差趋势图按月度、季度、年度拆分展示。在原有基础上增加：之前图表如果对于目标值有特殊说明的，则不变。' },
  { id: 18, module: '公式树', priority: 'P0', text: '公式树交互优化：原上下堆叠的二级节点结构改为标准树状层级结构，确保展开多个节点时仍能清晰对应父子层级关系。节点内长公式默认截断展示 2-3 行，hover 展示完整内容。括号、运算符号、函数需拆分绘制为独立节点。' },
  { id: 19, module: '公式树', priority: 'P1', text: '点击公式节点弹出抽屉，抽屉内展示指标、口径、数值、目标值、偏差等全部详情信息（除指标和口径计算公式外的信息都放入抽屉）。' },
  { id: 20, module: '数据看板', priority: 'P1', text: '第三个 Tab，下方指标趋势部分的筛选：日期采用源力的月份范围组件，不禁用；月总计/月日均切换，只在某些指标被选择时会出现，具体哪些支持展示可以和该页面里对齐。', references: [{ label: '指标趋势参考页面', url: 'https://f8c83ea75fd9.ida-app.bytedance.net/' }] },
  { id: 21, module: '全局筛选', priority: 'P0', text: '全局筛选项区分必填与非必填：除「目标」相关筛选项为非必填外，其余筛选项均为必填。需在筛选面板中对必填项做明确标识。' },
];

export function checklistCopyText(item: DesignChecklistItem) {
  return [
    `第 ${item.id} 条｜${item.module}｜${item.priority}${item.owner ? `｜@${item.owner}` : ''}`,
    item.text,
    ...(item.references || []).map(ref => `${ref.label}：${ref.url}`),
  ].join('\n');
}
