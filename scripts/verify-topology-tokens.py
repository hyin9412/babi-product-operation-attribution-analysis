"""Verify Source Design token selection, persistence, export and custom-color fallback."""
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
    editor = page.locator("#topology-editor-preview")

    def choose(label, token):
        select = page.get_by_role("combobox", name=f"{label}源力Token", exact=True)
        select.click()
        select.locator("input").fill(token.removeprefix("--"))
        option = page.get_by_role("option").filter(has=page.get_by_text(token, exact=True))
        expect(option).to_have_count(1)
        if label == "画布背景色":
            option_box = option.bounding_box()
            hex_box = option.locator(".playground-token-hex").bounding_box()
            assert hex_box["x"] + hex_box["width"] <= option_box["x"] + option_box["width"]
            page.locator(".playground-token-menu:visible").screenshot(path="/tmp/topology-token-menu.png")
        option.click()
        expect(select).to_contain_text(token)

    choose("画布背景色", "--color-bg-2")
    expect(editor.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(252, 253, 254)")
    expect(page.get_by_role("textbox", name="画布背景色", exact=True)).to_have_value("#fcfdfe")
    page.reload()
    page.get_by_role("combobox", name="预览模型", exact=True).click()
    page.get_by_role("option", name="样式示例 · 全部节点类型", exact=True).click()
    expect(page.get_by_role("combobox", name="画布背景色源力Token", exact=True)).to_contain_text("--color-bg-2")
    page.get_by_role("button", name="▤ 指标卡片", exact=True).click()
    choose("指标卡片描边颜色", "--color-border-3")
    choose("指标名称文字颜色", "--color-text-2")
    expect(editor.locator(".metric-topology-node-card").first).to_have_css("border-color", "rgb(221, 226, 233)")
    expect(editor.locator(".metric-topology-node-name").first).to_have_css("color", "rgb(66, 70, 78)")
    page.get_by_role("button", name="ƒ 函数容器", exact=True).click()
    choose("函数容器标题背景色", "--violet-2")
    expect(editor.locator(".function-topology-node-title")).to_have_css("background-color", "rgb(242, 234, 251)")
    page.get_by_role("button", name="1 常量节点", exact=True).click()
    choose("常量节点背景颜色", "--color-bg-6")
    expect(editor.locator(".constant-topology-node")).to_have_css("background-color", "rgba(26, 27, 30, 0.05)")
    expect(page.get_by_text("背景 Token · 不透明度 5% · 已保留名称，手动改色后转为自定义", exact=True)).to_be_visible()
    page.get_by_role("button", name="+ 运算符", exact=True).click()
    choose("运算符文字颜色", "--primary-6")
    primary = editor.locator(".calculation-operator-node").first.evaluate(
        "(el) => getComputedStyle(el, '::after').color"
    )
    assert primary not in ["rgb(0, 0, 0)", "rgba(0, 0, 0, 0)"]
    page.get_by_role("button", name="保存方案", exact=True).click()
    page.get_by_role("textbox", name="方案名称", exact=True).fill("Token方案")
    page.get_by_role("button", name="保存", exact=True).click()
    saved = page.get_by_role("region", name="对比：Token方案", exact=True)
    expect(saved.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(252, 253, 254)")
    expect(saved.locator(".function-topology-node-title")).to_have_css("background-color", "rgb(242, 234, 251)")

    # Exported data and CSS retain variable references rather than only resolved HEX values.
    with page.expect_download() as pending:
        page.get_by_role("button", name="导出配置", exact=True).click()
    config = Path(temp) / "tokens.json"
    pending.value.save_as(config)
    exported = json.loads(config.read_text())
    assert exported["canvas"]["background"] == "var(--color-bg-2)"
    assert exported["metric"]["text"]["color"] == "var(--color-text-2)"
    assert exported["function"]["titleBackground"] == "rgb(var(--violet-2))"
    assert exported["operator"]["text"]["color"] == "rgb(var(--primary-6))"
    with page.expect_download() as pending:
        page.get_by_role("button", name="导出 CSS", exact=True).click()
    css_path = Path(temp) / "tokens.css"
    pending.value.save_as(css_path)
    assert "var(--color-bg-2)" in css_path.read_text()
    assert "rgb(var(--violet-2))" in css_path.read_text()

    page.get_by_role("button", name="◌ 画布与连线", exact=True).click()
    page.get_by_role("textbox", name="画布背景色", exact=True).fill("#abcdef")
    expect(page.get_by_role("combobox", name="画布背景色源力Token", exact=True)).to_contain_text("自定义色值")
    expect(editor.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(171, 205, 239)")
    expect(saved.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(252, 253, 254)")
    page.reload()
    page.get_by_role("combobox", name="预览模型", exact=True).click()
    page.get_by_role("option", name="样式示例 · 全部节点类型", exact=True).click()
    page.get_by_role("button", name="加载Token方案", exact=True).click()
    expect(page.get_by_role("combobox", name="画布背景色源力Token", exact=True)).to_contain_text("--color-bg-2")
    page.get_by_role("button", name="恢复原始", exact=True).click()
    page.locator('input[type="file"]').set_input_files(config)
    expect(page.get_by_role("combobox", name="画布背景色源力Token", exact=True)).to_contain_text("--color-bg-2")
    invalid = Path(temp) / "invalid-token.json"
    exported["canvas"]["background"] = "var(--not-a-source-token)"
    invalid.write_text(json.dumps(exported))
    page.locator('input[type="file"]').set_input_files(invalid)
    expect(page.get_by_text("配置值无效：canvas.background", exact=True)).to_be_visible()
    expect(editor.locator(".topology-canvas-shell-svg")).to_have_css("background-color", "rgb(252, 253, 254)")
    page.set_viewport_size({"width": 390, "height": 844})
    page.get_by_role("combobox", name="画布背景色源力Token", exact=True).click()
    page.get_by_role("combobox", name="画布背景色源力Token", exact=True).locator("input").fill("color-bg")
    menu = page.locator(".playground-token-menu:visible")
    expect(menu).to_be_visible()
    box = menu.bounding_box()
    assert box["width"] <= 390
    page.keyboard.press("Escape")
    assert not errors, errors
    browser.close()
    print("PASS: searchable semantic/palette tokens, RGB and alpha rendering, draft/scheme persistence, JSON/CSS references, custom HEX fallback, import validation and mobile dropdown")
