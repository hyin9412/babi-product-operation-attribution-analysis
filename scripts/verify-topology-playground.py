"""Run with a running Vite server and Python Playwright + Chromium installed."""
import json
import sys
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5174"
with sync_playwright() as p, tempfile.TemporaryDirectory() as temp:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"{url}/topology-playground.html")
    page.wait_for_load_state("networkidle")
    page.get_by_role("combobox", name="预览模型", exact=True).click()
    page.get_by_role("option", name="样式示例 · 全部节点类型", exact=True).click()
    expect(page.get_by_role("button", name="清透蓝紫", exact=True)).to_be_visible()
    expect(page.locator(".vod-pageHeader-heading-title")).to_have_css("font-size", "18px")
    expect(page.locator(".vod-pageHeader-heading")).to_have_css("display", "flex")
    page.get_by_role("button", name="清透蓝紫", exact=True).click()
    canvas = page.locator("#topology-editor-preview .topology-canvas-shell-svg")
    expect(canvas).to_have_css("background-color", "rgb(245, 248, 255)")
    viewport = canvas.locator(":scope > g")
    original_viewport = viewport.get_attribute("transform")
    page.get_by_role("textbox", name="画布背景色", exact=True).fill("#abcdef")
    expect(canvas).to_have_css("background-color", "rgb(171, 205, 239)")
    assert viewport.get_attribute("transform") == original_viewport
    page.reload()
    expect(canvas).to_have_css("background-color", "rgb(171, 205, 239)")

    page.get_by_role("button", name="▤ 指标卡片", exact=True).click()
    page.get_by_role("textbox", name="指标卡片背景颜色", exact=True).fill("#fff4dd")
    page.get_by_role("textbox", name="指标卡片描边颜色", exact=True).fill("#ff9900")
    page.get_by_role("spinbutton", name="指标名称字号", exact=True).fill("18")
    page.get_by_role("spinbutton", name="指标名称字号", exact=True).press("Tab")
    card = page.locator(".metric-topology-node-card").first
    expect(card).to_have_css("background-color", "rgb(255, 244, 221)")
    expect(card).to_have_css("border-color", "rgb(255, 153, 0)")
    expect(page.locator(".metric-topology-node-name").first).to_have_css("font-size", "18px")
    page.get_by_role("switch", name="对照原始", exact=True).click()
    expect(card).to_have_css("background-color", "rgb(255, 255, 255)")
    page.get_by_role("switch", name="对照原始", exact=True).click()
    expect(card).to_have_css("background-color", "rgb(255, 244, 221)")

    # Export the actual edited configuration, then restore it through the file input.
    with page.expect_download() as pending:
        page.get_by_role("button", name="导出配置", exact=True).click()
    config_path = Path(temp) / "style.json"
    pending.value.save_as(config_path)
    exported = json.loads(config_path.read_text())
    assert exported["metric"]["text"]["size"] == 18
    assert exported["canvas"]["background"] == "#abcdef"
    page.get_by_role("button", name="恢复原始", exact=True).click()
    expect(card).to_have_css("background-color", "rgb(255, 255, 255)")
    page.locator('input[type="file"]').set_input_files(config_path)
    expect(card).to_have_css("background-color", "rgb(255, 244, 221)")
    expect(canvas).to_have_css("background-color", "rgb(171, 205, 239)")
    invalid = Path(temp) / "invalid.json"
    exported["metric"]["text"]["font"] = "invalid;font-family:injected"
    invalid.write_text(json.dumps(exported))
    page.locator('input[type="file"]').set_input_files(invalid)
    expect(page.get_by_text("配置值无效：metric.text.font", exact=True)).to_be_visible()
    expect(card).to_have_css("background-color", "rgb(255, 244, 221)")
    with page.expect_download() as pending:
        page.get_by_role("button", name="导出 CSS", exact=True).click()
    css_path = Path(temp) / "style.css"
    pending.value.save_as(css_path)
    assert ".topology-playground-preview" in css_path.read_text()
    assert "#ff9900" in css_path.read_text()

    page.get_by_role("button", name="◌ 画布与连线", exact=True).click()
    page.get_by_role("combobox", name="画布网格", exact=True).click()
    page.get_by_role("option", name="线条网格", exact=True).click()
    assert "linear-gradient" in canvas.evaluate("(el) => getComputedStyle(el).backgroundImage")
    page.get_by_role("switch", name="使用虚线", exact=True).click()
    expect(page.locator(".formula-canvas-edge").first).to_have_css("stroke-dasharray", "6px, 4px")
    before_zoom = viewport.get_attribute("transform")
    page.locator("#topology-editor-preview").get_by_role("button", name="放大", exact=True).click()
    assert viewport.get_attribute("transform") != before_zoom

    # The original model still supports expansion and the original preview stays unstyled.
    page.get_by_role("combobox", name="预览模型", exact=True).click()
    page.get_by_role("option", name="RocketMQ · 原模型", exact=True).click()
    expect(page.locator("#topology-editor-preview .metric-topology-node")).to_have_count(3)
    page.get_by_role("button", name="全部展开", exact=True).click()
    assert page.locator("#topology-editor-preview .metric-topology-node").count() > 20
    page.get_by_role("button", name="收起下层", exact=True).click()
    expect(page.locator("#topology-editor-preview .metric-topology-node")).to_have_count(3)
    page.get_by_role("button", name="清透蓝紫", exact=True).click()
    page.get_by_role("combobox", name="预览模型", exact=True).click()
    page.get_by_role("option", name="样式示例 · 全部节点类型", exact=True).click()
    page.set_viewport_size({"width": 390, "height": 844})
    expect(canvas).to_be_visible()
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    page.set_viewport_size({"width": 1440, "height": 1000})
    page.screenshot(path=str(Path(temp) / "playground.png"), full_page=True)
    page.goto(f"{url}/topology-flow-preview.html")
    page.wait_for_load_state("networkidle")
    expect(page.locator(".metric-topology-node-card").first).to_have_css("border-color", "rgb(221, 226, 233)")
    assert not errors, errors
    browser.close()
    print("PASS: live controls, viewport stability, persistence, comparison, JSON/CSS export, valid/invalid import, grid, zoom, model expansion, mobile layout, and original preview isolation")
