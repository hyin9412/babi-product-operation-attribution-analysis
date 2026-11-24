"""Verify named snapshots and concurrent topology comparisons using Python Playwright."""
import sys
from playwright.sync_api import sync_playwright, expect

url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5174"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.add_init_script("""localStorage.setItem('babi-topology-scheme-one-20261123', '1');
        localStorage.setItem('babi-topology-scheme-two-20261123', '1');
        localStorage.setItem('babi-topology-scheme-three-20261123', '1');""")
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"{url}/topology-playground.html")
    page.wait_for_load_state("networkidle")
    page.get_by_role("combobox", name="预览模型", exact=True).click()
    page.get_by_role("option", name="样式示例 · 全部节点类型", exact=True).click()
    editor = page.locator("#topology-editor-preview")
    choices = page.get_by_label("选择对比方案", exact=True)
    original = page.get_by_role("region", name="对比：原始样式", exact=True)
    expect(original.locator(".metric-topology-node-card").first).to_have_css("background-color", "rgb(255, 255, 255)")

    page.get_by_role("button", name="清透蓝紫", exact=True).click()
    page.get_by_role("button", name="保存方案", exact=True).click()
    expect(page.get_by_role("textbox", name="方案名称", exact=True)).to_have_value("方案一")
    page.get_by_role("button", name="保存", exact=True).click()
    first = page.get_by_role("region", name="对比：方案一", exact=True)
    expect(first).to_be_visible()
    expect(first.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(245, 248, 255)")

    # An edit must not silently overwrite the saved snapshot.
    page.get_by_role("textbox", name="画布背景色", exact=True).fill("#fff4dd")
    expect(page.get_by_text("调整尚未更新到已保存方案", exact=True)).to_be_visible()
    expect(first.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(245, 248, 255)")
    page.get_by_role("button", name="保存方案", exact=True).click()
    expect(page.get_by_role("textbox", name="方案名称", exact=True)).to_have_value("方案二")
    page.get_by_role("textbox", name="方案名称", exact=True).fill("方案一")
    page.get_by_role("button", name="保存", exact=True).click()
    expect(page.get_by_text("这个方案名称已存在，请换一个名称", exact=True)).to_be_visible()
    page.get_by_role("textbox", name="方案名称", exact=True).fill("   ")
    page.get_by_role("button", name="保存", exact=True).click()
    expect(page.get_by_text("请输入方案名称", exact=True)).to_be_visible()
    page.get_by_role("textbox", name="方案名称", exact=True).fill("方案二")
    page.get_by_role("button", name="保存", exact=True).click()
    second = page.get_by_role("region", name="对比：方案二", exact=True)
    expect(second.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(255, 244, 221)")
    expect(first.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(245, 248, 255)")
    expect(original.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(252, 253, 254)")
    page.locator(".arco-modal-mask").last.wait_for(state="hidden")
    page.locator(".playground-scheme-section").screenshot(path="/tmp/topology-schemes-comparison.png")

    # Arrowheads must belong to the matching SVG, and all compared views must move together.
    marker_ids = page.locator("svg marker").evaluate_all("(els) => els.map(el => el.id)")
    assert len(set(marker_ids)) == len(marker_ids)
    for region in [first, second, original]:
        own_id = region.locator("marker").get_attribute("id")
        assert region.locator(".formula-canvas-edge").first.get_attribute("marker-end") == f"url(#{own_id})"
    first.get_by_role("button", name="放大", exact=True).click()
    transform = first.locator(".topology-canvas-shell-svg > g").get_attribute("transform")
    for region in [second, original]:
        expect(region.locator(".topology-canvas-shell-svg > g")).to_have_attribute("transform", transform)
    box = first.locator(".topology-canvas-shell-svg").bounding_box()
    page.mouse.move(box["x"] + 20, box["y"] + 20)
    page.mouse.down()
    page.mouse.move(box["x"] + 70, box["y"] + 50)
    page.mouse.up()
    moved = first.locator(".topology-canvas-shell-svg > g").get_attribute("transform")
    assert moved != transform
    for region in [second, original]:
        expect(region.locator(".topology-canvas-shell-svg > g")).to_have_attribute("transform", moved)
    first.get_by_role("button", name="收起计算资源 · 测算单价下层节点", exact=True).click()
    for region in [first, second, original, editor]:
        expect(region.locator(".metric-topology-node")).to_have_count(1)
    editor.get_by_role("button", name="展开计算资源 · 测算单价下层节点", exact=True).click()
    for region in [first, second, original]:
        expect(region.locator(".metric-topology-node")).to_have_count(4)
    expect(original.locator(".metric-topology-node-name").first).to_have_css("font-size", "13px")

    # Selection and snapshot data survive refresh; an explicit update changes only that scheme.
    choices.get_by_text("方案一", exact=True).click()
    expect(first).to_have_count(0)
    page.reload()
    page.get_by_role("combobox", name="预览模型", exact=True).click()
    page.get_by_role("option", name="样式示例 · 全部节点类型", exact=True).click()
    expect(first).to_have_count(0)
    expect(second.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(255, 244, 221)")
    page.get_by_role("button", name="加载方案一", exact=True).click()
    expect(editor.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(245, 248, 255)")
    page.get_by_role("textbox", name="画布背景色", exact=True).fill("#abcdef")
    page.get_by_role("button", name="更新此方案", exact=True).click()
    choices.get_by_text("方案一", exact=True).click()
    expect(first.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(171, 205, 239)")
    expect(second.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(255, 244, 221)")
    page.get_by_role("button", name="重命名方案二", exact=True).click()
    page.get_by_role("textbox", name="方案名称", exact=True).fill("暖色方案")
    page.get_by_role("button", name="保存", exact=True).click()
    warm = page.get_by_role("region", name="对比：暖色方案", exact=True)
    expect(warm).to_have_count(1)
    page.get_by_role("button", name="删除暖色方案", exact=True).click()
    page.get_by_role("button", name="取消", exact=True).click()
    expect(warm).to_have_count(1)
    page.get_by_role("button", name="删除暖色方案", exact=True).click()
    page.get_by_role("button", name="删除", exact=True).click()
    expect(warm).to_have_count(0)
    choices.get_by_text("方案一", exact=True).click()
    choices.get_by_text("原始样式", exact=True).click()
    expect(page.get_by_text("勾选“原始样式”或已保存方案，在这里平铺对比。", exact=True)).to_be_visible()
    choices.get_by_text("当前调整", exact=True).click()
    choices.get_by_text("原始样式", exact=True).click()
    draft = page.get_by_role("region", name="对比：当前调整", exact=True)
    page.get_by_role("textbox", name="画布背景色", exact=True).fill("#ddeeff")
    expect(draft.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(221, 238, 255)")
    expect(original.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(252, 253, 254)")
    page.set_viewport_size({"width": 390, "height": 844})
    expect(draft.locator(".topology-canvas-shell-svg")).to_be_visible()
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    assert not errors, errors
    browser.close()
    print("PASS: named saves, name validation, immutable snapshots, CSS/marker isolation, linked viewports and expansion, persisted choices, load/update/rename/delete, draft comparison and mobile overflow")
