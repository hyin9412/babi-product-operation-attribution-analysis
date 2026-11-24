"""Verify delta-based trackpad zoom, frame batching and pointer anchoring."""
import math
import sys
from playwright.sync_api import sync_playwright

base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5174"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1500, "height": 1100})
    page.goto(f"{base}/topology-flow-preview.html?example=spacing")
    page.wait_for_load_state("networkidle")
    svg = page.locator(".topology-canvas-shell-svg")

    def viewport():
        return svg.evaluate("el => {const m=el.firstElementChild.transform.baseVal.consolidate().matrix;return {scale:m.a,x:m.e,y:m.f};}")

    def wheel(delta, count=1, mode=0, pinch=False):
        before = viewport()
        rect = svg.bounding_box()
        anchor = {"x": math.floor(rect["x"] + rect["width"] * .61) - rect["x"], "y": math.floor(rect["y"] + rect["height"] * .47) - rect["y"]}
        canceled = svg.evaluate("""(el,args) => {
          const rect=el.getBoundingClientRect();
          return Array.from({length:args.count},() => {
            const event=new WheelEvent('wheel',{deltaY:args.delta,deltaX:100,deltaMode:args.mode,ctrlKey:args.pinch,
              clientX:rect.left+args.anchor.x,clientY:rect.top+args.anchor.y,bubbles:true,cancelable:true});
            el.dispatchEvent(event);return event.defaultPrevented;
          });
        }""", {"delta": delta, "count": count, "mode": mode, "pinch": pinch, "anchor": anchor})
        assert all(canceled)
        page.wait_for_timeout(50)
        after = viewport()
        for axis in ["x", "y"]:
            assert abs((anchor[axis] - before[axis]) / before["scale"] - (anchor[axis] - after[axis]) / after["scale"]) < .001, (axis, anchor, before, after)
        return after["scale"] / before["scale"]

    assert abs(wheel(-1) - math.exp(.003)) < .00001
    assert abs(wheel(1) - math.exp(-.003)) < .00001
    assert abs(wheel(-1, count=10, pinch=True) - math.exp(.03)) < .00001
    assert abs(wheel(0) - 1) < .00001
    assert abs(wheel(1, mode=1) - math.exp(-16 * .003)) < .00001
    assert abs(wheel(1, mode=2) - math.exp(-.09)) < .00001
    assert abs(wheel(1000, count=20) - math.exp(-.09)) < .00001
    for _ in range(35):
        wheel(1000)
    assert abs(viewport()["scale"] - .15) < .00001
    for _ in range(35):
        wheel(-1000)
    assert abs(viewport()["scale"] - 1.4) < .00001
    # Real browser input stays inside the canvas rather than scrolling the page.
    rect = svg.bounding_box()
    page.mouse.move(rect["x"] + rect["width"] / 2, rect["y"] + rect["height"] / 2)
    scroll_y = page.evaluate("scrollY")
    before = viewport()["scale"]
    page.mouse.wheel(0, 10)
    page.wait_for_timeout(100)
    assert abs(viewport()["scale"] / before - math.exp(-.03)) < .00001
    assert page.evaluate("scrollY") == scroll_y
    page.get_by_role("button", name="适配画布", exact=True).click()
    before = viewport()["scale"]
    page.get_by_role("button", name="放大", exact=True).click()
    assert abs(viewport()["scale"] - min(before * 1.15, 1.4)) < .00001
    page.goto(f"{base}/topology-flow-preview.html")
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="全屏", exact=True).click()
    svg = page.locator(".pricing-formula-fullscreen-page .topology-canvas-shell-svg")
    svg.evaluate("async el => {for(let parent=el;parent;parent=parent.parentElement) await Promise.all(parent.getAnimations().map(animation=>animation.finished.catch(()=>{})));}")
    before = viewport()["scale"]
    assert abs(wheel(10) - max(before * math.exp(-.03), .25) / before) < .00001
    page.get_by_role("button", name="退出全屏", exact=True).click()
    page.goto(f"{base}/#/finance/sell/transparency")
    page.wait_for_load_state("networkidle")
    page.locator(".analysis-page-header").get_by_role("tab", name="成本定价", exact=True).click()
    svg = page.locator(".pricing-formula-container .topology-canvas-shell-svg")
    page.wait_for_timeout(300)
    before = viewport()["scale"]
    assert abs(wheel(-1, pinch=True) - min(before * math.exp(.003), 1.4) / before) < .00001
    print("PASS: continuous anchored zoom, gesture batching, limits, real wheel, button step, fullscreen and analysis")
    browser.close()
