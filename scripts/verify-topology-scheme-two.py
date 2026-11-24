"""Check scheme two's composite frame, recursive measurements and saved independence."""
import json
import sys
from urllib.parse import unquote
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
    page.get_by_role("button", name="加载方案二", exact=True).click()
    editor = page.locator("#topology-editor-preview")
    for card in editor.locator(".metric-topology-node-card").all():
        gap = card.evaluate("""el => {
          const name=el.querySelector('.metric-topology-node-name').getBoundingClientRect();
          const formula=el.querySelector('.metric-topology-node-formula-text').getBoundingClientRect();
          const scale=el.getBoundingClientRect().width/el.offsetWidth;
          return (formula.top-name.bottom)/scale;
        }""")
        assert abs(gap - 8) < .1, gap
    root_card = editor.locator(".metric-topology-node-card").first
    assert root_card.evaluate("el => el.offsetHeight") == int(editor.locator(".formula-canvas-nodes > foreignObject").first.get_attribute("height"))
    expect(editor.locator(".metric-topology-node-actual strong").first).to_have_css("font-size", "18px")
    for actual in editor.locator(".metric-topology-node-actual strong").all():
        expect(actual).to_have_css("font-size", "18px")
        expect(actual).to_have_css("font-weight", "500")
        assert actual.evaluate("el => getComputedStyle(el).fontFamily").startswith("Roboto")
    for icon in editor.locator(".calculation-operator-node-icon svg").all():
        expected = icon.evaluate("""el => {
          const probe=document.createElement('span');
          probe.style.color='var(--color-bg-4)';el.parentElement.append(probe);
          const color=getComputedStyle(probe).color;probe.remove();return color;
        }""")
        assert icon.locator("rect").first.evaluate("el => getComputedStyle(el).fill") == expected
    for selector, fill, stroke in [
        (".function-topology-node", "rgb(255, 248, 235)", "rgb(255, 206, 122)"),
        (".bracket-expression-node", "rgb(243, 254, 255)", "rgb(148, 239, 255)"),
    ]:
        assert editor.locator(selector).count() > 0
        for group in editor.locator(selector).all():
            expect(group).to_have_class(__import__("re").compile("is-folder"))
            expect(group).to_have_css("border-width", "0px")
            expect(group).to_have_css("background-color", "rgba(0, 0, 0, 0)")
            expect(group).to_have_css("padding-top", "39px")
            expect(group).to_have_css("padding-left", "13px")
            has_direct_toggle = group.evaluate("""el => [...el.querySelectorAll('.metric-topology-node-toggle')]
              .some(button=>button.closest('section')===el)""")
            formula_function = "is-formula" in group.get_attribute("class")
            bottom_padding = 21 if has_direct_toggle else 13 if formula_function else 9
            expect(group).to_have_css("padding-bottom", f"{bottom_padding}px")
            frame = group.locator(":scope > .formula-group-frame path")
            expect(frame).to_have_count(1)
            expect(frame).to_have_css("fill", fill)
            expect(frame).to_have_css("stroke", stroke)
            expect(frame).to_have_css("stroke-dasharray", "3px, 3px")
            assert frame.get_attribute("d").strip().endswith("Z")
            expect(group.locator(":scope > header")).to_have_css("padding", "8px 12px")
            # The measured cell and actual composite DOM must agree at every top-level node.
            assert group.evaluate("""el => {
              const cell=el.closest('.formula-expression-cell'), r=el.getBoundingClientRect();
              if(cell.firstElementChild!==el)return true;
              const c=cell.getBoundingClientRect();
              return Math.abs(r.width-c.width)<.1 && Math.abs(r.height-c.height)<.1;
            }"""), group.evaluate("""el => ({
              label:el.getAttribute('aria-label'), actual:[el.offsetWidth,el.offsetHeight],
              cell:[el.closest('.formula-expression-cell').offsetWidth,el.closest('.formula-expression-cell').offsetHeight],
              content:[el.querySelector(':scope > div').offsetWidth,el.querySelector(':scope > div').offsetHeight]
            })""")
            # Each group's own content starts after the tag and includes every nested tab.
            assert group.evaluate("""el => {
              const s=getComputedStyle(el), content=el.querySelector(':scope > div');
              return Math.abs(el.offsetHeight-content.offsetHeight-39-parseFloat(s.paddingBottom))<.1 &&
                Math.abs(el.offsetWidth-content.offsetWidth-26)<.1;
            }""")
            # Use the SVG's visible circle (y=4..32 of 40), excluding transparent image space.
            gaps = group.evaluate("""el => {
              const r=el.getBoundingClientRect(), scale=r.width/el.offsetWidth;
              return [...el.querySelectorAll('.metric-topology-node-toggle img')]
                .filter(img=>img.closest('section')===el)
                .map(img=>{
                  const icon=img.getBoundingClientRect();
                  return (r.bottom-scale-(icon.top+icon.height*32/40))/scale;
                });
            }""")
            assert all(abs(gap - 8) < .1 for gap in gaps), gaps
            if formula_function and not has_direct_toggle:
                gap = group.evaluate("""el => {
                  const r=el.getBoundingClientRect(), scale=r.width/el.offsetWidth;
                  const children=[...el.querySelector(':scope > .function-topology-node-items').children];
                  const bottom=Math.max(...children.map(child=>child.getBoundingClientRect().bottom));
                  return (r.bottom-scale-bottom)/scale;
                }""")
                assert abs(gap - 12) < .1, gap
    for title in editor.locator(".bracket-expression-node-title").all():
        mask = unquote(title.evaluate("el => getComputedStyle(el,'::before').maskImage"))
        assert "bracket-expression-dots" in mask or "M6.80501 4.5975" in mask
        assert title.evaluate("el => getComputedStyle(el,'::before').width") == "16px"
        expect(title).to_have_css("color", "rgb(26, 198, 255)")
    one = page.get_by_role("region", name="对比：方案一", exact=True)
    original = page.get_by_role("region", name="对比：原始样式", exact=True)
    expect(one.locator(".metric-topology-node-actual strong").first).to_have_css("font-size", "14px")
    expect(original.locator(".metric-topology-node-card").first).to_have_css("width", "300px")
    expect(one.locator(".formula-group-frame")).to_have_count(0)
    expect(original.locator(".formula-group-frame")).to_have_count(0)
    page.get_by_role("button", name="全部展开", exact=True).click()
    assert editor.locator(".function-topology-node.is-formula .bracket-expression-node.is-folder").count() > 0
    # SVG incoming edges terminate at the body's y=26 border, matching the hidden handle.
    assert editor.evaluate("""root => {
      return [...root.querySelectorAll('.formula-expression-cell > section.is-folder')].every(group=>{
        const id=group.dataset.nodeId, edge=[...root.querySelectorAll('.formula-canvas-edge')].find(e=>e.dataset.target===id);
        const handle=group.querySelector(':scope > [data-handleid="group-target"]');
        if(!edge||!handle)return false;
        const end=edge.getPointAtLength(edge.getTotalLength());
        const pt=new DOMPoint(end.x,end.y).matrixTransform(edge.getScreenCTM());
        const r=handle.getBoundingClientRect();
        return Math.abs(pt.x-r.x)<.2 && Math.abs(pt.y-r.y)<.2;
      });
    }""")
    editor.screenshot(path="/tmp/topology-scheme-two.png")
    with page.expect_download() as result:
        page.get_by_role("button", name="导出配置", exact=True).click()
    artifact = Path("docs/topology-schemes/方案二.json")
    artifact.parent.mkdir(parents=True, exist_ok=True)
    result.value.save_as(str(artifact))
    config = json.loads(artifact.read_text())
    assert config["metric"]["value"]["size"] == 18
    assert config["metric"]["formulaGap"] == 8
    assert config["operator"]["background"] == "var(--color-bg-4)"
    assert config["function"]["appearance"] == config["expression"]["appearance"] == "folder"
    page.get_by_role("button", name="指标卡片", exact=False).click()
    radius = page.get_by_role("spinbutton", name="指标卡片圆角", exact=True)
    radius.fill("9"); radius.blur()
    formula_gap = page.get_by_role("spinbutton", name="名称与公式间距", exact=True)
    formula_gap.fill("12"); formula_gap.blur()
    page.get_by_role("button", name="更新此方案", exact=True).click()
    page.reload()
    page.wait_for_load_state("networkidle")
    two = page.get_by_role("region", name="对比：方案二", exact=True)
    expect(two.locator(".metric-topology-node-card").first).to_have_css("border-radius", "9px")
    expect(two.locator(".metric-topology-node-formula").first).to_have_css("margin-top", "4px")
    expect(one.locator(".metric-topology-node-formula").first).to_have_css("margin-top", "2px")
    expect(one.locator(".metric-topology-node-card").first).to_have_css("border-radius", "8px")
    expect(two).to_have_count(1)
    assert not errors, errors
    browser.close()
    print("PASS: scheme two typography, bg4, composite outline, nested layout, edge handles, isolation, export and persistence")
