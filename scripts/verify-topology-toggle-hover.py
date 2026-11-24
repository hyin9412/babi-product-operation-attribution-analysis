"""Verify primary-5 arrows in both states across scheme-three entry points."""
import re
import sys
from playwright.sync_api import sync_playwright, expect

base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5174"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 1100}, device_scale_factor=3)
    for route in ["topology-flow-preview.html", "#/finance/sell/transparency", "topology-playground.html"]:
        page.goto(f"{base}/{route}")
        page.wait_for_load_state("networkidle")
        if route.startswith("#"):
            page.locator(".analysis-page-header").get_by_role("tab", name="成本定价", exact=True).click()
        if route.startswith("topology-playground"):
            page.get_by_role("button", name="加载方案三", exact=True).click()
        toggle = page.locator(".metric-topology-node.is-inset .metric-topology-node-toggle").first
        expect(toggle).to_be_visible()
        page.wait_for_timeout(300)
        token = toggle.evaluate("el => getComputedStyle(el).getPropertyValue('--primary-5')")
        color = f'rgb({", ".join(re.findall(r"[0-9]+", token))})'
        masks = []
        for _ in range(2):
            toggle.hover()
            rect = toggle.bounding_box()
            page.mouse.move(rect["x"] + rect["width"] / 2, rect["y"] + rect["height"] * .45)
            style = toggle.evaluate("el => {const css=getComputedStyle(el,'::after');return {color:css.backgroundColor,mask:css.maskImage,events:css.pointerEvents};}")
            if style["color"] != color:
                page.screenshot(path="/tmp/topology-toggle-hover-failure.png")
            assert style["color"] == color, (route, style, token)
            assert style["events"] == "none"
            masks.append(style["mask"])
            state = toggle.get_attribute("aria-expanded")
            if route.startswith("topology-flow"):
                toggle.screenshot(path=f"/tmp/topology-toggle-hover-{state}.png")
            toggle.click()
            expect(toggle).to_have_attribute("aria-expanded", "false" if state == "true" else "true")
            page.wait_for_timeout(300)
        assert masks[0] != masks[1]
        page.mouse.move(10, 10)
        assert toggle.evaluate("el => getComputedStyle(el,'::after').content") == "none"
    page.get_by_role("button", name="加载方案二", exact=True).click()
    original = page.locator("#topology-editor-preview .metric-topology-node-toggle").first
    original.hover()
    assert original.evaluate("el => getComputedStyle(el,'::after').content") == "none"
    print("PASS: scheme-three hover uses primary-5 in both states; pointer exit and scheme-two styling verified")
    browser.close()
