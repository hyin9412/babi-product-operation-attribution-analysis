"""Check status visibility, unchanged geometry, saved snapshots and old configs."""
import json
import sys
from playwright.sync_api import sync_playwright, expect

url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5174"
draft_key = "babi-topology-playground-v1"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 1000})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"{url}/topology-playground.html")
    page.wait_for_load_state("networkidle")
    editor = page.locator("#topology-editor-preview")
    tags = editor.locator(".metric-topology-node-status")
    expect(tags).to_have_count(6)
    assert tags.evaluate_all("ns => ns.every(n => getComputedStyle(n).display === 'none')")
    page.get_by_role("button", name="指标卡片", exact=False).click()
    toggle = page.get_by_role("switch", name="显示状态 Tag", exact=True)
    expect(toggle).not_to_be_checked()
    geometry = """el => Array.from(el.querySelectorAll('.metric-topology-node-card')).map(n => {
      const r = n.getBoundingClientRect(); return [r.x,r.y,r.width,r.height];
    })"""
    before = editor.evaluate(geometry)
    edges = editor.locator(".formula-canvas-edge").evaluate_all("ns => ns.map(n => n.getAttribute('d'))")
    toggle.click()
    expect(toggle).to_be_checked()
    for tag in tags.all():
        expect(tag).to_be_visible()
    assert before == editor.evaluate(geometry)
    assert edges == editor.locator(".formula-canvas-edge").evaluate_all("ns => ns.map(n => n.getAttribute('d'))")
    for variant, count in [("metric", 1), ("formula", 3)]:
        expect(editor.locator(f".function-topology-node.is-{variant} .metric-topology-node-status")).to_have_count(count)
    assert set(tags.all_text_contents()) == {"正常", "预警", "异常"}
    inset = page.get_by_role("spinbutton", name="分隔线左右间距", exact=True)
    inset.fill("12")
    inset.blur()
    divider_insets = """el => Array.from(el.querySelectorAll('.metric-topology-node-formula')).map(n => {
      const s = getComputedStyle(n, '::after'); return [s.left,s.right];
    })"""
    assert editor.evaluate(divider_insets) == [["12px", "12px"]] * 6
    assert before == editor.evaluate(geometry)
    tags.filter(has_text="异常").first.hover()
    expect(page.get_by_text("示例状态：指标数据需要检查", exact=True)).to_be_visible()
    page.get_by_role("button", name="保存方案", exact=True).click()
    page.get_by_role("textbox", name="方案名称", exact=True).fill("显示状态")
    page.get_by_role("button", name="保存", exact=True).click()
    page.locator(".arco-modal-mask").last.wait_for(state="hidden")
    saved = page.get_by_role("region", name="对比：显示状态", exact=True)
    expect(saved.locator(".metric-topology-node-status").first).to_be_visible()
    toggle.click()
    inset.fill("24")
    inset.blur()
    assert editor.evaluate(divider_insets) == [["24px", "24px"]] * 6
    assert saved.evaluate(divider_insets) == [["12px", "12px"]] * 6
    expect(tags.first).to_be_hidden()
    expect(saved.locator(".metric-topology-node-status").first).to_be_visible()
    original = page.get_by_role("region", name="对比：原始样式", exact=True)
    expect(original.locator(".metric-topology-node-status").first).to_be_hidden()
    page.reload()
    page.wait_for_load_state("networkidle")
    expect(editor.locator(".metric-topology-node-status").first).to_be_hidden()
    expect(saved.locator(".metric-topology-node-status").first).to_be_visible()
    page.get_by_role("button", name="加载显示状态", exact=True).click()
    expect(tags.first).to_be_visible()
    assert editor.evaluate(divider_insets) == [["12px", "12px"]] * 6
    page.get_by_role("switch", name="对照原始", exact=True).click()
    expect(tags.first).to_be_hidden()
    page.get_by_role("switch", name="对照原始", exact=True).click()
    expect(tags.first).to_be_visible()
    with page.expect_download() as download_info:
        page.get_by_role("button", name="导出配置", exact=True).click()
    download_info.value.save_as("/tmp/topology-status-export.json")
    with open("/tmp/topology-status-export.json") as file:
        config = json.load(file)
    assert config["metric"]["showStatusTag"] is True
    assert config["metric"]["dividerInset"] == 12
    with page.expect_download() as css_download:
        page.get_by_role("button", name="导出 CSS", exact=True).click()
    css_download.value.save_as("/tmp/topology-divider-export.css")
    with open("/tmp/topology-divider-export.css") as file:
        assert "left:12px;right:12px;" in file.read()
    page.get_by_role("button", name="指标卡片", exact=False).click()
    editor.screenshot(path="/tmp/topology-status-preview.png")
    # Imported pre-feature JSON preserves all other custom fields.
    del config["metric"]["showStatusTag"]
    del config["metric"]["dividerInset"]
    del config["metric"]["width"]
    del config["metric"]["targetValue"]
    del config["function"]["metricBackground"]
    config["metric"]["radius"] = 19
    page.get_by_label("导入配置文件", exact=True).set_input_files({
        "name": "old-config.json", "mimeType": "application/json",
        "buffer": json.dumps(config).encode(),
    })
    expect(tags.first).to_be_hidden()
    assert editor.evaluate(divider_insets) == [["0px", "0px"]] * 6
    assert page.evaluate(f"JSON.parse(localStorage.getItem('{draft_key}')).metric.radius") == 19
    # Invalid new field remains rejected.
    config["metric"]["showStatusTag"] = "yes"
    page.get_by_label("导入配置文件", exact=True).set_input_files({
        "name": "invalid-config.json", "mimeType": "application/json",
        "buffer": json.dumps(config).encode(),
    })
    expect(page.get_by_text("配置值无效：metric.showStatusTag", exact=True)).to_be_visible()
    page.evaluate("""() => {
      const draft = JSON.parse(localStorage.getItem('babi-topology-playground-v1'));
      delete draft.metric.showStatusTag;
      delete draft.metric.dividerInset;
      delete draft.metric.width;
      delete draft.metric.targetValue;
      delete draft.function.metricBackground;
      localStorage.setItem('babi-topology-playground-v1', JSON.stringify(draft));
      const library = JSON.parse(localStorage.getItem('babi-topology-playground-schemes-v1'));
      library.schemes.forEach(s => {
        delete s.style.metric.showStatusTag; delete s.style.metric.dividerInset;
        delete s.style.metric.width; delete s.style.metric.targetValue;
        delete s.style.function.metricBackground; s.style.metric.radius = 17;
      });
      localStorage.setItem('babi-topology-playground-schemes-v1', JSON.stringify(library));
    }""")
    page.reload()
    page.wait_for_load_state("networkidle")
    expect(tags.first).to_be_hidden()
    expect(saved.locator(".metric-topology-node-status").first).to_be_hidden()
    assert saved.evaluate(divider_insets) == [["0px", "0px"]] * 6
    assert saved.locator(".metric-topology-node-card").first.evaluate("el => getComputedStyle(el).borderRadius") == "17px"
    assert not errors, errors
    browser.close()
    print("PASS: status toggle, all metric variants, fixed geometry, saved snapshots, refresh, original comparison, export, legacy import and validation")
