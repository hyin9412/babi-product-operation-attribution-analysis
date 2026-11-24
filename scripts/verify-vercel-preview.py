"""Verify the published static application: python verify-vercel-preview.py <base-url>."""
import json
import os
import sys
from urllib.parse import urljoin, urlsplit

from playwright.sync_api import sync_playwright, expect

base = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:5182").rstrip("/")
local_failures = []
runtime_errors = []
result = []

with sync_playwright() as p:
    options = {"headless": True}
    if os.environ.get("CHROME_EXECUTABLE"):
        options["executable_path"] = os.environ["CHROME_EXECUTABLE"]
    browser = p.chromium.launch(**options)
    context = browser.new_context(viewport={"width": 1440, "height": 1000})

    # Internal configuration services may be unavailable on the public deployment.
    # The prototype must still render and support its local interactions.
    context.route("https://proxy-tcc*.bytedance.net/**", lambda route: route.abort())

    def observe(page):
        page.on("pageerror", lambda error: runtime_errors.append(str(error)))
        page.on("requestfailed", lambda request: local_failures.append(request.url)
                if urlsplit(request.url).netloc == urlsplit(base).netloc else None)
        page.on("response", lambda response: local_failures.append(
            f"{response.status} {response.url}")
            if response.status >= 400 and urlsplit(response.url).netloc == urlsplit(base).netloc
            else None)

    page = context.new_page()
    observe(page)
    page.goto(f"{base}/#/finance/sell/transparency")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_role("heading", name="透明化分析", exact=True)).to_be_visible()
    header = page.locator(".analysis-page-header")

    for name in ["商品概览", "收支分析", "成本定价"]:
        tab = header.get_by_role("tab", name=name, exact=True)
        tab.click()
        expect(tab).to_have_attribute("aria-selected", "true")
        expect(page.locator("canvas").first).to_be_visible()
        if name == "收支分析":
            expect(page.locator("table").first).to_be_visible()
        if name == "成本定价":
            expect(page.locator(".metric-topology-node-card").first).to_be_visible()
        result.append(f"PASS: {name}")

    page.reload()
    page.wait_for_load_state("networkidle")
    expect(header.get_by_role("tab", name="成本定价", exact=True)).to_have_attribute(
        "aria-selected", "true")
    expect(page.locator(".metric-topology-node-card").first).to_be_visible()
    result.append("PASS: refresh preserves tab and topology")

    guide_url = header.get_by_role("link", name="交互说明").get_attribute("href")
    guide = context.new_page()
    observe(guide)
    guide.goto(urljoin(base, guide_url))
    guide.wait_for_load_state("networkidle")
    expect(guide.get_by_role("heading", level=1)).to_be_visible()
    guide.get_by_role("tab", name="拓扑图", exact=True).click()
    topology_frame = guide.locator('#doc-panel-topology iframe[title="指标公式拓扑图交互预览"]')
    expect(topology_frame).to_be_visible()
    result.append("PASS: interaction guide and topology section")

    preview_url = urljoin(guide.url, topology_frame.get_attribute("src"))
    preview = context.new_page()
    observe(preview)
    preview.goto(preview_url)
    preview.wait_for_load_state("networkidle")
    expect(preview.locator(".metric-topology-node-card").first).to_be_visible()

    def check_model_style(canvas):
        cards = canvas.locator(".metric-topology-node-card")
        expect(cards.first).to_have_css("background-color", "rgb(235, 241, 255)")
        for card in cards.all():
            expect(card).to_have_css("padding", "0px 2px 2px")
            expect(card.locator(".metric-topology-node-header")).to_have_css("height", "34px")
            expect(card.locator(".metric-topology-node-body")).to_have_css("background-color", "rgb(255, 255, 255)")
        expect(canvas.locator(".metric-topology-node:not(.is-inset)")).to_have_count(0)
        expect(canvas.locator(".bracket-expression-node:not(.is-inset),.function-topology-node:not(.is-inset)")).to_have_count(0)
        assert canvas.evaluate("""root => [...root.querySelectorAll('.formula-canvas-nodes > foreignObject')].every(object => {
            const metric = object.querySelector(':scope > .metric-topology-node > .metric-topology-node-card');
            return !metric || Math.abs(Number(object.getAttribute('height')) - metric.offsetHeight) < .1;
        })"""), "Model card geometry differs from canvas"

    model_select = preview.locator(".topology-guide-model-select .arco-select")
    for index, model_name in enumerate(["RocketMQ 商品定价模型 · v1", "Bytegraph 计算层资源定价公式", "RocketMQ 商品定价模型 · v1"]):
        if index:
            model_select.click()
            rocket_option = preview.locator(".arco-select-popup .topology-guide-model-option").filter(has_text="RocketMQ")
            expect(rocket_option.get_by_text("含函数节点", exact=True)).to_be_visible()
            preview.get_by_text(model_name, exact=True).click()
        if model_name.startswith("RocketMQ"):
            expect(model_select.get_by_text("含函数节点", exact=True)).to_be_visible()
        else:
            expect(model_select.get_by_text("含函数节点", exact=True)).to_have_count(0)
        canvas = preview.locator(".pricing-formula-flow")
        check_model_style(canvas)
        if model_name.startswith("RocketMQ"):
            preview.screenshot(path="/tmp/topology-guide-rocketmq-scheme-three.png", full_page=True)
        for _ in range(3):
            closed = canvas.locator(".metric-topology-node-toggle[aria-expanded=false]")
            if not closed.count():
                break
            closed.first.dispatch_event("click")
        check_model_style(canvas)
        canvas.get_by_role("button", name="全屏", exact=True).click()
        fullscreen = preview.locator(".pricing-formula-fullscreen-page .pricing-formula-flow")
        expect(fullscreen).to_be_visible()
        check_model_style(fullscreen)
        fullscreen.get_by_role("button", name="退出全屏", exact=True).click()
        check_model_style(canvas)
        result.append(f"PASS: {model_name} uses scheme three on expansion and fullscreen")

    playground_link = guide.get_by_role("link", name="打开拓扑图样式 Playground →")
    expect(playground_link).to_be_visible()
    title_box = guide.locator("#topology-flow-title").bounding_box()
    link_box = playground_link.bounding_box()
    heading_box = guide.locator(".topology-model-heading").bounding_box()
    assert abs(title_box["y"] + title_box["height"] / 2 - link_box["y"] - link_box["height"] / 2) < 1
    assert abs(link_box["x"] + link_box["width"] - heading_box["x"] - heading_box["width"]) < 1
    with guide.expect_popup() as popup:
        playground_link.click()
    preview = popup.value
    observe(preview)
    preview.wait_for_load_state("networkidle")
    expect(preview.get_by_role("button", name="清透蓝紫", exact=True)).to_be_visible()
    preview.get_by_role("button", name="清透蓝紫", exact=True).click()
    expect(preview.locator("#topology-editor-preview .topology-canvas-shell-svg")).to_have_css(
        "background-color", "rgb(245, 248, 255)")
    result.append("PASS: standalone topology preview and Playground interaction")

    assert not runtime_errors, runtime_errors
    assert not local_failures, local_failures
    result.append("PASS: no runtime errors or failed local resources")
    browser.close()

print(json.dumps(result, ensure_ascii=False, indent=2))
