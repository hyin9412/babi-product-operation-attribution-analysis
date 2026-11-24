"""Verify the default mock graph includes all requested node and function variants."""
import sys
from playwright.sync_api import sync_playwright, expect

url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5174"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 1000})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"{url}/topology-playground.html")
    page.wait_for_load_state("networkidle")
    editor = page.locator("#topology-editor-preview")
    expect(page.get_by_role("combobox", name="预览模型", exact=True)).to_contain_text("综合样式示例")
    expect(editor.locator(".metric-topology-node")).to_have_count(6)
    ordinary = editor.get_by_role("article", name="基础单位成本", exact=True)
    assert ordinary.evaluate("(el) => !el.closest('.function-topology-node')")
    single = editor.locator(".function-topology-node.is-metric")
    expect(single).to_have_count(1)
    expect(single).to_have_attribute("aria-label", "MAX 函数")
    expect(single.locator(".metric-topology-node")).to_have_count(1)
    formula = editor.locator(".function-topology-node.is-formula")
    expect(formula).to_have_count(1)
    expect(formula).to_have_attribute("aria-label", "SUM 函数")
    expect(formula.locator(".metric-topology-node")).to_have_count(3)
    expect(formula.locator(".bracket-expression-node")).to_have_count(2)
    expect(formula.locator(".constant-topology-node")).to_have_count(1)
    assert formula.locator(".calculation-operator-node").count() >= 3
    root = editor.get_by_role("article", name="计算资源 · 测算单价", exact=True)
    expect(root.locator(".metric-topology-node-actual strong")).to_contain_text("0.04272")
    assert editor.locator(".is-positive").count() > 0
    assert editor.locator(".is-negative").count() > 0
    page.get_by_role("button", name="保存方案", exact=True).click()
    page.get_by_role("textbox", name="方案名称", exact=True).fill("综合样式方案")
    page.get_by_role("button", name="保存", exact=True).click()
    saved = page.get_by_role("region", name="对比：综合样式方案", exact=True)
    expect(saved.locator(".function-topology-node.is-metric")).to_have_count(1)
    expect(saved.locator(".function-topology-node.is-formula")).to_have_count(1)
    expect(saved.locator(".metric-topology-node")).to_have_count(6)
    page.locator(".arco-modal-mask").last.wait_for(state="hidden")
    editor.screenshot(path="/tmp/topology-showcase-preview.png")
    root.get_by_role("button", name="收起计算资源 · 测算单价下层节点", exact=True).click()
    expect(editor.locator(".metric-topology-node")).to_have_count(1)
    expect(saved.locator(".metric-topology-node")).to_have_count(1)
    root.get_by_role("button", name="展开计算资源 · 测算单价下层节点", exact=True).click()
    expect(saved.locator(".metric-topology-node")).to_have_count(6)
    original = page.get_by_role("region", name="对比：原始样式", exact=True)
    two = page.get_by_role("region", name="对比：方案二", exact=True)
    regions = [editor, saved, original, two]
    # Operate from the comparison itself: ordinary cards, function cards and bracket cards.
    for index, title in enumerate(["基础单位成本", "附加单位成本", "CPU单位成本", "内存单位成本", "策略加成"]):
        saved.get_by_role("button", name=f"展开{title}下层节点", exact=True).click()
        for region in regions:
            expect(region.locator(".metric-topology-node")).to_have_count(8 + index * 2)
            expect(region.get_by_role("button", name=f"收起{title}下层节点", exact=True)).to_have_attribute("aria-expanded", "true")
    # Collapsing one nested card must keep its sibling branches open.
    two.get_by_role("button", name="收起CPU单位成本下层节点", exact=True).click()
    for region in regions:
        expect(region.locator(".metric-topology-node")).to_have_count(14)
        expect(region.get_by_role("button", name="收起附加单位成本下层节点", exact=True)).to_have_count(1)
    page.get_by_role("button", name="对比图收起下层", exact=True).click()
    for region in regions:
        expect(region.locator(".metric-topology-node")).to_have_count(6)
    page.get_by_role("button", name="对比图全部展开", exact=True).click()
    for region in regions:
        expect(region.locator(".metric-topology-node")).to_have_count(16)
        # Leaf data is terminal, so it must not display a nonfunctional toggle.
        expect(region.get_by_role("article", name="CPU资源成本", exact=True).locator(".metric-topology-node-toggle")).to_have_count(0)
    two.get_by_role("button", name="收起计算资源 · 测算单价下层节点", exact=True).click()
    for region in regions:
        expect(region.locator(".metric-topology-node")).to_have_count(1)
    original.get_by_role("button", name="展开计算资源 · 测算单价下层节点", exact=True).click()
    for region in regions:
        expect(region.locator(".metric-topology-node")).to_have_count(16)
    page.locator(".playground-scheme-section").screenshot(path="/tmp/topology-comparison-expanded.png")
    assert not errors, errors
    browser.close()
    print("PASS: default mock, function variants, comparison node toggles, independent branches, linked schemes, batch expand/collapse and leaf behavior")
