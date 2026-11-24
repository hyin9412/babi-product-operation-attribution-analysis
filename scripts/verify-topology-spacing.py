"""Verify measured topology dimensions, scenario interactions and guide iframe."""
import json
import sys
from playwright.sync_api import sync_playwright, expect

base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5174"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1500, "height": 1100})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"{base}/topology-flow-preview.html?example=spacing")
    page.wait_for_load_state("networkidle")

    def dimension(name, value):
        expect(page.locator(f'[data-dimension="{name}"]')).to_have_attribute("data-px", f"{value:g}")

    def scene(label):
        page.get_by_label("间距场景", exact=True).click()
        page.get_by_text(label, exact=True).click()
        expect(page.get_by_role("listbox")).to_be_hidden()

    def overall_size():
        expect(page.get_by_role("heading", name="拓扑图整体尺寸", exact=True)).to_be_visible()
        for name in ["overall-width", "overall-height", "viewport-width", "viewport-height"]:
            expect(page.locator(f'[data-dimension="{name}"]')).to_be_visible()
        page.wait_for_function("""() => {
            const viewport = document.querySelector('.topology-canvas-shell-stage').getBoundingClientRect();
            const width = Number(document.querySelector('[data-dimension="viewport-width"]').dataset.px);
            const height = Number(document.querySelector('[data-dimension="viewport-height"]').dataset.px);
            return Math.abs(width - viewport.width) < .15 && Math.abs(height - viewport.height) < .15;
        }""")
        values = page.locator('[data-dimension^="overall-"]').evaluate_all(
            "items => Object.fromEntries(items.map(item => [item.dataset.dimension, Number(item.dataset.px)]))")
        assert all(value > 0 for value in values.values()), values
        assert values["overall-height"] == 48, values
        dimension("viewport-width", values["overall-width"])
        for name, label in {
            "overall-width": "页面内容区宽度", "overall-height": "48px",
            "viewport-width": "页面内容区宽度", "viewport-height": "屏幕高度 − 348px",
        }.items():
            expect(page.locator(f'[data-value-for="{name}"]')).to_have_text(label)
            expect(page.locator(f'[data-dimension="{name}"] text')).to_contain_text(label)
        return values

    dimension("subtree-gap", 80)
    expanded_size = overall_size()
    scene("普通指标与运算符")
    dimension("left-gap", 16)
    dimension("right-gap", 16)
    dimension("operand-gap", 64)
    dimension("level-gap", 80)
    dimension("toggle-extension", 14)
    dimension("toggle-gap", 66)
    dimension("title-formula", 14)
    ordinary_size = overall_size()
    assert ordinary_size == expanded_size
    page.get_by_role("button", name="放大", exact=True).click()
    dimension("operand-gap", 64)
    for name, value in ordinary_size.items():
        expect(page.locator(f'[data-dimension="{name}"]')).to_have_attribute("data-px", str(value))
    page.get_by_role("button", name="适配画布", exact=True).click()
    measurements = {}
    for label in ["单指标函数", "常量与括号表达式", "双层嵌套公式"]:
        scene(label)
        dimension("frame-inset", 2)
        dimension("panel-left", 8)
        dimension("panel-top", 6)
        overall_size()
        measurements[label] = page.locator("[data-dimension]").evaluate_all("items => Object.fromEntries(items.map(item => [item.dataset.dimension,Number(item.dataset.px)]))")
    for label in ["相邻兄弟子树展开", "不同宽度子树展开"]:
        scene(label)
        expect(page.locator("[data-subtree-box]")).to_have_count(2)
        expect(page.locator('[data-dimension="subtree-gap"]')).to_be_visible()
        value = float(page.locator('[data-dimension="subtree-gap"]').get_attribute("data-px"))
        assert value >= 80, value
        measurements[label] = value
        dimension("subtree-gap", 80)
        overall_size()
        page.get_by_role("button", name="放大", exact=True).click()
        dimension("subtree-gap", 80)
        page.get_by_role("button", name="适配画布", exact=True).click()
        label_box = page.locator('[data-dimension="subtree-gap"] rect').bounding_box()
        stage_box = page.locator(".topology-spacing-stage").bounding_box()
        assert label_box["y"] + label_box["height"] <= stage_box["y"] + stage_box["height"], "Subtree dimension label clipped"
        overall_label = page.locator('[data-dimension="overall-width"] rect').bounding_box()
        overlap_x = min(label_box["x"] + label_box["width"], overall_label["x"] + overall_label["width"]) - max(label_box["x"], overall_label["x"])
        overlap_y = min(label_box["y"] + label_box["height"], overall_label["y"] + overall_label["height"]) - max(label_box["y"], overall_label["y"])
        assert overlap_x <= 0 or overlap_y <= 0, "Overall and subtree labels overlap"
    page.screenshot(path="/tmp/topology-spacing-playground.png", full_page=True)
    page.get_by_role("button", name="收起下级", exact=True).click()
    expect(page.locator("[data-subtree-box]")).to_have_count(0)
    scene("普通指标与运算符")
    card = page.locator(".metric-topology-node-card").first
    height = card.evaluate("el => el.offsetHeight")
    page.get_by_label("目标行数", exact=True).click()
    page.get_by_text("3行目标值", exact=True).click()
    expect(card).to_have_css("height", f"{height + 48}px")
    dimension("level-gap", 80)
    dimension("operand-gap", 64)
    page.get_by_text("显示间距标注", exact=True).click()
    expect(page.locator("[data-dimension]")).to_have_count(0)
    page.get_by_text("显示间距标注", exact=True).click()
    dimension("operand-gap", 64)
    page.get_by_role("button", name="拓扑图容器宽度", exact=False).click()
    expect(page.locator('[data-dimension="overall-width"]')).to_have_class("is-active")
    expect(page.locator('[data-dimension="operand-gap"]')).to_have_class("is-muted")
    page.get_by_role("button", name="相邻表达式项之间", exact=False).click()
    expect(page.locator('[data-dimension="operand-gap"]')).to_have_class("is-active")
    expect(page.locator('[data-dimension="left-gap"]')).to_have_class("is-muted")
    page.set_viewport_size({"width": 740, "height": 1000})
    assert page.locator(".topology-spacing-layout").evaluate("el => getComputedStyle(el).gridTemplateColumns.split(' ').length") == 1
    dimension("operand-gap", 64)
    overall_size()
    page.goto(f"{base}/docs/operation-conclusion-card-guide-topology.html")
    page.wait_for_load_state("networkidle")
    page.get_by_role("tab", name="拓扑图", exact=True).click()
    expect(page.get_by_role("heading", name="拓扑图 Playground", exact=True)).to_be_visible()
    frame = page.frame_locator('iframe[title="拓扑图结构与间距交互示例"]')
    expect(frame.get_by_label("间距场景", exact=True)).to_be_visible()
    expect(frame.locator('[data-dimension="subtree-gap"]')).to_have_attribute("data-px", "80")
    assert not errors, errors
    print(json.dumps({"measurements": measurements, "errors": errors}, ensure_ascii=False))
    browser.close()
