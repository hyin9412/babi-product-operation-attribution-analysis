"""Capture the actual chart component's legend and June tooltip for the guide."""
import argparse
import json
from pathlib import Path

from playwright.sync_api import sync_playwright


def capture_region(page, selector, destination):
    element = page.locator(selector).filter(visible=True).first
    bounds = element.bounding_box()
    if not bounds:
        raise RuntimeError(f"No visible bounds for {selector}")
    page.screenshot(
        path=str(destination),
        clip={
            "x": max(0, bounds["x"] - 12),
            "y": max(0, bounds["y"] - 12),
            "width": min(bounds["width"] + 24, page.viewport_size["width"] - max(0, bounds["x"] - 12)),
            "height": min(bounds["height"] + 24, page.viewport_size["height"] - max(0, bounds["y"] - 12)),
        },
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:5173")
    args = parser.parse_args()
    destination = Path(__file__).resolve().parents[1] / "public/docs/chart-order-examples"
    destination.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1040, "height": 620}, device_scale_factor=2)
        for example in ["single", "multiple", "price"]:
            page.goto(f"{args.base_url}/chart-guide-preview.html?example=order-{example}")
            page.wait_for_load_state("networkidle")
            page.locator(".analysis-chart-slot canvas").wait_for()
            page.evaluate("document.fonts.ready")
            page.set_viewport_size({"width": 620, "height": 620})
            page.locator(".chart-legend").screenshot(path=str(destination / f"{example}-legend.png"))
            next_page = page.get_by_role("button", name="下一页图例", exact=True)
            if next_page.count() and next_page.is_enabled():
                next_page.click()
                page.locator(".chart-legend").screenshot(path=str(destination / f"{example}-legend-page-2.png"))
                if next_page.is_enabled():
                    raise RuntimeError(f"Unexpected third legend page for {example}")
            page.set_viewport_size({"width": 1040, "height": 620})
            page.goto(f"{args.base_url}/chart-guide-preview.html?example=order-{example}")
            page.wait_for_load_state("networkidle")
            page.locator(".analysis-chart-slot canvas").wait_for()
            bounds = page.locator(".analysis-chart-slot canvas").first.bounding_box()
            page.mouse.move(bounds["x"] + bounds["width"] * 0.94, bounds["y"] + bounds["height"] * 0.45)
            tooltip = page.locator(".analysis-chart-tooltip").filter(visible=True).first
            tooltip.wait_for(state="visible")
            tooltip.get_by_text("6月", exact=True).wait_for()
            capture_region(page, ".analysis-chart-tooltip", destination / f"{example}-tooltip.png")
            print(json.dumps({
                "example": example,
                "legend": page.locator(".legend-label").all_text_contents(),
                "tooltip": tooltip.inner_text(),
            }, ensure_ascii=False))
        browser.close()


if __name__ == "__main__":
    main()
