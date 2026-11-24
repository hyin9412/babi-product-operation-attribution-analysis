"""Verify the requested saved scheme, exact dimensions and independent variant colors."""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5174"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 1000})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"{url}/topology-playground.html")
    page.wait_for_load_state("networkidle")
    scheme = page.get_by_role("region", name="对比：方案一", exact=True)
    expect(scheme).to_have_count(1)
    page.get_by_role("button", name="加载方案一", exact=True).click()
    editor = page.locator("#topology-editor-preview")
    name = editor.locator(".metric-topology-node-name").first
    expect(name).to_have_css("font-size", "14px")
    expect(name).to_have_css("font-weight", "500")
    primary = name.evaluate("el => getComputedStyle(el).getPropertyValue('--primary-6').trim()")
    assert name.evaluate("el => getComputedStyle(el).color") == f"rgb({primary})"
    expect(editor.locator(".metric-topology-node-formula-text").first).to_have_css("color", "rgb(115, 122, 135)")
    for card in editor.locator(".metric-topology-node-card").all():
        expect(card).to_have_css("width", "278px")
        expect(card).to_have_css("border-radius", "8px")
        expect(card).to_have_css("box-shadow", "none")
        formula = card.locator(".metric-topology-node-formula")
        assert formula.evaluate("""el => {
          const s = getComputedStyle(el,'::after');
          return [s.width,s.left,s.right,s.borderTopStyle];
        }""") == ["252px", "12px", "12px", "dashed"]
        actual = card.locator(".metric-topology-node-actual strong")
        expect(actual).to_have_css("font-size", "14px")
        expect(actual).to_have_css("font-weight", "500")
        assert actual.evaluate("el => getComputedStyle(el).fontFamily").startswith("Roboto")
        for value in card.locator(".metric-topology-node-target b").all():
            expect(value).to_have_css("font-size", "12px")
            expect(value).to_have_css("font-weight", "500")
            assert value.evaluate("el => getComputedStyle(el).fontFamily").startswith("Roboto")
        expect(card.locator(".metric-topology-node-target").first).to_have_css("font-family", '"PingFang SC", "Microsoft YaHei", Arial, sans-serif')
    for prefix, title_bg, title_color, border, background in [
        (".bracket-expression-node", "rgb(230, 253, 255)", "rgb(26, 198, 255)", "rgb(148, 239, 255)", "rgb(243, 254, 255)"),
        (".function-topology-node.is-metric", "rgb(255, 242, 214)", "rgb(255, 138, 0)", "rgb(255, 206, 122)", "rgb(255, 255, 255)"),
        (".function-topology-node.is-formula", "rgb(255, 242, 214)", "rgb(255, 138, 0)", "rgb(255, 206, 122)", "rgb(255, 248, 235)"),
    ]:
        containers = editor.locator(prefix)
        assert containers.count() > 0
        for container in containers.all():
            title = container.locator(":scope > header")
            content = container
            expect(title).to_have_css("background-color", title_bg)
            expect(title).to_have_css("color", title_color)
            assert title.evaluate("el => getComputedStyle(el,'::before').backgroundColor") == title_color
            assert title.evaluate("el => getComputedStyle(el,'::before').maskImage").startswith("url(")
            expect(content).to_have_css("border-color", border)
            expect(content).to_have_css("border-style", "dashed")
            expect(content).to_have_css("background-color", background)
            expect(content).to_have_css("border-radius", "8px")
            expect(content).to_have_css("box-shadow", "none")
            # The title must stop before the frame's top dashed border.
            assert container.evaluate("""el => {
              const tag = el.querySelector(':scope > header');
              return Math.abs(tag.getBoundingClientRect().bottom - el.getBoundingClientRect().top) < .1;
            }""")
    original = page.get_by_role("region", name="对比：原始样式", exact=True)
    expect(original.locator(".metric-topology-node-card").first).to_have_css("width", "300px")
    expect(original.locator(".metric-topology-node-name").first).to_have_css("font-size", "13px")
    # Compare each operator's SVG and local geometry with the same original operand.
    icon_style = """el => {
      const icon = el.querySelector('.calculation-operator-node-icon'), s = getComputedStyle(icon), p = getComputedStyle(el);
      return {shape:icon.innerHTML, width:s.width, height:s.height, position:s.position, top:s.top,
        left:s.left, transform:s.transform, visibility:s.visibility, display:s.display,
        wrapperWidth:p.width, wrapperHeight:p.height, replacement:getComputedStyle(el,'::after').content};
    }"""
    original_icons = original.locator(".calculation-operator-node").evaluate_all(f"els => els.map({icon_style})")
    assert editor.locator(".calculation-operator-node").evaluate_all(f"els => els.map({icon_style})") == original_icons
    assert scheme.locator(".calculation-operator-node").evaluate_all(f"els => els.map({icon_style})") == original_icons
    for icon in editor.locator(".calculation-operator-node-icon svg").all():
        expect(icon.locator("rect").first).to_have_css("fill", "rgb(255, 255, 255)")
    for icon in original.locator(".calculation-operator-node-icon svg").all():
        expect(icon.locator("rect").first).to_have_css("fill", "rgb(252, 253, 254)")
    expect(scheme.locator(".metric-topology-node-card").first).to_have_css("width", "278px")
    expect(editor.locator(".formula-canvas-nodes > foreignObject").first).to_have_attribute("width", "278")
    with page.expect_download() as result:
        page.get_by_role("button", name="导出配置", exact=True).click()
    artifact = Path("docs/topology-schemes/方案一.json")
    artifact.parent.mkdir(parents=True, exist_ok=True)
    result.value.save_as(str(artifact))
    config = json.loads(artifact.read_text())
    assert config["metric"]["text"]["color"] == "rgb(var(--primary-6))"
    assert config["metric"]["formula"]["color"] == "var(--color-text-3)"
    assert config["operator"]["background"] == "var(--color-bg-1)"
    with page.expect_download() as css_result:
        page.get_by_role("button", name="导出 CSS", exact=True).click()
    css_result.value.save_as("/tmp/topology-scheme-one.css")
    assert "--calculation-operator-background:var(--color-bg-1);" in Path("/tmp/topology-scheme-one.css").read_text()
    editor.screenshot(path="/tmp/topology-scheme-one.png")
    # Once generated, refreshing cannot overwrite an explicitly updated scheme.
    page.get_by_role("button", name="指标卡片", exact=False).click()
    radius = page.get_by_role("spinbutton", name="指标卡片圆角", exact=True)
    radius.fill("9")
    radius.blur()
    page.get_by_role("button", name="更新此方案", exact=True).click()
    page.reload()
    page.wait_for_load_state("networkidle")
    expect(scheme.locator(".metric-topology-node-card").first).to_have_css("border-radius", "9px")
    expect(page.get_by_role("region", name="对比：方案一", exact=True)).to_have_count(1)
    assert not errors, errors
    browser.close()
    print("PASS: generated scheme, exact 252px divider/12px insets, typography tokens, numeric-only styles, variant colors/icons, layout widths, original isolation, export and saved updates")
