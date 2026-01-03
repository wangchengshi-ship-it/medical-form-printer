import { generateIsolatedCss } from './dist/index.js';
const css = generateIsolatedCss();

// 检查 box-sizing 规则
if (css.includes('box-sizing')) {
  console.log('Found box-sizing rules:');
  const lines = css.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('box-sizing')) {
      // 输出上下文
      console.log('--- Line', i, '---');
      for (let j = Math.max(0, i - 3); j <= Math.min(lines.length - 1, i + 3); j++) {
        console.log(j === i ? '>>> ' + lines[j] : '    ' + lines[j]);
      }
      console.log('');
    }
  }
} else {
  console.log('No box-sizing rules found');
}
