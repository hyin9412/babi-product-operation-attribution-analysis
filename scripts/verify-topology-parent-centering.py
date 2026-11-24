"""Verify visible expression bounds stay centered under their actual parent."""
import json
import sys
from playwright.sync_api import sync_playwright, expect

base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5174"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1700, "height": 1100})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))

    def centered(canvas):
        data = canvas.evaluate("""root => {
          const edges=[...root.querySelectorAll('.formula-canvas-edge')];
          return [...root.querySelectorAll('.formula-expression-row')].map(row=>{
            const cells=[...row.querySelectorAll(':scope > .formula-expression-cell')];
            const first=cells.find(cell=>!cell.classList.contains('is-operator'));
            const edge=edges.find(edge=>edge.dataset.target===first?.dataset.nodeId);
            const parent=[...root.querySelectorAll('.metric-topology-node')].find(node=>node.dataset.nodeId===edge?.dataset.source);
            if(!parent)throw new Error('Missing parent for '+row.dataset.expressionId);
            const rect=parent.getBoundingClientRect(),boxes=cells.map(cell=>cell.getBoundingClientRect());
            const center=(Math.min(...boxes.map(box=>box.left))+Math.max(...boxes.map(box=>box.right)))/2;
            return {row:row.dataset.expressionId,parent:parent.getAttribute('aria-label'),offset:center-(rect.left+rect.width/2)};
          });
        }""")
        assert data
        assert all(abs(row["offset"]) < .15 for row in data), data
        return data

    page.goto(f"{base}/#/finance/sell/transparency")
    page.wait_for_load_state("networkidle")
    page.locator(".analysis-page-header").get_by_role("tab", name="成本定价", exact=True).click()
    canvas = page.locator(".pricing-formula-container .pricing-formula-flow")
    expect(canvas.locator(".metric-topology-node-card").first).to_be_visible()
    history = [centered(canvas)]
    for _ in range(15):
        closed = canvas.locator('.metric-topology-node-toggle[aria-expanded="false"]')
        if not closed.count():
            break
        closed.first.click()
        history.append(centered(canvas))
    canvas.screenshot(path="/tmp/topology-parent-centered.png")
    canvas.get_by_role("button", name="全屏", exact=True).click()
    fullscreen = page.locator(".pricing-formula-fullscreen-page .pricing-formula-flow")
    expect(fullscreen).to_be_visible()
    fullscreen.evaluate("async el => {for(let parent=el;parent;parent=parent.parentElement) await Promise.all(parent.getAnimations().map(a=>a.finished.catch(()=>{})));}")
    centered(fullscreen)
    fullscreen.get_by_role("button", name="退出全屏", exact=True).click()
    while canvas.locator('.metric-topology-node-toggle[aria-expanded="true"]').count() > 1:
        canvas.locator('.metric-topology-node-toggle[aria-expanded="true"]').last.click()
        centered(canvas)
    page.goto(f"{base}/topology-flow-preview.html?example=spacing")
    page.wait_for_load_state("networkidle")
    page.get_by_label("间距场景", exact=True).click()
    page.get_by_text("不同宽度子树展开", exact=True).click()
    expect(page.get_by_role("listbox")).to_be_hidden()
    centered(page.locator(".pricing-formula-flow"))
    expect(page.locator('[data-dimension="subtree-gap"]')).to_have_attribute("data-px", "80")
    assert not errors, errors
    print(json.dumps({"expanded_states": len(history), "final_rows": history[-1], "errors": errors}, ensure_ascii=False))
    browser.close()
