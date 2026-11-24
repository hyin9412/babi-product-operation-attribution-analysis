"""Verify inset layers, recursive alignment, graph anchors and saved snapshots."""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5174"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1800, "height": 1100})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"{url}/topology-playground.html")
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="加载方案三", exact=True).click()
    editor = page.locator("#topology-editor-preview")
    expect(editor.locator(".metric-topology-node-card").first).to_have_css("background-color", "rgb(235, 241, 255)")
    for card in editor.locator(".metric-topology-node-card").all():
        expect(card).to_have_css("padding", "0px 2px 2px")
        expect(card).to_have_css("border-width", "0px")
        expect(card.locator(".metric-topology-node-body")).to_have_css("background-color", "rgb(255, 255, 255)")
        assert card.locator(".metric-topology-node-header").evaluate("el => el.offsetHeight") == 32
    for selector, color in [
        (".function-topology-node", "rgb(242, 234, 251)"),
        (".bracket-expression-node", "rgb(228, 243, 252)"),
    ]:
        assert editor.locator(selector).count()
        for group in editor.locator(selector).all():
            expect(group).to_have_css("background-color", color)
            expect(group).to_have_css("padding", "34px 2px 2px")
            expect(group).to_have_css("border-width", "0px")
            expect(group.locator(":scope > div")).to_have_css("background-color", "rgb(255, 255, 255)")
            assert group.evaluate("""el => {
              const content=el.querySelector(':scope > div');
              return el.offsetWidth===content.offsetWidth+4 && el.offsetHeight===content.offsetHeight+36;
            }""")
    assert editor.evaluate("""root => [...root.querySelectorAll('.formula-expression-cell')].every(cell=>{
      const node=cell.firstElementChild;
      return Math.abs(cell.offsetWidth-node.offsetWidth)<1 && Math.abs(cell.offsetHeight-node.offsetHeight)<1;
    })""")
    for group in editor.locator(".bracket-expression-node").all():
        centers = group.evaluate("""el => {
          const panel=el.querySelector(':scope > .bracket-expression-node-items');
          const scale=el.getBoundingClientRect().width/el.offsetWidth;
          return [...panel.children].map(item=>{
            const r=item.firstElementChild.getBoundingClientRect();
            return (r.top+r.height/2)/scale;
          });
        }""")
        assert max(centers) - min(centers) < .1, centers
    for operator in editor.locator(".calculation-operator-node").all():
        assert operator.evaluate("el => el.offsetWidth") == 32
        assert operator.locator("svg rect").first.evaluate("""el => {
          const probe=document.createElement('span');probe.style.color='var(--color-bg-4)';
          el.parentElement.append(probe);
          const expected=getComputedStyle(probe).color;probe.remove();
          return getComputedStyle(el).fill===expected;
        }""")
    page.screenshot(path="/tmp/topology-scheme-three.png", full_page=True)
    page.get_by_label("预览模型", exact=True).click()
    page.get_by_text("嵌套对齐示例 · 括号与直接指标", exact=True).click()
    function = editor.locator(".function-topology-node.is-formula").first
    positions = function.evaluate("""el => {
      const panel=el.querySelector(':scope > .function-topology-node-items');
      const expression=panel.querySelector(':scope > .is-expression .bracket-expression-node');
      const metric=panel.querySelector(':scope > .is-metric .metric-topology-node');
      const nested=expression.querySelector('.metric-topology-node');
      const operator=panel.querySelector(':scope > .is-operator .calculation-operator-node');
      const inside=expression.querySelector('.calculation-operator-node');
      return [metric.getBoundingClientRect().top-nested.getBoundingClientRect().top,
        operator.getBoundingClientRect().top-inside.getBoundingClientRect().top];
    }""")
    assert all(abs(delta) < .1 for delta in positions), positions
    editor.get_by_text("指标公式", exact=True).click()
    page.screenshot(path="/tmp/topology-scheme-three-alignment.png", full_page=True)
    editor.screenshot(path="docs/topology-schemes/方案三-嵌套对齐.png")
    page.get_by_role("button", name="全部展开", exact=True).click()
    assert editor.locator(".metric-topology-node-toggle[aria-expanded=true]").count() >= 6
    overlaps = editor.evaluate("""root => {
      const cards=[...root.querySelectorAll('.metric-topology-node')];
      return cards.flatMap((card,index)=>{
        const a=card.getBoundingClientRect();
        return cards.slice(index+1).filter(other=>{
          const b=other.getBoundingClientRect();
          return Math.min(a.right,b.right)-Math.max(a.left,b.left)>1 &&
            Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
        }).map(other=>[card.getAttribute('aria-label'),other.getAttribute('aria-label')]);
      });
    }""")
    assert not overlaps, overlaps
    assert editor.evaluate("""root => [...root.querySelectorAll('.formula-canvas-edge')].every(edge=>{
      const handle=root.querySelector('[data-nodeid="'+edge.dataset.source+'"][data-handleid="bottom"]');
      if(!handle)return false;
      const point=edge.getPointAtLength(0);
      const screen=new DOMPoint(point.x,point.y).matrixTransform(edge.getScreenCTM());
      const r=handle.getBoundingClientRect();
      return Math.abs(screen.x-r.left-r.width/2)<.2 && Math.abs(screen.y-r.top-r.height/2)<.2;
    })""")
    assert editor.evaluate("""root => [...root.querySelectorAll('.formula-expression-cell > section')].every(group=>{
      const edge=[...root.querySelectorAll('.formula-canvas-edge')].find(edge=>edge.dataset.target===group.dataset.nodeId);
      const handle=group.querySelector(':scope > [data-handleid="group-target"]');
      if(!edge||!handle)return false;
      const point=edge.getPointAtLength(edge.getTotalLength());
      const screen=new DOMPoint(point.x,point.y).matrixTransform(edge.getScreenCTM());
      const r=handle.getBoundingClientRect();
      return Math.abs(screen.x-r.x)<.2 && Math.abs(screen.y-r.y)<.2;
    })""")
    editor.locator(".metric-topology-node-toggle").first.click()
    expect(editor.locator(".metric-topology-node-card")).to_have_count(1)
    expect(page.get_by_role("region", name="对比：方案三", exact=True).locator(".metric-topology-node-card")).to_have_count(1)
    page.reload()
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="加载方案三", exact=True).click()
    expect(editor.locator(".metric-topology-node-body").first).to_have_css("background-color", "rgb(255, 255, 255)")
    page.get_by_role("button", name="指标卡片", exact=False).click()
    radius = page.get_by_role("spinbutton", name="指标卡片圆角", exact=True)
    radius.fill("9")
    radius.blur()
    page.get_by_role("button", name="更新此方案", exact=True).click()
    page.reload()
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="加载方案三", exact=True).click()
    expect(editor.locator(".metric-topology-node-card").first).to_have_css("border-radius", "9px")
    page.get_by_role("button", name="指标卡片", exact=False).click()
    radius.fill("8")
    radius.blur()
    page.get_by_role("button", name="更新此方案", exact=True).click()
    library = json.loads(page.evaluate("localStorage.getItem('babi-topology-playground-schemes-v1')"))
    styles = {scheme["name"]: scheme["style"] for scheme in library["schemes"]}
    assert styles["方案二"]["function"]["appearance"] == "folder"
    assert styles["方案三"]["function"]["appearance"] == "inset"
    assert styles["方案一"]["metric"]["appearance"] == "classic"
    output = Path("docs/topology-schemes/方案三.json")
    with page.expect_download() as download:
        page.get_by_role("button", name="导出配置", exact=True).click()
    download.value.save_as(str(output))
    assert json.loads(output.read_text()) == styles["方案三"]
    editor.screenshot(path="docs/topology-schemes/方案三.png")
    assert not errors, errors
    print(json.dumps({"alignment_delta": positions, "export": str(output), "errors": errors}, ensure_ascii=False))
    browser.close()
