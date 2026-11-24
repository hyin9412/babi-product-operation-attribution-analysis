"""Verify scheme three in the analysis page and its fullscreen portal."""
import json
import sys
from playwright.sync_api import sync_playwright, expect

url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5174"

def check_canvas(canvas):
    expect(canvas.locator(".metric-topology-node-card").first).to_have_css("background-color", "rgb(235, 241, 255)")
    for card in canvas.locator(".metric-topology-node-card").all():
        expect(card).to_have_css("padding", "0px 2px 2px")
        expect(card).to_have_css("border-radius", "8px")
        expect(card).to_have_css("width", "278px")
        expect(card.locator(".metric-topology-node-body")).to_have_css("background-color", "rgb(255, 255, 255)")
        expect(card.locator(".metric-topology-node-actual strong")).to_have_css("font-size", "18px") if card.locator(".metric-topology-node-actual strong").count() else None
    for group in canvas.locator(".bracket-expression-node").all():
        expect(group).to_have_css("background-color", "rgb(228, 243, 252)")
        expect(group).to_have_css("border-width", "0px")
    positions = canvas.evaluate("""root => {
      const rows={};
      for(const row of root.querySelectorAll('.formula-expression-row')) {
        const data=rows[row.dataset.formulaLevel]??={metrics:[],operators:[]};
        for(const node of row.querySelectorAll('.metric-topology-node'))data.metrics.push(node.getBoundingClientRect().top);
        for(const node of row.querySelectorAll('.calculation-operator-node'))data.operators.push(node.querySelector('svg rect').getBoundingClientRect().top);
      }
      return rows;
    }""")
    for row in positions.values():
        for tops in row.values():
            assert not tops or max(tops) - min(tops) < .15, positions
    assert canvas.evaluate("""root => {
      const object=root.querySelector('.formula-canvas-nodes > foreignObject');
      return Number(object.getAttribute('height'))===object.querySelector('.metric-topology-node-card').offsetHeight;
    }""")
    return positions

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 1000})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"{url}/#/finance/sell/transparency")
    page.wait_for_load_state("networkidle")
    page.locator(".analysis-page-header").get_by_role("tab", name="成本定价", exact=True).click()
    canvas = page.locator(".pricing-formula-container .pricing-formula-flow")
    expect(canvas.locator(".metric-topology-node-card").first).to_be_visible()
    initial = check_canvas(canvas)
    # Expand every available parent in the actual CPU pricing model.
    for _ in range(10):
        closed = canvas.locator(".metric-topology-node-toggle[aria-expanded=false]")
        if not closed.count():
            break
        closed.first.click()
    expanded = check_canvas(canvas)
    assert len(expanded) >= 3, expanded
    expect(canvas.get_by_role("button", name="请点击查看详细数据").first).to_be_visible()
    canvas.get_by_role("button", name="全屏", exact=True).click()
    fullscreen = page.locator(".pricing-formula-fullscreen-page .pricing-formula-flow")
    expect(fullscreen).to_be_visible()
    check_canvas(fullscreen)
    fullscreen.screenshot(path="docs/topology-schemes/透明化分析-方案三.png")
    fullscreen.get_by_role("button", name="退出全屏", exact=True).click()
    expect(fullscreen).to_have_count(0)
    check_canvas(canvas)
    # Trend navigation keeps the same metric binding.
    canvas.locator(".metric-topology-node-trend").first.click()
    expect(page.locator("#pricing-metric-trend")).to_be_visible()
    canvas.locator(".metric-topology-node-toggle").first.click()
    expect(canvas.locator(".metric-topology-node-card")).to_have_count(1)
    page.reload()
    page.wait_for_load_state("networkidle")
    expect(page.locator(".analysis-page-header").get_by_role("tab", name="成本定价", exact=True)).to_have_attribute("aria-selected", "true")
    check_canvas(canvas)
    assert not errors, errors
    print(json.dumps({"initial": initial, "expanded": expanded, "errors": errors}, ensure_ascii=False))
    browser.close()
