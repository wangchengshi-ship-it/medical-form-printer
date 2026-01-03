# Implementation Plan: Font Isolation

## Overview

为 `@medical/print-renderer` 库实现强制字体绑定和 CSS 隔离功能。实现分为 5 个主要阶段：字体资源准备、字体模块实现、CSS 隔离模块、渲染器改造、测试验证。

## Tasks

- [-] 1. 准备字体资源
  - [ ] 1.1 获取思源宋体 SC Regular 字体文件
    - 从 Google Fonts 或 Adobe 官方下载 Source Han Serif SC Regular
    - 使用 fonttools/pyftsubset 进行字符子集化（保留常用 6000-8000 汉字）
    - 转换为 woff2 格式
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  - [ ] 1.2 创建字体数据文件
    - 将 woff2 文件转换为 Base64 编码
    - 创建 `src/fonts/font-data.ts` 导出 Base64 字符串
    - _Requirements: 1.4, 2.3_

- [ ] 2. 实现字体模块
  - [ ] 2.1 创建字体 CSS 生成器
    - 创建 `src/fonts/font-css.ts`
    - 实现 `getFontCss()` 生成 @font-face 声明
    - 包含 font-display: block, font-synthesis: none
    - _Requirements: 2.3, 2.5, 6.1, 6.2_
  - [ ] 2.2 实现字体加载器
    - 创建 `src/fonts/font-loader.ts`
    - 实现 `isFontLoaded()` 同步检查
    - 实现 `waitForFonts(options)` 异步等待
    - 实现超时和错误处理
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ] 2.3 创建字体模块入口
    - 创建 `src/fonts/index.ts`
    - 导出 `getFontDataUrl()`, `getFontCss()`, `isFontLoaded()`, `waitForFonts()`
    - _Requirements: 4.4, 5.1, 5.2_
  - [ ]*2.4 编写字体模块单元测试
    - 测试 `getFontDataUrl()` 返回有效 data URL
    - 测试 `getFontCss()` 包含正确的 @font-face
    - 测试 `isFontLoaded()` 返回布尔值
    - _Requirements: 5.1, 5.2_

- [ ] 3. 实现 CSS 隔离模块
  - [ ] 3.1 创建命名空间工具
    - 创建 `src/styles/isolation.ts`
    - 定义 `CSS_NAMESPACE = 'mpr'`
    - 实现 `namespaceClass()` 和 `namespaceClasses()`
    - _Requirements: 3.6_
  - [ ] 3.2 实现隔离容器样式生成
    - 实现 `generateIsolationCss()`
    - 包含 all: initial, contain: strict, isolation: isolate
    - 添加字体强制覆盖规则（!important）
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 2.4_
  - [ ] 3.3 扩展 CSS 生成器
    - 修改 `src/styles/css-generator.ts`
    - 添加 `generateIsolatedCss()` 函数
    - 整合字体 CSS、隔离 CSS 和组件 CSS
    - 忽略传入的字体配置
    - _Requirements: 2.1, 2.2_
  - [ ]*3.4 编写 CSS 隔离模块单元测试
    - 测试 `namespaceClass()` 正确添加前缀
    - 测试 `generateIsolationCss()` 包含所有隔离属性
    - _Requirements: 3.2, 3.3, 3.4, 3.6_

- [ ] 4. 改造渲染器
  - [ ] 4.1 更新类名映射
    - 修改所有渲染器中的类名，添加 `mpr-` 前缀
    - 更新 `src/renderer/html-renderer.ts`
    - 更新 `src/pagination/paginated-renderer.ts`
    - 更新所有 section renderers
    - _Requirements: 3.6_
  - [ ] 4.2 添加隔离容器包装
    - 修改 `renderToHtml()` 输出结构
    - 添加 `<div class="mpr-root">` 包装
    - 将 CSS 内嵌到隔离容器内的 `<style>` 标签
    - _Requirements: 3.1, 4.2_
  - [ ] 4.3 更新分页渲染器
    - 修改 `renderPaginatedHtml()` 使用隔离结构
    - 确保多页输出共享同一隔离容器
    - _Requirements: 3.1, 4.2_
  - [ ] 4.4 更新打印样式
    - 添加打印媒体查询中的字体平滑禁用
    - 确保 @page 规则在隔离容器内生效
    - _Requirements: 6.3_

- [ ] 5. 属性测试和验证
  - [ ]*5.1 编写 Property 1 测试：Font Enforcement
    - **Property 1: Font Enforcement**
    - **Validates: Requirements 2.1, 2.3, 2.4**
    - 使用 fast-check 生成随机 PrintSchema 和 FormData
    - 验证输出 CSS 包含唯一 @font-face 声明
    - 验证 font-family 使用 !important
  - [ ]*5.2 编写 Property 2 测试：CSS Isolation
    - **Property 2: CSS Isolation Container**
    - **Validates: Requirements 3.1, 3.5, 3.6**
    - 验证输出 HTML 包含 mpr-root 容器
    - 验证所有类名都有 mpr- 前缀
  - [ ]*5.3 编写 Property 3 测试：External Config Ignored
    - **Property 3: External Font Config Ignored**
    - **Validates: Requirements 2.2**
    - 生成随机字体配置传入 renderToHtml
    - 验证输出字体始终为 Source Han Serif SC
  - [ ]*5.4 编写 Property 4 测试：Font Data Embedding
    - **Property 4: Font Data Embedding**
    - **Validates: Requirements 4.2**
    - 验证 style 标签包含 data:font/woff2;base64

- [ ] 6. Checkpoint - 确保所有测试通过
  - 运行 `npm run test` 确保所有测试通过
  - 运行 `npm run build` 确保构建成功
  - 如有问题，询问用户

- [ ] 7. 更新导出和文档
  - [ ] 7.1 更新主入口导出
    - 修改 `src/index.ts` 导出字体相关 API
    - 导出 `getFontDataUrl`, `getFontCss`, `isFontLoaded`, `waitForFonts`
    - 导出 `CSS_NAMESPACE`, `ISOLATION_ROOT_CLASS`
    - _Requirements: 4.4, 5.1, 5.2_
  - [ ] 7.2 更新 Storybook 示例
    - 更新现有 stories 使用新的隔离渲染
    - 添加字体加载状态展示
    - _Requirements: 4.1_

- [ ] 8. Final Checkpoint - 最终验证
  - 确保所有测试通过
  - 确保 Storybook 正常显示
  - 如有问题，询问用户

## Notes

- 任务标记 `*` 为可选测试任务，可跳过以加快 MVP 开发
- 字体子集化需要使用 fonttools，可能需要 Python 环境
- 如果字体文件过大（>2MB），考虑进一步精简字符集
- 属性测试使用 fast-check 库，已在 devDependencies 中
