"""Verify the published filter guide: python verify-filter-guide.py <static-base-url>."""
import json
import os
import re
import sys
from playwright.sync_api import sync_playwright, expect

base = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8080").rstrip("/")
errors = []
with sync_playwright() as p:
    options = {"headless": True}
    if os.environ.get("CHROME_EXECUTABLE"):
        options["executable_path"] = os.environ["CHROME_EXECUTABLE"]
    browser = p.chromium.launch(**options)
    page = browser.new_page(viewport={"width": 1000, "height": 1000})
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"{base}/docs/operation-conclusion-card-guide-topology.html#filter")
    expect(page.locator("#doc-panel-filter")).to_be_visible()
    expect(page.locator("#doc-panel-filter iframe")).to_be_visible()
    for name in ["表格", "图表", "拓扑图", "全局筛选"]:
        page.get_by_role("button", name=name, exact=True).click()
        expect(page.locator(".doc-anchor.active")).to_have_text(name)

    page.goto(f"{base}/filter-guide-preview.html")
    page.wait_for_load_state("networkidle")
    query = page.get_by_role("button", name="查询", exact=True)
    results = page.locator(".filter-guide-results")
    expect(query).to_be_disabled()
    page.get_by_role("button", name="修改后查询", exact=True).click()
    expect(query).to_be_enabled()
    expect(results).to_contain_text("2026-09")
    expect(results).not_to_contain_text("2026-08")
    page.get_by_role("button", name="收起筛选", exact=True).click()
    expect(page.locator(".filter-panel")).to_contain_text("2026-09")
    page.get_by_role("button", name="展开筛选", exact=True).click()
    query.click()
    expect(page.locator("main")).to_have_attribute("aria-busy", "true")
    expect(query).to_be_disabled()
    expect(results).to_contain_text("2026-09")
    expect(page.locator("main")).to_have_attribute("aria-busy", "false", timeout=5000)
    expect(results).to_contain_text("2026-08")
    expect(query).to_be_disabled()
    expect(page.locator(".pending-warning")).to_have_count(0)
    expect(page.get_by_text("数据已更新", exact=True)).to_be_visible()

    target_table = page.get_by_test_id("target-example-table")
    product_legend = page.get_by_test_id("target-product-trend").locator(".legend-label")
    category_legend = page.get_by_test_id("target-category-trend").locator(".legend-label")
    expect(target_table.locator("th")).to_have_count(9)
    expect(product_legend).to_have_text(["实际值", "月度目标", "季度目标"])
    expect(category_legend).to_have_text(["实际值", "月度目标", "季度目标", "年度目标"])
    target_select = page.locator(".filter-panel .analysis-field").filter(
        has=page.locator("label", has_text="目标值对比")).locator(".arco-select")
    target_select.click()
    page.get_by_role("option", name="月度目标值", exact=True).click()
    page.get_by_role("option", name="季度目标值", exact=True).click()
    page.keyboard.press("Escape")
    expect(target_table.locator("th")).to_have_count(9)
    expect(product_legend).to_have_text(["实际值", "月度目标", "季度目标"])
    query.click()
    expect(page.locator("main")).to_have_attribute("aria-busy", "false", timeout=5000)
    expect(target_table.locator("th")).to_have_text(
        ["指标", "实际值", "年度目标", "1月至今累计实际值", "年度目标累积占比"])
    expect(product_legend).to_have_text(["实际值"])
    expect(category_legend).to_have_text(["实际值", "年度目标"])
    target_select.click()
    page.get_by_role("option", name="年度目标值", exact=True).click()
    page.keyboard.press("Escape")
    expect(category_legend).to_have_text(["实际值", "年度目标"])
    query.click()
    expect(page.locator("main")).to_have_attribute("aria-busy", "false", timeout=5000)
    expect(target_table.locator("th")).to_have_text(["指标", "实际值"])
    expect(product_legend).to_have_text(["实际值"])
    expect(category_legend).to_have_text(["实际值"])

    for scenario, missing, inline in [
        ("大区未选择", "大区、收入售卖区域", "请选择至少一个大区"),
        ("收入售卖区域未选择", "收入售卖区域", "请选择至少一个收入售卖区域"),
        ("计费类别未选择", "收入计费单元类别、收入计费单元", None),
        ("计费单元未选择", "收入计费单元", None),
    ]:
        page.get_by_role("button", name=scenario, exact=True).click()
        query.click()
        expect(page.get_by_text(f"请选择必填项：{missing}", exact=True)).to_be_visible()
        expect(results).to_contain_text("2026-09")
        expect(page.locator("main")).to_have_attribute("aria-busy", "false")
        if inline:
            expect(page.get_by_text(inline, exact=True)).to_be_visible()

    page.get_by_role("button", name="TOS 不适用", exact=True).click()
    region = page.locator(".analysis-field").filter(has=page.locator("label", has_text="收入售卖区域"))
    expect(region.locator(".arco-select")).to_have_class(re.compile("arco-select-disabled"))
    query.click()
    expect(page.locator("main")).to_have_attribute("aria-busy", "false", timeout=5000)
    expect(results).to_contain_text("不适用")
    expect(results).to_contain_text("2026-08")

    page.reload()
    expect(query).to_be_disabled()
    page.get_by_role("button", name="查询加载样式", exact=True).click()
    expect(query).to_be_disabled()
    expect(query).to_have_class(re.compile("arco-btn-loading"))
    styles = page.locator(".analysis-section").first.evaluate("""el => ({
      mask: getComputedStyle(el, '::before').backgroundColor,
      spinner: getComputedStyle(el, '::after').width,
      interaction: getComputedStyle(el).pointerEvents
    })""")
    assert styles == {"mask": "rgba(255, 255, 255, 0.72)", "spinner": "28px", "interaction": "none"}, styles
    page.screenshot(path="/tmp/global-filter-loading.png", full_page=True)
    page.set_viewport_size({"width": 390, "height": 844})
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), "Mobile overflow"
    assert not errors, errors
    browser.close()
print(json.dumps({"result": "PASS", "checks": [
    "guide tabs and direct hash", "draft isolation and collapsed summary",
    "query loading and result update", "target columns and annual-line exceptions",
    "target draft isolation and no-target query", "four validation scenarios",
    "TOS exemption", "original loading styles", "mobile layout", "no runtime errors"
]}, ensure_ascii=False))
