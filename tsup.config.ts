import { defineConfig } from 'tsup'

export default defineConfig([
  // 核心渲染库（浏览器 + Node.js）
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
  },
  // Node.js PDF 生成（仅 Node.js）
  {
    entry: ['src/node.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    external: ['puppeteer'],
  },
])
