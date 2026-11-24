"""Check row alignment across nested containers and independently expanded parents."""
import json
import sys
from playwright.sync_api import sync_playwright

url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5174"
MEASURE = """root => {
  const result={};
  for(const row of root.querySelectorAll('.formula-expression-row')) {
    const level=row.dataset.formulaLevel;
    const data=result[level]??={metrics:[],operators:[],metricDepth:0,operatorDepth:0,rows:0};
    data.rows++;
    const depth=el=>{
      let count=0;
      for(let parent=el.parentElement;parent&&parent!==row;parent=parent.parentElement)
        if(parent.matches('section'))count++;
      return count;
    };
    for(const metric of row.querySelectorAll('.metric-topology-node')) {
      data.metrics.push(metric.getBoundingClientRect().top);
      data.metricDepth=Math.max(data.metricDepth,depth(metric));
    }
    for(const operator of row.querySelectorAll('.calculation-operator-node')) {
      data.operators.push(operator.querySelector('svg rect').getBoundingClientRect().top);
      data.operatorDepth=Math.max(data.operatorDepth,depth(operator));
    }
  }
  return result;
}"""

def assert_rows(editor):
    rows = editor.evaluate(MEASURE)
    for level, row in rows.items():
        for kind in ["metrics", "operators"]:
            positions = row[kind]
            if positions:
                assert max(positions) - min(positions) < .15, (level, kind, row)
    return rows

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1800, "height": 1100})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"{url}/topology-playground.html")
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="加载方案三", exact=True).click()
    editor = page.locator("#topology-editor-preview")
    initial = assert_rows(editor)
    assert initial["1"]["metricDepth"] == initial["1"]["operatorDepth"] == 2
    page.get_by_label("预览模型", exact=True).click()
    page.get_by_text("嵌套对齐示例 · 括号与直接指标", exact=True).click()
    page.get_by_role("button", name="全部展开", exact=True).click()
    expanded = assert_rows(editor)
    assert expanded["2"]["rows"] >= 5
    assert expanded["2"]["metricDepth"] == 2
    assert expanded["2"]["operatorDepth"] == 1
    # Operators in the second-level SUM row must align with operators from
    # sibling parents even though the innermost bracket has no operator.
    assert len(expanded["2"]["operators"]) >= 5
    assert editor.evaluate("""root => [...root.querySelectorAll('.formula-horizontal-edge')].every(edge=>{
      const start=edge.getPointAtLength(0),end=edge.getPointAtLength(edge.getTotalLength());
      return [[start,edge.dataset.source,'right'],[end,edge.dataset.target,'left']].every(([point,id,side])=>{
        const handle=root.querySelector('[data-nodeid="'+id+'"][data-handleid="'+side+'"]');
        if(!handle)return false;
        const screen=new DOMPoint(point.x,point.y).matrixTransform(edge.getScreenCTM());
        const r=handle.getBoundingClientRect();
        return Math.abs(screen.x-r.x)<.2&&Math.abs(screen.y-r.y)<.2;
      });
    })""")
    editor.screenshot(path="docs/topology-schemes/方案三-整行对齐.png")
    editor.get_by_role("button", name="收起基础单位成本下层节点", exact=True).click()
    single = assert_rows(editor)
    assert single["2"]["metricDepth"] == 1
    editor.get_by_role("button", name="收起附加单位成本下层节点", exact=True).click()
    plain = assert_rows(editor)
    assert plain["2"]["metricDepth"] == plain["2"]["operatorDepth"] == 0
    comparison = page.get_by_role("region", name="对比：方案三", exact=True)
    assert_rows(comparison)
    page.get_by_role("button", name="全部展开", exact=True).click()
    assert_rows(editor)
    assert not errors, errors
    print(json.dumps({"initial": initial, "expanded": expanded, "single": single, "plain": plain}, ensure_ascii=False))
    browser.close()
