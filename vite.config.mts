import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

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

export default defineConfig({
  plugins: [legacyLessModuleQuery(), react()],
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
