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
    guide.get_by_role("button", name="拓扑图", exact=True).click()
    topology_frame = guide.locator("#doc-panel-topology iframe")
    expect(topology_frame).to_be_visible()
    result.append("PASS: interaction guide and topology section")

    preview_url = urljoin(guide.url, topology_frame.get_attribute("src"))
    preview = context.new_page()
    observe(preview)
    preview.goto(preview_url)
    preview.wait_for_load_state("networkidle")
    expect(preview.locator(".metric-topology-node-card").first).to_be_visible()
    playground_link = preview.get_by_role("link", name="打开拓扑图样式 Playground →")
    expect(playground_link).to_be_visible()
    playground_link.click()
    preview.wait_for_load_state("networkidle")
    expect(preview.get_by_role("button", name="清透蓝紫", exact=True)).to_be_visible()
    preview.get_by_role("button", name="清透蓝紫", exact=True).click()
    expect(preview.locator(".topology-canvas-shell-svg")).to_have_css(
        "background-color", "rgb(245, 248, 255)")
    result.append("PASS: standalone topology preview and Playground interaction")

    assert not runtime_errors, runtime_errors
    assert not local_failures, local_failures
    result.append("PASS: no runtime errors or failed local resources")
    browser.close()

print(json.dumps(result, ensure_ascii=False, indent=2))
