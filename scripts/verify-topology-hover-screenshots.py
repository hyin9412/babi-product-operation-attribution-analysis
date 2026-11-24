"""Verify annotated images and their matching hover-rule rows."""
import sys
from playwright.sync_api import sync_playwright, expect

base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5174"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1100})
    page.goto(f"{base}/docs/operation-conclusion-card-guide-topology.html")
    page.get_by_role("tab", name="拓扑图", exact=True).click()
    section = page.locator('[aria-labelledby="topology-hover-title"]')
    images = section.locator("img")
    expect(images).to_have_count(4)
    expect(section.locator("tbody tr")).to_have_count(12)
    expect(section).not_to_contain_text("状态 Tag")
    expect(section.locator('img[src*="status.png"]')).to_have_count(0)
    table = section.locator(".topology-hover-table")
    expect(table.locator("thead th")).to_have_count(5)
    expect(table.locator("tbody").nth(0).locator("tr")).to_have_count(8)
    expect(table.locator("tbody").nth(1).locator("tr")).to_have_count(1)
    expect(table.locator("tbody").nth(2).locator("tr")).to_have_count(3)
    expect(table.locator(".topology-hover-image-cell").first).to_have_attribute("rowspan", "8")
    expect(table.locator(".topology-hover-image-cell").last).to_have_attribute("rowspan", "3")
    expect(table.locator(".topology-hover-image-cell").first.locator("img")).to_have_count(2)
    expect(images.first).to_be_visible()
    for image in images.all():
        image.scroll_into_view_if_needed()
        image.evaluate("image => image.decode()")
        assert image.evaluate("image => image.naturalWidth >= 700 && image.naturalHeight > 500")
        assert image.evaluate("image => image.getBoundingClientRect().right <= image.parentElement.parentElement.getBoundingClientRect().right + 1")
    section.evaluate("el => el.scrollIntoView({block:'start'})")
    page.screenshot(path="/tmp/topology-hover-guide-annotated.png", full_page=False)
    page.set_viewport_size({"width": 740, "height": 1000})
    images.first.scroll_into_view_if_needed()
    assert section.locator(".topology-hover-scroll").evaluate("el => el.scrollWidth > el.clientWidth && el.getBoundingClientRect().right <= innerWidth")
    for width in [1100, 740, 540]:
        page.set_viewport_size({"width": width, "height": 1000})
        section.evaluate("el => el.scrollIntoView({block:'start'})")
        frozen = table.locator("thead th:nth-child(-n+2), .topology-hover-image-cell, td:first-child:not(.topology-hover-image-cell), .topology-hover-image-cell + td")
        scroll = section.locator(".topology-hover-scroll")
        scroll.evaluate("el => el.scrollLeft = 0")
        before = frozen.evaluate_all("cells => cells.map(cell => cell.getBoundingClientRect().left)")
        moving_before = table.locator("thead th").nth(2).bounding_box()["x"]
        moved = scroll.evaluate("el => {el.scrollLeft = el.scrollWidth; return el.scrollLeft;}")
        assert moved > 0
        after = frozen.evaluate_all("cells => cells.map(cell => cell.getBoundingClientRect().left)")
        assert all(abs(a - b) < 1 for a, b in zip(before, after)), (width, before, after)
        moving_after = table.locator("thead th").nth(2).bounding_box()["x"]
        assert abs(moving_before - moving_after - moved) < 1
        first_width = table.locator("thead th").nth(0).bounding_box()["width"]
        second_width = table.locator("thead th").nth(1).bounding_box()["width"]
        assert first_width + second_width < scroll.evaluate("el => el.clientWidth") - 50
        if width == 740:
            page.screenshot(path="/tmp/topology-hover-fixed-columns.png", full_page=False)
    page.goto(f"{base}/topology-playground.html")
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="加载方案三", exact=True).click()
    page.get_by_role("button", name="指标卡片", exact=False).click()
    expect(page.locator("#topology-editor-preview .metric-topology-node-status")).to_have_count(0)
    expect(page.get_by_role("switch", name="显示状态 Tag", exact=True)).to_have_count(0)
    # Old saved settings cannot bring status tags back into scheme three.
    page.evaluate("""() => {
      const key = 'babi-topology-playground-v1';
      const draft = JSON.parse(localStorage.getItem(key));
      draft.metric.showStatusTag = true;
      localStorage.setItem(key, JSON.stringify(draft));
    }""")
    page.reload()
    page.wait_for_load_state("networkidle")
    expect(page.locator("#topology-editor-preview .metric-topology-node-status")).to_have_count(0)
    expect(page.get_by_role("region", name="对比：方案三", exact=True)
           .locator(".metric-topology-node-status")).to_have_count(0)
    print("PASS: four images, 12 matching rows, scheme-three status removed including old settings, narrow layout works")
    browser.close()
