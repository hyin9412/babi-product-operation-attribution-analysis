(() => {
  "use strict";
  const groups = [
    ["卡片", [
      ["cardHeight", "卡片高度（自适应模式生效）", 422, 200, 1200],
      ["paddingTop", "上内边距", 16, 0, 80], ["paddingRight", "右内边距", 16, 0, 80],
      ["paddingBottom", "下内边距 / 图例到底部", 16, 0, 80], ["paddingLeft", "左内边距", 16, 0, 80],
      ["borderWidth", "边框宽度", 1, 0, 8], ["borderRadius", "卡片圆角", 4, 0, 32]
    ]],
    ["标题与单位", [
      ["titleFontSize", "标题字号", 14, 8, 32], ["titleLineHeight", "标题行高", 22, 12, 48],
      ["titleGap", "标题内容 → 单位（整体内部）", 4, 0, 64],
      ["unitFontSize", "单位字号", 10, 8, 24], ["unitLineHeight", "单位行高", 18, 10, 40],
      ["headingGap", "标题区域整体 → 绘图区", 12, 0, 64]
    ]],
    ["标题补充 · 总结与更多信息", [
      ["showSummary", "显示总结信息", false, "checkbox"],
      ["showMoreInfo", "显示更多信息", false, "checkbox"],
      ["headingInfoGap", "标题 → 总结 / 更多信息区域", 8, 0, 40],
      ["headingInfoRowGap", "总结 → 更多信息", 4, 0, 32],
      ["summaryFontSize", "总结字号", 13, 8, 24],
      ["summaryLineHeight", "总结行高", 22, 12, 40],
      ["summaryColor", "总结文字颜色", "#42464e", "color"],
      ["moreInfoFontSize", "更多信息标签字号", 12, 8, 24],
      ["moreInfoLineHeight", "更多信息标签行高 / 最小高度", 20, 12, 40],
      ["moreInfoPaddingX", "更多信息标签左右内边距", 6, 0, 24],
      ["moreInfoGap", "更多信息标签间距", 6, 0, 32],
      ["moreInfoRadius", "更多信息标签圆角", 4, 0, 20],
      ["moreInfoColor", "更多信息文字颜色", "#42464e", "color"],
      ["moreInfoBackground", "更多信息标签背景", "#f1f3f5", "color"]
    ]],
    ["绘图区", [
      ["chartHeightMode", "绘图区高度模式", "fixed", "select", [["fixed", "固定绘图区高度"], ["adaptive", "按卡片剩余空间自适应"]]],
      ["chartHeight", "绘图区高度", 300, 120, 640],
      ["chartPaddingTop", "VChart 内部上 padding", 0, 0, 80],
      ["chartPaddingRight", "VChart 内部右 padding", 0, 0, 80],
      ["chartPaddingBottom", "VChart 内部下 padding", 0, 0, 80],
      ["chartPaddingLeft", "VChart 内部左 padding", 0, 0, 80]
    ]],
    ["图例", [
      ["legendExclude", "点击图例排除 / 恢复", true, "checkbox"],
      ["legendIsolate", "图例后图标仅展示该指标", true, "checkbox"],
      ["legendAlign", "图例对齐方式", "left", "select", [["left", "左对齐"], ["center", "居中"], ["right", "右对齐"]]],
      ["legendMaxRows", "每页最多展示图例行数", 2, 1, 10],
      ["chartLegendGap", "图表 → 图例", 8, 0, 64],
      ["legendMinHeight", "图例最小高度", 24, 24, 80],
      ["legendColumnGap", "图例项水平间距", 4, 0, 64],
      ["legendRowGap", "图例换行间距", 12, 0, 64],
      ["legendMarkerGap", "色块 → 文字", 4, 0, 32],
      ["legendFontSize", "图例字号", 12, 8, 24]
    ]],
    ...window.CHART_STYLE_GROUPS
  ];
  const fields = groups.flatMap(([, items]) => items);
  const savedDefaults = window.CHART_SAVED_DEFAULTS || {};
  fields.forEach(field => {
    if (Object.prototype.hasOwnProperty.call(savedDefaults, field[0])) field[2] = savedDefaults[field[0]];
    if (["legendMarkerRadius", "tooltipShapeRadius"].includes(field[0])) field[2] = 1.54;
  });
  const defaults = Object.fromEntries(fields.map(([key, , value]) => [key, value]));
  const state = { ...defaults };
  const seriesNames = ["收入", "成本", "利润"];
  const getSeries = () => Array.from({ length: Number($("series-count").value) }, (_, index) => seriesNames[index] || `系列 ${index + 1}`);
  const getColors = () => getSeries().map((_, index) => state[`${getSeries().length > 10 ? "extendedPalette" : "palette"}${index}`]);
  const hidden = new Set();
  const baseValues = [
    ["中国", 19300000, 16000000], ["美国", 2500000, 3300000],
    ["欧洲 TTP", 740000, 660000], ["海外其他", 1400000, 1500000],
    ["美国 TTP", 550000, 510000]
  ].flatMap(([x, income, cost]) => [
    { x, series: "收入", value: income }, { x, series: "成本", value: cost },
    { x, series: "利润", value: income - cost }
  ]);
  const getValues = () => getSeries().flatMap((series, index) => index < 3
    ? baseValues.filter(item => item.series === series)
    : ["中国", "美国", "欧洲 TTP", "海外其他", "美国 TTP"].map((x, areaIndex) => ({ x, series, value: (index + 1) * 90000 / (areaIndex + 1) })));
  const $ = id => document.getElementById(id);
  $("chart-type").value = savedDefaults.chartType || "line";
  $("show-unit").checked = savedDefaults.showUnit ?? true;
  $("show-empty").checked = savedDefaults.previewEmpty ?? false;
  let chart;
  let frame;
  let selectedKey = null;
  let tooltipElement;
  let legendPage = 0;
  let legendPages = [];
  let legendWidth = 0;
  const firstLegend = selector => $("legend-list").querySelector(`.legend-item:not([hidden]) ${selector}`);
  function control([key, label, value, min, max]) {
    const common = `id="${key}" name="${key}"`;
    const input = min === "select" ? `<select ${common}>${max.map(([v, text]) => `<option value="${v}"${v === value ? " selected" : ""}>${text}</option>`).join("")}</select>`
      : min === "checkbox" ? `<input ${common} type="checkbox"${value ? " checked" : ""} />`
      : min === "color" ? `<input ${common} type="color" value="${value}" title="${value}" />`
      : `<input ${common} type="number" value="${value}" min="${min}" max="${max}"${min === max ? ' readonly aria-readonly="true"' : ""} step="${key === "legendMaxRows" ? "1" : /Opacity/.test(key) ? ".05" : ".1"}" />`;
    return `<div class="field"><label for="${key}">${label}</label>${input}</div>`;
  }
  $("controls").innerHTML = groups.map(([name, items]) => `<fieldset><legend>${name}</legend>${items.map(control).join("")}</fieldset>`).join("");
  $("controls").addEventListener("submit", event => event.preventDefault());
  const px = value => `${value}px`;
  function previewLegendInteraction() {
    const legend = $("preview-legend");
    legend.querySelectorAll(".preview-action, .preview-hover, .preview-excluded, .preview-focus, .preview-hint").forEach(element => {
      element.classList.remove("preview-action", "preview-hover", "preview-excluded", "preview-focus", "preview-hint");
    });
    const item = legend.querySelector(".legend-item:not([hidden])");
    if (!item || $("show-empty").checked) return;
    if (/^legend(Action|Hint)/.test(selectedKey || "")) item.classList.add("preview-action");
    if (/^legendHint/.test(selectedKey || "") && state.legendIsolate) item.lastElementChild.classList.add("preview-hint");
    if (/^legendHover/.test(selectedKey || "") || ["legendWidthMode", "legendFixedWidth", "legendMaxWidth", "legendButtonPadding", "legendButtonHeight", "legendButtonRadius"].includes(selectedKey)) item.querySelector(".legend-toggle").classList.add("preview-hover");
    if (/^legendActionHover/.test(selectedKey || "")) item.querySelector(".legend-isolate").classList.add("preview-hover");
    if (selectedKey === "legendHiddenOpacity") item.querySelector(".legend-toggle").classList.add("preview-excluded");
    if (/^legendFocus/.test(selectedKey || "")) item.querySelector(".legend-toggle").classList.add("preview-focus");
  }
  function highlightSelection() {
    previewLegendInteraction();
    const overlay = $("selection-overlay");
    overlay.hidden = true;
    tooltipElement?.classList.toggle("playground-tooltip-focused", Boolean(selectedKey?.startsWith("tooltip")));
    if (!selectedKey) {
      $("selection-info").textContent = "点击左侧数值框，查看对应位置。";
      return;
    }
    const key = selectedKey;
    const field = fields.find(([name]) => name === key);
    let note = "";
    const rect = element => element.getBoundingClientRect();
    const card = rect($("preview-card"));
    const title = rect($("preview-title"));
    const unit = rect($("preview-unit"));
    const heading = rect($("preview-heading"));
    const headingInfo = rect($("preview-heading-info"));
    const hasHeadingInfo = state.showSummary || state.showMoreInfo;
    const slot = rect($("chart-slot"));
    const legend = rect($("preview-legend"));
    const stage = rect(overlay.parentElement);
    const box = (x, y, width, height) => ({ x, y, width, height });
    const region = r => box(r.left, r.top, r.width, r.height);
    const b = state.borderWidth;
    const inner = box(card.left + b, card.top + b, card.width - b * 2, card.height - b * 2);
    let target;
    overlay.classList.remove("border-only");
    switch (key) {
      case "paddingTop": target = box(inner.x, inner.y, inner.width, state.paddingTop); break;
      case "paddingRight": target = box(inner.x + inner.width - state.paddingRight, inner.y, state.paddingRight, inner.height); break;
      case "paddingBottom": target = box(inner.x, inner.y + inner.height - state.paddingBottom, inner.width, state.paddingBottom); break;
      case "paddingLeft": target = box(inner.x, inner.y, state.paddingLeft, inner.height); break;
      case "borderWidth": target = region(card); overlay.classList.add("border-only"); note = "高亮卡片外边框"; break;
      case "borderRadius": target = box(card.left, card.top, Math.max(12, state.borderRadius * 2), Math.max(12, state.borderRadius * 2)); note = "高亮左上角，四个角同步调整"; break;
      case "titleFontSize": case "titleLineHeight": target = region(title); break;
      case "titleGap": if ($("show-unit").checked) { const bottom = hasHeadingInfo ? headingInfo.bottom : title.bottom; target = box(title.left, bottom, title.width, state.titleGap); } note = $("show-unit").checked ? "标题内容（包含可选总结与更多信息）到单位的间距" : "单位已隐藏，整体内部不保留此间距"; break;
      case "headingInfoGap": if (hasHeadingInfo) target = box(title.left, title.bottom, title.width, state.headingInfoGap); note = hasHeadingInfo ? "总结与更多信息区域到上方标题的距离" : "总结和更多信息均已关闭，不保留这段间距"; break;
      case "headingInfoRowGap": if (state.showSummary && state.showMoreInfo) { const summary = rect($("preview-summary")); target = box(summary.left, summary.bottom, summary.width, state.headingInfoRowGap); } note = state.showSummary && state.showMoreInfo ? "总结与更多信息两行之间的间距" : "仅同时展示总结和更多信息时生效"; break;
      case "unitFontSize": case "unitLineHeight": target = region(unit); break;
      case "headingGap": target = box(heading.left, heading.bottom, heading.width, state.headingGap); note = "标题、总结、更多信息和单位作为整体，到绘图区的间距固定"; break;
      case "chartHeight": case "chartHeightMode": target = region(slot); note = state.chartHeightMode === "adaptive" ? `当前实际高度 ${Math.round(slot.height * 10) / 10}px，由卡片剩余空间决定` : "当前使用固定绘图区高度"; break;
      case "cardHeight": target = region(card); overlay.classList.add("border-only"); note = state.chartHeightMode === "adaptive" ? "整个卡片高度，包含边框、内边距、标题、单位、绘图区和图例" : "切换到自适应模式后生效"; break;
      case "chartPaddingTop": target = box(slot.left, slot.top, slot.width, state.chartPaddingTop); break;
      case "chartPaddingRight": target = box(slot.right - state.chartPaddingRight, slot.top, state.chartPaddingRight, slot.height); break;
      case "chartPaddingBottom": target = box(slot.left, slot.bottom - state.chartPaddingBottom, slot.width, state.chartPaddingBottom); break;
      case "chartPaddingLeft": target = box(slot.left, slot.top, state.chartPaddingLeft, slot.height); break;
      case "chartLegendGap": target = box(slot.left, slot.bottom, slot.width, state.chartLegendGap); break;
      case "legendMinHeight": target = region(legend); note = `最小高度 ${state.legendMinHeight}px，当前实际高度 ${Math.round(legend.height)}px`; break;
      case "legendFontSize": target = region(legend); break;
      case "legendAlign": case "legendMaxRows":
        target = region(legend); note = `每页最多 ${state.legendMaxRows} 行，当前第 ${legendPage + 1} / ${legendPages.length || 1} 页；超出后通过上下按钮切换`; break;
      case "legendButtonPadding": {
        const button = rect(firstLegend(".legend-toggle"));
        target = box(button.left, button.top, state.legendButtonPadding, button.height);
        note = `背景左、右内边距均为 ${state.legendButtonPadding}px；高亮左侧，悬停背景自动预览`;
        break;
      }
      case "legendMarkerGap": {
        const marker = rect(firstLegend("i"));
        target = box(marker.right, marker.top, state.legendMarkerGap, marker.height);
        note = "以第一个图例项为例，所有图例项同步调整";
        break;
      }
      case "legendColumnGap": case "legendRowGap": {
        const buttons = Array.from($("preview-legend").querySelectorAll(".legend-item:not([hidden])"), rect);
        const first = buttons[0];
        const next = buttons.find(item => key === "legendColumnGap" ? Math.abs(item.top - first.top) < 1 && item.left > first.left : item.top > first.top + 1);
        if (next) {
          target = key === "legendColumnGap" ? box(first.right, first.top, next.left - first.right, first.height) : box(legend.left, first.bottom, legend.width, next.top - first.bottom);
        } else {
          target = region(legend);
          note = key === "legendRowGap" ? "当前图例仅一行，换行后才会出现此间距" : "当前每行只有一个图例项，同一行有多个图例项时才会出现此间距";
          overlay.classList.add("border-only");
        }
        break;
      }
    }
    if (!target) {
      if (key.startsWith("tooltip")) {
        note = state.tooltipVisible ? "右侧固定预览真实 VChart tooltip；也可取消固定后 hover 图表" : "Tooltip 已关闭，启用后才能查看样式";
      } else if (key === "titleGap" && !$("show-unit").checked) {
        note = "单位已隐藏，整体内部不保留此间距";
      } else if (/^x(Label|Domain|Tick|Grid)/.test(key)) {
        target = box(slot.left, slot.bottom - 40, slot.width, 40);
        note = "高亮 X 轴所在区域；关闭对应元素时，样式暂不显示";
      } else if (/^y(Label|Domain|Tick|Grid)/.test(key)) {
        target = box(slot.left, slot.top, Math.min(80, slot.width), slot.height);
        note = "高亮 Y 轴所在区域；网格线延伸到整个绘图区";
      } else if (key.startsWith("crosshair")) {
        target = region(slot); overlay.classList.add("border-only");
        note = $("chart-type").value !== "line" ? "仅折线图生效" : state.crosshairVisible ? "鼠标移入绘图区时显示竖向辅助线，移出后隐藏" : "辅助线已关闭，开启后可预览";
      } else if (key.startsWith("line") || key.startsWith("point") || key.startsWith("bar")) {
        target = region(slot); overlay.classList.add("border-only");
        note = key.startsWith("bar") ? "仅柱状图生效" : "仅折线图生效";
      } else if (/^(extendedPalette|palette)/.test(key)) {
        target = region(slot); overlay.classList.add("border-only");
        const extended = key.startsWith("extended");
        const index = Number(key.match(/\d+$/)[0]);
        note = (extended !== (getSeries().length > 10) || index >= getSeries().length)
          ? `当前未使用此颜色，请切换到${extended ? "20" : "10"}系列示例`
          : `作用于${getSeries()[index]}的图形、图例和 tooltip 色块`;
      } else if (/^legend(Action|Hint)/.test(key)) {
        target = region(rect(firstLegend(".legend-isolate")));
        note = !state.legendIsolate ? "仅展示操作已关闭，开启后可预览" : key.startsWith("legendHint")
          ? (state.legendHintVisible ? "自动展示第一个图例的操作提示；也可悬停图例查看" : "操作提示已关闭，开启后可预览")
          : "自动展示第一个图例的操作图标；所有图例项同步调整";
      } else if (key === "showSummary" || key.startsWith("summary")) {
        target = state.showSummary ? region(rect($("preview-summary"))) : null;
        note = state.showSummary ? "总结信息支持随宽度自动换行" : "总结信息已关闭，开启后可预览";
      } else if (key === "showMoreInfo" || key.startsWith("moreInfo")) {
        target = state.showMoreInfo ? region(rect($("preview-more-info"))) : null;
        note = state.showMoreInfo ? "更多信息使用灰底标签，空间不足时换行" : "更多信息已关闭，开启后可预览";
      } else if (key.startsWith("legend")) {
        target = region(rect(firstLegend(".legend-toggle")));
        if (/^legendHover/.test(key)) note = "自动预览第一个图例的悬停状态";
        if (/^legendFocus/.test(key)) note = "自动预览第一个图例的键盘聚焦描边";
        if (key === "legendHiddenOpacity") note = "自动预览排除态外观，图表数据保持当前筛选状态";
        if (["legendWidthMode", "legendFixedWidth", "legendMaxWidth"].includes(key)) note = state.legendWidthMode === "auto"
          ? "宽度 = 色块＋色块文字间距＋文字＋左右内边距；超过最大宽度才省略文字，固定宽度配置暂不生效"
          : "固定模式使用设定宽度；切换自适应后按色块和文字实际宽度计算";
        if (["legendButtonHeight", "legendButtonRadius"].includes(key)) note = "自动预览图例悬停背景";
      }
      else if (key.startsWith("title")) target = region(title);
      else if (key.startsWith("unit")) target = region(unit);
      else if (key.startsWith("card")) { target = region(card); overlay.classList.add("border-only"); }
    }
    if (key.startsWith("unit") && !$("show-unit").checked) {
      target = null;
      note = "单位已隐藏，勾选“显示单位”后才能查看此区域";
    }
    if ($("show-empty").checked && (key.startsWith("legend") || key === "chartLegendGap" || key.startsWith("tooltip"))) {
      target = null;
      note = "当前为空态，图例与 Tooltip 不展示；关闭“图表空态预览”后可查看";
    }
    if (key.startsWith("chartPadding")) note = "高亮 VChart 容器内部留白，不是坐标轴到数据图形的距离";
    if (target) {
      Object.assign(overlay.style, {
        left: px(target.x - stage.left - overlay.parentElement.clientLeft),
        top: px(target.y - stage.top - overlay.parentElement.clientTop),
        width: px(Math.max(2, target.width)), height: px(Math.max(2, target.height))
      });
      overlay.hidden = false;
      if (state[key] === 0) note += `${note ? "；" : ""}当前为 0px，以蓝线标示位置`;
    }
    const displayValue = typeof state[key] === "boolean" ? (state[key] ? "开启" : "关闭")
      : typeof state[key] === "number" ? `${state[key]}${key === "legendMaxRows" ? "行" : /Opacity/.test(key) ? "" : "px"}` : state[key];
    $("selection-info").textContent = `${field[1]} · ${displayValue}${note ? ` — ${note}` : ""}`;
  }
  const rgba = (hex, opacity) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${opacity})`;
  function axisSpec(axis) {
    return {
      orient: axis === "x" ? "bottom" : "left", type: axis === "x" ? "band" : "linear",
      ...(axis === "y" ? { zero: true } : {}),
      label: { visible: state[`${axis}LabelVisible`], space: state[`${axis}LabelSpace`],
        style: { fontSize: state[`${axis}LabelFontSize`], fill: state[`${axis}LabelColor`], fontWeight: state[`${axis}LabelWeight`], fillOpacity: state[`${axis}LabelOpacity`] },
        ...(axis === "y" ? { formatMethod: value => Math.abs(Number(value)) >= 1e8 ? `${(Number(value) / 1e8).toFixed(1)}亿` : Math.abs(Number(value)) >= 1e4 ? `${(Number(value) / 1e4).toFixed(0)}万` : Number(value).toFixed(Math.abs(Number(value)) < 1 ? 4 : 0) } : {})
      },
      domainLine: { visible: state[`${axis}DomainVisible`], style: { stroke: state[`${axis}DomainColor`], lineWidth: state[`${axis}DomainWidth`], strokeOpacity: state[`${axis}DomainOpacity`] } },
      tick: { visible: state[`${axis}TickVisible`], tickSize: state[`${axis}TickSize`], style: { stroke: state[`${axis}TickColor`], lineWidth: state[`${axis}TickWidth`] } },
      grid: { visible: state[`${axis}GridVisible`], style: { stroke: state[`${axis}GridColor`], lineWidth: state[`${axis}GridWidth`], strokeOpacity: state[`${axis}GridOpacity`], lineDash: state[`${axis}GridDash`] === "dash" ? [state[`${axis}GridDashLength`], state[`${axis}GridDashGap`]] : [] } }
    };
  }
  function tooltipText(part) {
    return { fontSize: state[`tooltip${part}FontSize`], lineHeight: state[`tooltip${part}LineHeight`], fontColor: state[`tooltip${part}Color`], fontWeight: state[`tooltip${part}Weight`], spacing: state[`tooltip${part}Spacing`] };
  }
  // Three filled dash segments keep the native VChart tooltip color and SVG renderer.
  const dashedMarkerPath = "M-0.5,-0.0625H-0.3V0.0625H-0.5Z M-0.1,-0.0625H0.1V0.0625H-0.1Z M0.3,-0.0625H0.5V0.0625H0.3Z";
  function roundedTooltipSquare() {
    const size = state.tooltipShapeSize;
    if (size <= 0) return "square";
    const radius = Math.min(state.tooltipShapeRadius, size / 2);
    const edge = size - radius;
    return `M${radius},0H${edge}A${radius},${radius} 0 0 1 ${size},${radius}V${edge}A${radius},${radius} 0 0 1 ${edge},${size}H${radius}A${radius},${radius} 0 0 1 0,${edge}V${radius}A${radius},${radius} 0 0 1 ${radius},0Z`;
  }
  function tooltipMarker() {
    return {
      shapeType: state.tooltipShapeType === "dash" ? dashedMarkerPath : roundedTooltipSquare(),
      shapeSize: state.tooltipShapeType === "dash" ? state.tooltipShapeDashWidth : state.tooltipShapeSize,
      shapeHollow: false, shapeLineWidth: 0
    };
  }
  function formatTooltipValue(value) {
    const numeric = Number(value);
    let formatted;
    if (state.tooltipAbbreviateAmount && Math.abs(numeric) >= 1e8) formatted = `${(numeric / 1e8).toFixed(2)}亿`;
    else if (state.tooltipAbbreviateAmount && Math.abs(numeric) >= 1e4) formatted = `${(numeric / 1e4).toFixed(2)}万`;
    else formatted = numeric.toLocaleString("zh-CN", { maximumFractionDigits: 10 });
    return `${formatted}${state.tooltipShowUnit ? "元" : ""}`;
  }
  function makeSpec() {
    return {
      type: $("chart-type").value, autoFit: true,
      padding: { top: state.chartPaddingTop, right: state.chartPaddingRight, bottom: state.chartPaddingBottom, left: state.chartPaddingLeft },
      data: [{ id: "data", values: getValues().filter(item => !hidden.has(item.series)) }],
      xField: $("chart-type").value === "bar" ? ["x", "series"] : "x",
      yField: "value", seriesField: "series",
      activePoint: $("chart-type").value === "line" && state.pointHoverVisible,
      color: { type: "ordinal", domain: getSeries(), range: getColors() }, animation: false,
      axes: [axisSpec("y"), axisSpec("x")],
      crosshair: {
        trigger: "hover", triggerOff: "hover", followTooltip: false,
        xField: $("chart-type").value === "line" ? {
          visible: state.crosshairVisible,
          line: { type: "line", style: { stroke: state.crosshairColor, lineWidth: state.crosshairWidth, lineDash: state.crosshairDash === "dash" ? [4, 4] : [] } },
          label: { visible: false }
        } : { visible: true, line: { type: "rect" }, label: { visible: false } },
        yField: { visible: false }
      },
      tooltip: {
        visible: state.tooltipVisible, renderMode: "html", className: "playground-tooltip", parentElement: $("chart-slot"),
        offset: { x: state.tooltipOffsetX, y: state.tooltipOffsetY },
        mark: { content: [{ ...tooltipMarker(), key: datum => datum.series, value: datum => formatTooltipValue(datum.value) }] },
        dimension: { content: [{ ...tooltipMarker(), key: datum => datum.series, value: datum => formatTooltipValue(datum.value) }] },
        style: {
          panel: { backgroundColor: state.tooltipBackground,
            padding: { top: state.tooltipPaddingTop, right: state.tooltipPaddingRight, bottom: state.tooltipPaddingBottom, left: state.tooltipPaddingLeft },
            border: { color: state.tooltipBorderColor, width: state.tooltipBorderWidth, radius: state.tooltipRadius },
            shadow: { x: state.tooltipShadowX, y: state.tooltipShadowY, blur: state.tooltipShadowBlur, spread: state.tooltipShadowSpread, color: rgba(state.tooltipShadowColor, state.tooltipShadowOpacity) }
          },
          spaceRow: state.tooltipRowGap,
          shape: { size: tooltipMarker().shapeSize, spacing: state.tooltipShapeGap },
          titleLabel: tooltipText("Title"), keyLabel: tooltipText("Key"), valueLabel: tooltipText("Value")
        },
        updateElement: element => {
          tooltipElement = element;
          element.style.setProperty("--tooltip-content-row-height", px(Math.max(state.tooltipKeyLineHeight, state.tooltipValueLineHeight, tooltipMarker().shapeSize)));
          element.classList.toggle("playground-tooltip-focused", Boolean(selectedKey?.startsWith("tooltip")));
        }
      },
      line: { style: { lineWidth: state.lineWidth, strokeOpacity: state.lineOpacity, lineCap: state.lineCap, lineJoin: state.lineJoin,
        lineDash: state.lineDash === "dash" ? [state.lineDashLength, state.lineDashGap] : state.lineDash === "dot" ? [state.lineDotLength, state.lineDotGap] : [0, 0] } },
      point: {
        visible: state.pointVisible,
        style: { size: state.pointSize, symbolType: state.pointShape, fillOpacity: state.pointOpacity, stroke: state.pointStroke, lineWidth: state.pointStrokeWidth },
        ...(state.pointHoverVisible ? { state: { dimension_hover: { visible: true, size: state.pointHoverSize, symbolType: "circle", fillOpacity: 1, stroke: state.pointStroke, lineWidth: state.pointStrokeWidth } } } : {})
      },
      bar: { style: { cornerRadius: state.barRadius, fillOpacity: state.barOpacity } }, legends: []
    };
  }
  function renderChart() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      try {
        if (chart) chart.release();
        chart = null;
        tooltipElement = null;
        if ($("show-empty").checked) {
          $("chart-error").hidden = true;
          return;
        }
        if (!window.VChart?.VChart) throw new Error("VChart bundle is unavailable");
        if ($("vchart").clientHeight < 1) {
          chart = null;
          $("chart-error").textContent = "卡片空间不足，请增大卡片高度。";
          $("chart-error").hidden = false;
          return;
        }
        chart = new window.VChart.VChart(makeSpec(), { dom: $("vchart") });
        chart.renderSync();
        if ($("pin-tooltip").checked && state.tooltipVisible) {
          const datum = getValues().find(item => !hidden.has(item.series));
          if (datum) chart.showTooltip($("tooltip-kind").value === "dimension" ? { x: datum.x } : datum,
            { activeType: $("tooltip-kind").value, alwaysShow: true, x: Math.min($("vchart").clientWidth * 0.5, 260), y: 60 });
        }
        $("chart-error").hidden = true;
      } catch (error) {
        $("chart-error").hidden = false;
        console.error(error);
      }
    });
  }
  function updateSizingSummary() {
    const adaptive = state.chartHeightMode === "adaptive";
    const slotHeight = Math.round($("chart-slot").getBoundingClientRect().height * 10) / 10;
    const cardHeight = Math.round($("preview-card").getBoundingClientRect().height * 10) / 10;
    const legendHeight = Math.round($("preview-legend").getBoundingClientRect().height * 10) / 10;
    $("chartHeight").disabled = adaptive;
    $("cardHeight").disabled = !adaptive;
    $("chartHeight").value = adaptive ? slotHeight : state.chartHeight;
    const empty = $("show-empty").checked;
    const info = state.showSummary || state.showMoreInfo ? ` → 区域间距 ${state.headingInfoGap}${state.showSummary ? " → 总结" : ""}${state.showSummary && state.showMoreInfo ? ` → 行间距 ${state.headingInfoRowGap}` : ""}${state.showMoreInfo ? " → 更多信息" : ""}` : "";
    $("spacing-summary").textContent = `上内边距 ${state.paddingTop} → 标题区域整体（标题${info}${$("show-unit").checked ? ` → 内部间距 ${state.titleGap} → 单位` : ""}）→ 整体间距 ${state.headingGap} → ${empty ? "空态绘图区" : "绘图区"} ${slotHeight}${empty ? "" : ` → ${state.chartLegendGap} → 图例（实际 ${legendHeight}）`} → 下内边距 ${state.paddingBottom}`;
    $("height-summary").textContent = adaptive
      ? `自适应：卡片 ${cardHeight}px − 上下边框与内边距 − 标题区域整体高度（含可选总结、更多信息与单位）− 整体到绘图区间距${empty ? "" : " − 图例实际高度及间距"} = 绘图区 ${slotHeight}px。${slotHeight < 60 ? "可用空间较小，请增加卡片高度。" : ""}`
      : `固定：绘图区 ${slotHeight}px，卡片由内容自然撑高至 ${cardHeight}px。卡片高度设置在自适应模式下生效。`;
    $("config-output").value = JSON.stringify({ component: "AnalysisChart", units: "px (opacity: 0–1)", chartType: $("chart-type").value, showUnit: $("show-unit").checked, previewEmpty: empty, ...state, resolvedChartHeight: slotHeight }, null, 2);
  }
  function update() {
    const empty = $("show-empty").checked;
    $("vchart").hidden = empty;
    $("chart-empty").hidden = !empty;
    $("preview-legend").hidden = empty;
    $("pin-tooltip").disabled = empty;
    $("tooltip-kind").disabled = empty;
    Object.assign($("preview-card").style, {
      padding: `${px(state.paddingTop)} ${px(state.paddingRight)} ${px(state.paddingBottom)} ${px(state.paddingLeft)}`,
      borderWidth: px(state.borderWidth), borderRadius: px(state.borderRadius)
    });
    $("preview-card").style.backgroundColor = state.cardBackground;
    $("preview-card").style.borderColor = state.cardBorderColor;
    $("preview-card").classList.toggle("adaptive-height", state.chartHeightMode === "adaptive");
    $("preview-card").style.height = state.chartHeightMode === "adaptive" ? px(state.cardHeight) : "auto";
    const hasHeadingInfo = state.showSummary || state.showMoreInfo;
    $("preview-heading-info").hidden = !hasHeadingInfo;
    $("preview-summary").hidden = !state.showSummary;
    $("preview-more-info").hidden = !state.showMoreInfo;
    Object.assign($("preview-heading-info").style, { marginTop: px(state.headingInfoGap), gap: px(state.headingInfoRowGap), marginBottom: $("show-unit").checked ? px(state.titleGap) : "0px" });
    Object.assign($("preview-summary").style, { fontSize: px(state.summaryFontSize), lineHeight: px(state.summaryLineHeight), color: state.summaryColor });
    Object.assign($("preview-more-info").style, { gap: px(state.moreInfoGap) });
    $("preview-more-info").querySelectorAll("span").forEach(tag => Object.assign(tag.style, {
      fontSize: px(state.moreInfoFontSize), lineHeight: px(state.moreInfoLineHeight), minHeight: px(state.moreInfoLineHeight),
      padding: `0 ${px(state.moreInfoPaddingX)}`, borderRadius: px(state.moreInfoRadius),
      color: state.moreInfoColor, backgroundColor: state.moreInfoBackground
    }));
    Object.assign($("preview-title").style, { fontSize: px(state.titleFontSize), lineHeight: px(state.titleLineHeight), marginBottom: !hasHeadingInfo && $("show-unit").checked ? px(state.titleGap) : "0px" });
    Object.assign($("preview-unit").style, { display: $("show-unit").checked ? "block" : "none", fontSize: px(state.unitFontSize), lineHeight: px(state.unitLineHeight), marginBottom: "0px" });
    $("preview-heading").style.marginBottom = px(state.headingGap);
    Object.assign($("preview-title").style, { color: state.titleColor, fontWeight: state.titleWeight });
    $("preview-unit").style.color = state.unitColor;
    $("chart-slot").style.height = state.chartHeightMode === "adaptive" ? "0px" : px(state.chartHeight);
    Object.assign($("preview-legend").style, { marginTop: px(state.chartLegendGap), minHeight: px(state.legendMinHeight) });
    $("preview-legend").style.setProperty("--legend-align", { left: "flex-start", center: "center", right: "flex-end" }[state.legendAlign]);
    $("preview-legend").style.setProperty("--legend-column-gap", px(state.legendColumnGap));
    $("preview-legend").style.setProperty("--legend-row-gap", px(state.legendRowGap));
    $("preview-legend").style.setProperty("--legend-hover-background", state.legendHoverBackground);
    $("preview-legend").style.setProperty("--legend-hidden-opacity", state.legendHiddenOpacity);
    const legendVariables = {
      "line-height": px(state.legendLineHeight), "font-weight": state.legendFontWeight,
      "width": state.legendWidthMode === "fixed" ? px(state.legendFixedWidth) : "auto",
      "max-width": state.legendWidthMode === "fixed" ? "none" : px(state.legendMaxWidth), "button-radius": px(state.legendButtonRadius),
      "hover-color": state.legendHoverColor, "focus-color": state.legendFocusColor,
      "focus-width": px(state.legendFocusWidth), "focus-offset": px(state.legendFocusOffset),
      "action-gap": px(state.legendActionGap), "action-size": px(state.legendActionSize),
      "action-icon-size": px(state.legendActionIconSize), "action-color": state.legendActionColor,
      "action-background": state.legendActionBackground, "action-hover-color": state.legendActionHoverColor,
      "action-hover-background": state.legendActionHoverBackground, "action-radius": px(state.legendActionRadius),
      "hint-gap": px(state.legendHintGap), "hint-padding-x": px(state.legendHintPaddingX),
      "hint-padding-y": px(state.legendHintPaddingY), "hint-font-size": px(state.legendHintFontSize),
      "hint-line-height": px(state.legendHintLineHeight), "hint-color": state.legendHintColor,
      "hint-background": state.legendHintBackground, "hint-border-color": state.legendHintBorderColor,
      "hint-border-width": px(state.legendHintBorderWidth), "hint-radius": px(state.legendHintRadius),
      "hint-shadow": `${px(state.legendHintShadowX)} ${px(state.legendHintShadowY)} ${px(state.legendHintShadowBlur)} ${rgba(state.legendHintShadowColor, state.legendHintShadowOpacity)}`
    };
    Object.entries(legendVariables).forEach(([key, value]) => $("preview-legend").style.setProperty(`--legend-${key}`, value));
    $("preview-legend").classList.toggle("legend-action-always", state.legendActionVisibility === "always");
    $("preview-legend").classList.toggle("legend-hints-disabled", !state.legendHintVisible);
    $("preview-legend").querySelectorAll(".legend-isolate g").forEach(icon => icon.setAttribute("stroke-width", state.legendActionStrokeWidth));
    $("preview-legend").querySelectorAll(".legend-toggle").forEach(button => Object.assign(button.style, {
      fontSize: px(state.legendFontSize), color: state.legendColor, height: px(state.legendButtonHeight), padding: `0 ${px(state.legendButtonPadding)}`
    }));
    $("preview-legend").querySelectorAll(".legend-toggle").forEach(button => {
      button.disabled = !state.legendExclude;
      button.parentElement.dataset.hint = state.legendExclude ? (hidden.has(button.dataset.series) ? "点击恢复展示" : "点击排除展示") : button.dataset.series;
    });
    $("preview-legend").querySelectorAll(".legend-isolate").forEach(button => { button.hidden = !state.legendIsolate; });
    $("preview-legend").querySelectorAll("i").forEach((icon, index) => Object.assign(icon.style, {
      marginRight: px(state.legendMarkerGap),
      width: px(state.legendMarkerType === "dash" ? state.legendMarkerDashWidth : state.legendMarkerSize),
      height: px(state.legendMarkerType === "dash" ? state.legendMarkerDashWidth / 8 : state.legendMarkerSize),
      borderRadius: px(state.legendMarkerType === "dash" ? 0 : state.legendMarkerRadius),
      background: state.legendMarkerType === "dash"
        ? `repeating-linear-gradient(to right, ${getColors()[index]} 0%, ${getColors()[index]} 20%, transparent 20%, transparent 40%)`
        : getColors()[index]
    }));
    $("preview-card").classList.toggle("show-guides", $("show-guides").checked);
    paginateLegend();
    updateSizingSummary();
    highlightSelection();
    renderChart();
  }
  function renderLegend() {
    legendPage = 0;
    $("legend-list").replaceChildren();
    getSeries().forEach((name, index) => {
    const item = document.createElement("div");
    item.className = "legend-item";
    const toggleHint = document.createElement("span");
    toggleHint.className = "legend-hint";
    toggleHint.dataset.hint = "点击排除展示";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "legend-toggle";
    button.dataset.series = name;
    button.setAttribute("aria-label", `排除${name}`);
    button.setAttribute("aria-pressed", "true");
    const icon = document.createElement("i");
    icon.style.background = getColors()[index];
    icon.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "legend-label";
    label.textContent = name;
    label.title = name;
    button.append(icon, label);
    button.addEventListener("click", () => {
      if (hidden.has(name)) hidden.delete(name); else hidden.add(name);
      syncLegendState();
      renderChart();
    });
    button.setAttribute("aria-pressed", String(!hidden.has(name)));
    toggleHint.append(button);
    const isolateHint = document.createElement("span");
    isolateHint.className = "legend-hint";
    isolateHint.dataset.hint = "点击仅展示该指标";
    const isolate = document.createElement("button");
    isolate.type = "button";
    isolate.className = "legend-isolate";
    isolate.setAttribute("aria-label", `仅展示${name}`);
    isolate.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="5"/><path d="M10 13.25V15M13 10H15M5 10H6.75M10 6.75V5"/></g></svg>';
    isolate.addEventListener("click", () => {
      hidden.clear();
      getSeries().filter(series => series !== name).forEach(series => hidden.add(series));
      syncLegendState();
      renderChart();
    });
    isolateHint.append(isolate);
    item.append(toggleHint, isolateHint);
    $("legend-list").append(item);
    });
  }
  function paginateLegend() {
    if ($("show-empty").checked) return;
    const list = $("legend-list");
    const items = Array.from(list.children);
    items.forEach(item => { item.hidden = false; });
    list.style.height = "auto";
    $("legend-pager").hidden = true;
    const measureRows = () => {
      const rows = [];
      items.forEach(item => {
        const top = item.offsetTop;
        if (!rows.length || Math.abs(rows[rows.length - 1].top - top) > 1) rows.push({ top, items: [] });
        rows[rows.length - 1].items.push(item);
      });
      return rows;
    };
    let rows = measureRows();
    if (rows.length > state.legendMaxRows) {
      $("legend-pager").hidden = false;
      rows = measureRows();
    }
    legendPages = [];
    for (let index = 0; index < rows.length; index += state.legendMaxRows) {
      legendPages.push(rows.slice(index, index + state.legendMaxRows).flatMap(row => row.items));
    }
    legendPage = Math.min(legendPage, Math.max(0, legendPages.length - 1));
    if (legendPages.length > 1) {
      const rowHeight = Math.max(...items.map(item => item.getBoundingClientRect().height));
      list.style.height = px(state.legendMaxRows * rowHeight + (state.legendMaxRows - 1) * state.legendRowGap);
    }
    showLegendPage();
  }
  function showLegendPage() {
    const visible = new Set(legendPages[legendPage]);
    Array.from($("legend-list").children).forEach(item => { item.hidden = !visible.has(item); });
    $("legend-page-status").textContent = `${legendPage + 1}/${legendPages.length || 1}`;
    $("legend-prev").disabled = legendPage === 0;
    $("legend-next").disabled = legendPage >= legendPages.length - 1;
  }
  [["legend-prev", -1], ["legend-next", 1]].forEach(([id, delta]) => $(id).addEventListener("click", () => {
    legendPage = Math.max(0, Math.min(legendPages.length - 1, legendPage + delta));
    showLegendPage();
    updateSizingSummary();
    highlightSelection();
  }));
  function syncLegendState() {
    $("preview-legend").querySelectorAll(".legend-toggle").forEach(button => {
      const excluded = hidden.has(button.dataset.series);
      button.setAttribute("aria-pressed", String(!excluded));
      button.setAttribute("aria-label", `${excluded ? "恢复" : "排除"}${button.dataset.series}`);
      button.parentElement.dataset.hint = excluded ? "点击恢复展示" : "点击排除展示";
    });
  }
  renderLegend();
  fields.forEach(([key, , , min, max]) => {
    $(key).addEventListener("focus", () => {
      selectedKey = key;
      if (key.startsWith("tooltip") && state.tooltipVisible && !$("show-empty").checked) {
        $("pin-tooltip").checked = true;
        renderChart();
      }
      $("controls").querySelectorAll(".field").forEach(row => row.classList.toggle("selected", row.contains($(key))));
      highlightSelection();
    });
    $(key).addEventListener(typeof min === "string" ? "change" : "input", () => {
      if (min === "checkbox") state[key] = $(key).checked;
      else if (typeof min === "string") state[key] = $(key).value;
      else {
        const value = $(key).valueAsNumber;
        if (!Number.isFinite(value)) return;
        state[key] = Math.min(max, Math.max(min, value));
        if (key === "legendMaxRows") state[key] = Math.round(state[key]);
      }
      if (min === "color") $(key).title = state[key];
      update();
    });
    if (typeof min !== "string") $(key).addEventListener("change", () => { $(key).value = state[key]; });
  });
  ["chart-type", "show-unit", "show-empty", "show-guides", "pin-tooltip", "tooltip-kind"].forEach(id => $(id).addEventListener("change", update));
  $("series-count").addEventListener("change", () => { hidden.clear(); renderLegend(); update(); });
  $("field-search").addEventListener("input", () => {
    const query = $("field-search").value.trim().toLowerCase();
    $("controls").querySelectorAll("fieldset").forEach(group => {
      group.querySelectorAll(".field").forEach(row => {
        row.hidden = !`${group.querySelector("legend").textContent} ${row.textContent}`.toLowerCase().includes(query);
      });
      group.hidden = !Array.from(group.querySelectorAll(".field")).some(row => !row.hidden);
    });
  });
  $("reset").addEventListener("click", () => {
    selectedKey = null;
    $("controls").querySelectorAll(".selected").forEach(row => row.classList.remove("selected"));
    Object.assign(state, defaults);
    fields.forEach(([key, , , type]) => {
      if (type === "checkbox") $(key).checked = defaults[key]; else $(key).value = defaults[key];
      if (type === "color") $(key).title = defaults[key];
    });
    $("chart-type").value = savedDefaults.chartType || "line";
    $("show-unit").checked = savedDefaults.showUnit ?? true;
    $("show-empty").checked = savedDefaults.previewEmpty ?? false;
    $("show-guides").checked = false;
    $("pin-tooltip").checked = false;
    $("tooltip-kind").value = "mark";
    $("series-count").value = "3";
    hidden.clear();
    renderLegend();
    update();
    $("feedback").textContent = "已恢复你保存的默认初始值。";
  });
  $("copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("config-output").value);
      $("feedback").textContent = "配置已复制，可粘贴给我用于统一调整。";
    } catch {
      $("config-output").closest("details").open = true;
      $("config-output").focus();
      $("config-output").select();
      $("feedback").textContent = "请按 ⌘C / Ctrl+C 复制已选中的配置。";
    }
  });
  const sizingObserver = new ResizeObserver(() => {
    const width = $("preview-legend").getBoundingClientRect().width;
    if (width !== legendWidth) {
      legendWidth = width;
      paginateLegend();
      renderChart();
    }
    updateSizingSummary(); highlightSelection();
  });
  [$("preview-card"), $("preview-heading"), $("preview-heading-info"), $("chart-slot"), $("preview-legend")].forEach(element => sizingObserver.observe(element));
  update();
})();
