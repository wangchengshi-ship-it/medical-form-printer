import { generateIsolatedCss } from './dist/index.js';
const css = generateIsolatedCss();

// 找到所有 .mpr-print-page 和 .mpr-16k 相关的规则
const lines = css.split('\n');
let inRule = false;
let braceCount = 0;
let output = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // 检查是否是相关规则的开始
  if (line.includes('.mpr-print-page') || line.includes('.mpr-16k')) {
    output.push('--- Rule at line ' + i + ' ---');
    inRule = true;
    braceCount = 0;
  }
  
  if (inRule) {
    output.push(line);
    braceCount += (line.match(/\{/g) || []).length;
    braceCount -= (line.match(/\}/g) || []).length;
    if (braceCount <= 0 && line.includes('}')) {
      inRule = false;
      output.push('');
    }
  }
}

console.log(output.join('\n'));
