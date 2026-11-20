import { cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const buildDir = fileURLToPath(new URL('../dist/', import.meta.url));
const publishDir = fileURLToPath(new URL('../docs/', import.meta.url));

for (const entry of ['index.html', 'topology-flow-preview.html', 'topology-playground.html', 'chart-guide-preview.html', 'filter-guide-preview.html', 'assets']) {
  if (!existsSync(`${buildDir}/${entry}`)) {
    throw new Error(`构建文件缺失：${entry}，请先完成 npm run build。`);
  }
}

cpSync(buildDir, publishDir, { recursive: true });
console.log('已同步正式构建到 Vercel 发布目录 docs。');
