import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { checklistCopyText, checklistSource, checklistStatuses, designChecklist, type ChecklistStatus, type DesignChecklistItem } from './designChecklistData';
import './designChecklist.css';
import repositoryStatuses from './designChecklistStatuses.json';

const storageKey = 'babi.transparency.design-checklist.v2';
const repositoryVersion = JSON.stringify(repositoryStatuses);
type StatusMap = Record<number, ChecklistStatus>;

function readStatuses(): { statuses: StatusMap; error: string } {
  const statuses: StatusMap = {};
  for (const item of designChecklist) {
    const status = repositoryStatuses[String(item.id) as keyof typeof repositoryStatuses];
    if (checklistStatuses.includes(status as ChecklistStatus)) statuses[item.id] = status as ChecklistStatus;
  }
  if (import.meta.env.DEV) return { statuses, error: '' };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (saved?.repositoryVersion === repositoryVersion) {
      for (const item of designChecklist) {
        if (checklistStatuses.includes(saved.statuses?.[item.id])) statuses[item.id] = saved.statuses[item.id];
      }
    }
    return { statuses, error: '' };
  } catch {
    return { statuses, error: '无法读取浏览器缓存，已加载仓库保存的状态。' };
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const previousFocus = document.activeElement as HTMLElement | null;
    const input = document.createElement('textarea');
    input.value = text;
    input.style.cssText = 'position:fixed;top:0;left:-9999px';
    document.body.appendChild(input);
    input.select();
    let success = false;
    try {
      success = document.execCommand('copy');
    } finally {
      input.remove();
      previousFocus?.focus();
    }
    if (!success) throw new Error('copy failed');
  }
}

export default function DesignChecklist() {
  const [initial] = useState(readStatuses);
  const [statuses, setStatuses] = useState<StatusMap>(initial.statuses);
  const [saveError, setSaveError] = useState(initial.error);
  const [filter, setFilter] = useState<ChecklistStatus | '全部'>('全部');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const saveQueue = useRef(Promise.resolve());

  useEffect(() => {
    const title = document.title;
    document.title = '设计调整清单 · 透明化分析';
    return () => { document.title = title; };
  }, []);

  const statusOf = (id: number) => statuses[id] || '待核对';
  const fixedCount = designChecklist.filter(item => statusOf(item.id) === '已修复').length;
  const visible = designChecklist.filter(item =>
    (filter === '全部' || statusOf(item.id) === filter) &&
    `${item.id} ${item.module} ${item.text} ${item.owner || ''}`.includes(search.trim())
  );

  function updateStatus(id: number, status: ChecklistStatus) {
    const next = { ...statuses, [id]: status };
    setStatuses(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ repositoryVersion, statuses: next }));
      setSaveError('');
    } catch {
      setSaveError('状态已更新，但无法保存到浏览器；刷新后可能丢失。');
    }
    if (import.meta.env.DEV) {
      setNotice('正在保存状态到仓库…');
      saveQueue.current = saveQueue.current.then(async () => {
        try {
          const response = await fetch('/__design-checklist/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status }),
          });
          if (!response.ok) throw new Error('save failed');
          setSaveError('');
          setNotice(`第 ${id} 条状态已保存到仓库`);
        } catch {
          setSaveError('状态尚未写入仓库，请检查开发服务后重新选择状态；提交前请确认保存成功。');
          setNotice('');
        }
      });
    }
  }

  async function copyItem(item: DesignChecklistItem) {
    try {
      await copyText(checklistCopyText(item));
      setNotice(`已复制第 ${item.id} 条的完整文字`);
    } catch {
      setNotice(`第 ${item.id} 条复制失败，请选中文字手动复制。`);
    }
  }

  return <main className="design-checklist">
    <div className="checklist-container">
      <nav className="checklist-nav">
        <Link to="/finance/sell/transparency">← 返回透明化分析</Link>
        <a href={checklistSource} target="_blank" rel="noreferrer">查看原始清单 ↗</a>
      </nav>
      <header className="checklist-heading">
        <div>
          <span className="checklist-eyebrow">透明化分析 · 2026-11-16</span>
          <h1>设计调整清单</h1>
          <p>来源：飞书妙记「对对 设计demo」 · 参会人：胡垠、白旭</p>
        </div>
        <div className="checklist-progress">
          <strong>{fixedCount}<span> / {designChecklist.length}</span></strong>
          <span>已修复</span>
          <progress value={fixedCount} max={designChecklist.length} aria-label="修复进度" />
        </div>
      </header>
      <p className="checklist-help">{import.meta.env.DEV ? '状态从仓库读取，每次修改自动写入仓库文件；提交并推送后，其他电脑拉取即可同步。' : '状态从仓库读取，页面修改仅保存在当前浏览器；跨电脑同步请在本地开发环境修改并提交仓库文件。'}复制包含序号、完整要求和参考链接。</p>
      {saveError && <p className="checklist-warning" role="alert">{saveError}</p>}
      <section className="checklist-toolbar" aria-label="筛选清单">
        <div className="checklist-filters">
          {(['全部', ...checklistStatuses] as const).map(status =>
            <button key={status} type="button" aria-pressed={filter === status} onClick={() => setFilter(status)}>
              {status}<span>{status === '全部' ? designChecklist.length : designChecklist.filter(item => statusOf(item.id) === status).length}</span>
            </button>
          )}
        </div>
        <input type="search" aria-label="搜索序号、模块或调整内容" placeholder="搜索序号、模块或内容" value={search} onChange={e => setSearch(e.target.value)} />
      </section>
      <div className="checklist-result-line"><span>显示 {visible.length} 条 / 共 21 条</span><span role="status" aria-live="polite">{notice}</span></div>
      <ol className="checklist-items">
        {visible.map(item => <li key={item.id} value={item.id} className={`checklist-item checklist-status-${checklistStatuses.indexOf(statusOf(item.id))}`}>
          <span className="checklist-number">{String(item.id).padStart(2, '0')}</span>
          <div className="checklist-item-content">
            <div className="checklist-tags">
              <span>{item.module}</span>
              <span className={`checklist-priority-${item.priority}`}>{item.priority}</span>
              {item.owner && <span>@{item.owner}</span>}
            </div>
            <p>{item.text}</p>
            {item.references?.map(ref => <a className="checklist-reference" key={ref.url} href={ref.url} target="_blank" rel="noreferrer">{ref.label} ↗</a>)}
          </div>
          <div className="checklist-actions">
            <label htmlFor={`checklist-status-${item.id}`}>状态</label>
            <select id={`checklist-status-${item.id}`} aria-label={`第 ${item.id} 条状态`} value={statusOf(item.id)} onChange={e => updateStatus(item.id, e.target.value as ChecklistStatus)}>
              {checklistStatuses.map(status => <option key={status}>{status}</option>)}
            </select>
            <button type="button" aria-label={`复制第 ${item.id} 条完整文字`} onClick={() => copyItem(item)}>复制文字</button>
          </div>
        </li>)}
      </ol>
      {visible.length === 0 && <div className="checklist-empty">没有符合条件的条目。<button type="button" onClick={() => { setSearch(''); setFilter('全部'); }}>显示全部</button></div>}
    </div>
  </main>;
}
