# Debug Session: summary-row-overlap
- Status: [OPEN]
- Issue: 固定总计行底线缺失、下一条数据行顶部被覆盖。
- Preview: http://localhost:5174/

## Hypotheses
| ID | Hypothesis | Likelihood | Evidence |
|---|---|---|---|
| A | Arco 注入负 margin-bottom 导致布局重叠 | High | Pending |
| B | 固定列覆盖容器描边 | Medium | Pending |
| C | 隐藏滚动条后仍应用原滚动条高度补偿 | High | Pending |

## Verification
Pre-fix log: Arco injection `margin-bottom: -16px`, measured overlap 16px, summary height 40px.
Same test before injection: margin 0, overlap 0.
Confirmed A/C: scrollbar compensation persists after hiding summary scrollbars.
Fix: override summary margin-bottom and overflow-y; reserve 1px in the 40px container for its bottom border.
Post-fix logs: inline margin remains -16px after Arco compensation, computed margin is 0px and overlap is 0px.
Built preview verified 8 summary tables across TOS and Bytegraph: 40px outer height; 1px container bottom border; zero overlap. Header/summary/body scrollLeft all 350.
Production build passed. Screenshot: .dbg/summary-post-fix.png.
Pending user confirmation before diagnostic cleanup.
