import ReactDOM from 'react-dom/client';
import '@arco-design/theme-ve-o-design/css/arco.css';
import 'react-grid-layout/css/styles.css';
import './app/styles/global.less';
import '@tod-m/materials/es/XSideMenu/style/index.less';
import './app/component/AutoTip/style.css';
import './style.css';
import { App } from './App';

// References: none — explicit contracts for the existing prototype shell globals, kept outside generated resource declarations.
declare global {
  interface Window {
    __user: { username: string; nickname: string; email: string; picture: string };
    __hiddenWm?: string;
    _babi_load_error_page?: boolean;
    _babi_pre_interface: { permission: Record<string, Record<string, string[]>>; allMenus: (typeof import('./adapters/babiTools').projectConfig)['allMenus'] };
    projectData: Record<string, unknown>;
    TEA: { event: (...args: unknown[]) => void; sdkReady: boolean };
    bytecloudLogout: () => void;
    gfdatav1?: { env?: string; canary?: number; envName?: string; extra?: { canaryType?: number } };
    WebKitMutationObserver?: typeof MutationObserver;
  }
}

window.__user = window.__user || {
  username: 'demo.user',
  nickname: 'Demo User',
  email: 'demo.user@bytedance.com',
  picture: '',
};
window._babi_pre_interface = window._babi_pre_interface || { permission: {}, allMenus: [] };
window.projectData = window.projectData || {};
window.TEA = window.TEA || { event: () => {}, sdkReady: true };
window.bytecloudLogout = window.bytecloudLogout || (() => {});
localStorage.setItem('workspace_personal_guide_visible', 'false');
localStorage.setItem('workbench_role_tab', 'personal');

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
