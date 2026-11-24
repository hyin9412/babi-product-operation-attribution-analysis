"""Capture numbered regions from the real scheme-three node DOM."""
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright, expect

base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5174"
output = Path(__file__).resolve().parents[1] / "public/docs/topology-hover"
output.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1800, "height": 1200}, device_scale_factor=2)
    page.goto(f"{base}/topology-flow-preview.html?example=spacing")
    page.wait_for_load_state("networkidle")

    def scene(label):
        page.get_by_label("间距场景", exact=True).click()
        page.get_by_text(label, exact=True).click()
        expect(page.get_by_role("listbox")).to_be_hidden()

    def capture(name, selector, title, regions):
        expect(page.locator(selector).first).to_be_attached()
        page.evaluate("""({selector,title,regions}) => {
          document.querySelector('#hover-capture')?.remove();
          const source=document.querySelector(selector);
          const canvas=source.closest('.pricing-formula-flow');
          const panel=document.createElement('div');
          panel.id='hover-capture';
          panel.className=`analysis-page ${canvas.className}`;
          const panelWidth=Math.max(360,source.offsetWidth+80);
          panel.style.cssText=`position:relative;display:block;width:${panelWidth}px;min-height:0;max-height:none;padding:64px 40px 70px;background:#fcfdfe;margin:24px;box-sizing:border-box;`;
          const heading=document.createElement('div');
          heading.textContent=title;
          heading.style.cssText='position:absolute;top:14px;left:16px;right:16px;font:500 12px/18px Arial,"PingFang SC",sans-serif;color:#1d2129;';
          panel.append(heading);
          const clone=source.cloneNode(true);
          const scope=source.closest('.topology-playground-preview');
          if(scope?.id) {
            const wrapper=document.createElement('div');
            wrapper.id=scope.id;
            wrapper.append(clone);
            panel.append(wrapper);
          } else panel.append(clone);
          document.body.append(panel);
          const height=clone.getBoundingClientRect().height;
          panel.style.height=`${Math.max(300,height+150)}px`;
          const origin=panel.getBoundingClientRect();
          const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
          svg.setAttribute('width',panelWidth);svg.setAttribute('height',panel.offsetHeight);
          svg.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:visible;';
          panel.append(svg);
          for(const region of regions) {
            const node=region.selector==='self'?clone:clone.querySelector(region.selector);
            if(!node)throw new Error(`Missing region ${region.number}`);
            const rect=node.getBoundingClientRect();
            const y=rect.top-origin.top+rect.height/2;
            const left=region.side==='left';
            const bottom=region.side==='bottom';
            const x=left?rect.left-origin.left:rect.right-origin.left;
            const cx=bottom?rect.left-origin.left+rect.width/2:left?x-22:x+22;
            const cy=bottom?height+108:y;
            svg.insertAdjacentHTML('beforeend',`<rect x="${rect.left-origin.left}" y="${rect.top-origin.top}" width="${rect.width}" height="${rect.height}" rx="3" fill="none" stroke="#e53935" stroke-width="1.5"/><line x1="${bottom?cx:left?cx+12:cx-12}" y1="${bottom?cy-12:cy}" x2="${bottom?cx:x}" y2="${bottom?rect.bottom-origin.top:y}" stroke="#e53935" stroke-width="1.5"/><circle cx="${cx}" cy="${cy}" r="12" fill="#fff" stroke="#e53935" stroke-width="1.5"/><text x="${cx}" y="${cy+4}" text-anchor="middle" fill="#c62828" font-size="12" font-family="Arial,PingFang SC,sans-serif">${region.number}</text>`);
          }
        }""", {"selector": selector, "title": title, "regions": regions})
        page.locator("#hover-capture").screenshot(path=str(output / name))
        page.locator("#hover-capture").evaluate("el => el.remove()")

    scene("普通指标与运算符")
    page.get_by_label("目标行数", exact=True).click()
    page.get_by_text("3行目标值", exact=True).click()
    expect(page.get_by_role("listbox")).to_be_hidden()
    metric = ".pricing-formula-flow .metric-topology-node"
    capture("metric.png", metric, "指标节点 · 位置编号对应下方规则表", [
        {"number": 1, "selector": ".metric-topology-node-name", "label": "名称 · 手形", "side": "left"},
        {"number": 2, "selector": ".metric-topology-node-trend", "label": "月趋势图标 · 手形", "side": "right"},
        {"number": 3, "selector": ".metric-topology-node-formula-text", "label": "公式 · 截断时手形", "side": "left"},
        {"number": 4, "selector": ".metric-topology-node-actual", "label": "实际值、单位 · 箭头", "side": "left"},
        {"number": 5, "selector": ".metric-topology-node-target > span", "label": "目标名称、值 · 箭头", "side": "left"},
        {"number": 6, "selector": ".income-metric-formula-value", "label": "偏差数值 · 手形", "side": "right"},
        {"number": 8, "selector": ".metric-topology-node-toggle", "label": "展开、收起 · 手形", "side": "right"},
    ])
    scene("单指标函数")
    capture("function.png", ".function-topology-node", "函数节点 · 外层为默认箭头，内部指标沿用 1–8", [
        {"number": 9, "selector": ".function-topology-node-title", "label": "函数标题、外框 · 箭头", "side": "right"},
    ])
    scene("常量与括号表达式")
    capture("bracket.png", ".bracket-expression-node", "括号表达式 · 外层与内部节点分别响应", [
        {"number": 10, "selector": ".bracket-expression-node-title", "label": "括号标题、外框 · 箭头", "side": "right"},
        {"number": 11, "selector": ".calculation-operator-node", "label": "计算式子 · 箭头", "side": "bottom"},
        {"number": 12, "selector": ".constant-topology-node", "label": "常量 · 箭头", "side": "left"},
    ])
    page.goto(f"{base}/topology-flow-preview.html")
    page.wait_for_load_state("networkidle")
    page.locator(".topology-guide-model-select .arco-select").click()
    page.get_by_text("Bytegraph 计算层资源定价公式", exact=True).click()
    for _ in range(10):
        if page.locator(".metric-topology-node-details").count():
            break
        closed = page.locator(".metric-topology-node-toggle[aria-expanded=false]")
        if not closed.count():
            raise RuntimeError("No multi-row metric found")
        closed.first.dispatch_event("click")
    capture("details.png", ".metric-topology-node:has(.metric-topology-node-details)", "多行数据指标 · 明细入口", [
        {"number": 7, "selector": ".metric-topology-node-details", "label": "详细数据 · 整区手形", "side": "right"},
    ])
    browser.close()
    print(f"Generated annotated screenshots: {output}")
