"""Verify the published guide uses real vertical Tabs and preserves section switching."""
import json
import sys
from playwright.sync_api import sync_playwright, expect

base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4188"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1500, "height": 1000})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("response", lambda response: errors.append(f"{response.status}: {response.url}")
            if response.status >= 400 else None)
    page.goto(f"{base}/docs/operation-conclusion-card-guide-topology.html")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_title("透明化分析页面交互说明")
    expect(page.locator("h1")).to_have_text("透明化分析页面交互说明")
    expect(page.locator(".subtitle")).to_have_text("用于给产研团队枚举不同的交互细节，前端实现的一些规则")
    expect(page.locator(".doc-nav .arco-tabs-left")).to_be_visible()
    sections = [
        ("商品经营结论卡片", "conclusion"),
        ("表格", "table"), ("图表", "chart"),
        ("拓扑图", "topology"), ("全局筛选", "filter"),
    ]
    for title, key in sections:
        tab = page.get_by_role("tab", name=title, exact=True)
        tab.click()
        expect(tab).to_have_attribute("aria-selected", "true")
        expect(page.locator(".doc-panel.active")).to_have_count(1)
        expect(page.locator(f"#doc-panel-{key}")).to_be_visible()
        if key != "conclusion":
            assert page.url.endswith(f"#{key}"), page.url
    page.get_by_role("tab", name="拓扑图", exact=True).click()
    page.reload()
    page.wait_for_load_state("networkidle")
    expect(page.get_by_role("tab", name="拓扑图", exact=True)).to_have_attribute("aria-selected", "true")
    expect(page.locator("#doc-panel-topology")).to_be_visible()
    def expect_aligned_indicator():
        page.wait_for_function("""() => {
            const nav = document.querySelector('.doc-nav .arco-tabs-header-nav');
            const ink = nav.querySelector('.arco-tabs-header-ink');
            return Math.abs(nav.getBoundingClientRect().right - ink.getBoundingClientRect().right) <= 0.5;
        }""")
    expect_aligned_indicator()
    frame = page.frame_locator('iframe[title="拓扑图结构与间距交互示例"]')
    expect(frame.get_by_label("间距场景", exact=True)).to_be_visible()
    def expect_content_height(title="拓扑图结构与间距交互示例", selector=".topology-spacing-preview"):
        page.wait_for_function("""({title, selector}) => {
            const frame = document.querySelector(`iframe[title="${title}"]`);
            const content = frame.contentDocument?.querySelector(selector);
            return content && content.getBoundingClientRect().height > 0
                && Math.abs(frame.getBoundingClientRect().height - content.getBoundingClientRect().height) <= 1;
        }""", arg={"title": title, "selector": selector})
    expect_content_height()
    expect_content_height("指标公式拓扑图交互预览", ".topology-guide-preview")
    model_frame = page.frame_locator('iframe[title="指标公式拓扑图交互预览"]')
    expect(model_frame.locator(".topology-canvas-shell")).to_have_css("height", "460px")
    expect(model_frame.locator(".metric-topology-node").first).to_be_visible()
    expect_aligned_indicator()
    page.screenshot(path="/tmp/interaction-guide-desktop.png")
    page.set_viewport_size({"width": 680, "height": 1000})
    expect(page.get_by_role("tab", name="拓扑图", exact=True)).to_be_visible()
    assert page.locator(".doc-layout").evaluate(
        "el => getComputedStyle(el).gridTemplateColumns.split(' ').length") == 1
    expect_content_height()
    expect_content_height("指标公式拓扑图交互预览", ".topology-guide-preview")
    page.get_by_role("tab", name="表格", exact=True).click()
    expect(page.get_by_role("tab", name="表格", exact=True)).to_have_attribute("aria-selected", "true")
    expect(page.locator(".doc-nav .arco-tabs-header-title-active")).to_have_text("表格")
    expect(page.locator("#doc-panel-table")).to_be_visible()
    page.screenshot(path="/tmp/interaction-guide-mobile.png")
    assert not errors, errors
    print(json.dumps({"sections": len(sections), "refresh": "passed",
                      "mobile": "passed", "errors": errors}, ensure_ascii=False))
    browser.close()
