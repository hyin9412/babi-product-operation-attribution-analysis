import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { checklistStatuses, designChecklist } from './src/pages/designChecklistData';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const r = (...segments: string[]) => path.resolve(dirname, ...segments);
const legacyLessModuleSuffix = '.legacy.module.less';

const legacyLessModuleQuery = (): Plugin => ({
  name: 'legacy-less-module-query',
  enforce: 'pre',
  async resolveId(source, importer) {
    if (!source.endsWith('.less?module') || !importer) return null;
    const importerPath = importer.split('?')[0];
    const sourcePath = source.slice(0, -'?module'.length);
    const resolved = path.resolve(path.dirname(importerPath), sourcePath);
    return resolved.replace(/\.less$/, legacyLessModuleSuffix);
  },
  load(id) {
    if (!id.endsWith(legacyLessModuleSuffix)) return null;
    const sourcePath = id.slice(0, -legacyLessModuleSuffix.length) + '.less';
    return fs.readFileSync(sourcePath, 'utf8');
  },
});

const checklistPersistence = (): Plugin => ({
  name: 'design-checklist-persistence',
  configureServer(server) {
    server.middlewares.use('/__design-checklist/status', (req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: '仅支持保存状态请求。' }));
        return;
      }
      if (req.headers.origin && ![`http://${req.headers.host}`, `https://${req.headers.host}`].includes(req.headers.origin)) {
        res.statusCode = 403;
        res.end(JSON.stringify({ error: '请从当前开发站点保存。' }));
        return;
      }
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 4096) req.destroy();
      });
      req.on('end', () => {
        try {
          const { id, status } = JSON.parse(body);
          if (!designChecklist.some(item => item.id === id) || !checklistStatuses.includes(status)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: '条目或状态无效。' }));
            return;
          }
          const file = r('src/pages/designChecklistStatuses.json');
          const statuses = JSON.parse(fs.readFileSync(file, 'utf8'));
          statuses[id] = status;
          fs.writeFileSync(`${file}.tmp`, `${JSON.stringify(statuses, null, 2)}\n`, 'utf8');
          fs.renameSync(`${file}.tmp`, file);
          res.end(JSON.stringify({ saved: true }));
        } catch {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: '无法写入仓库状态文件，请检查文件权限。' }));
        }
      });
    });
  },
});

export default defineConfig({
  plugins: [legacyLessModuleQuery(), react(), checklistPersistence()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: [
      { find: /^~(.+)/, replacement: '$1' },
      { find: '@babi/tools', replacement: r('src/adapters/babiTools.tsx') },
      { find: /^@byted-babi\/babi-design$/, replacement: r('src/adapters/babiDesign.tsx') },
      { find: 'adapters', replacement: r('src/adapters') },
      { find: '@src/util/perf', replacement: r('src/adapters/perf.ts') },
      { find: '@src/util/utils', replacement: r('src/adapters/utils.ts') },
      { find: 'APP/api-lib', replacement: r('src/adapters/api-lib') },
      { find: 'APP/public/api/v3/common/tcc', replacement: r('src/adapters/tcc.ts') },
      { find: 'APP/public/component/ErrorBoundary', replacement: r('src/adapters/ErrorBoundary.tsx') },
      { find: 'APP/public/component/SmartWord/SearchIcon', replacement: r('src/adapters/SearchIcon.tsx') },
      { find: 'APP/app', replacement: r('src/adapters/appHistory.ts') },
      { find: 'APP/pages', replacement: r('src/app/pages') },
      { find: 'APP/constants', replacement: r('src/app/constants') },
      { find: 'APP/static', replacement: r('src/app/static') },
      { find: 'PAGES/MonitorAlarm/hooks/useConfig', replacement: r('src/adapters/monitorConfig.ts') },
      { find: 'PAGES/MonitorAlarmManage/MonitorManage/constants', replacement: r('src/adapters/monitorConstants.ts') },
      { find: 'PAGES/MonitorAlarmManage/MonitorManage/type', replacement: r('src/adapters/monitorTypes.ts') },
      { find: 'PAGES/BudgetNew/BasicConfig/BudgetWindow/constant', replacement: r('src/adapters/budgetConstants.ts') },
      { find: 'PAGES/BudgetNew/util/constant', replacement: r('src/adapters/budgetConstants.ts') },
      { find: 'PAGES/Notice/constant', replacement: r('src/adapters/noticeConstants.ts') },
      { find: 'PAGES/OperationCapacity/hooks', replacement: r('src/adapters/operationCapacityHooks.ts') },
      { find: 'PAGES', replacement: r('src/app/pages') },
      { find: 'Service', replacement: r('src/adapters/service') },
      { find: 'TOOLS_COMPONENTS', replacement: r('src/adapters/tools-components') },
      { find: 'src', replacement: r('src') },
    ],
  },
});
