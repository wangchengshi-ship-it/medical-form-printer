# Changelog

本文件记录 `@medical/print-renderer` 的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added

- 测试工具模块 `src/test-utils/placeholder-data.ts`
  - `PLACEHOLDER` - 通用占位数据常量（医院、患者、员工、位置、表单、水印）
  - `SAMPLE_MATERNAL_DATA` - 产妇入院评估示例数据
  - `SAMPLE_NEWBORN_DATA` - 新生儿护理记录示例数据
  - `SAMPLE_DAILY_LOG_DATA` - 每日护理记录示例数据
  - `SAMPLE_DISCHARGE_DATA` - 出院评估示例数据
  - 用于 Storybook stories 和测试，替代真实敏感数据

### Changed

- **paginated-renderer 模块国际化**：
  - 文件级注释和函数注释翻译为英文（开源准备）
  - 默认续页标题后缀从 `(续)` 改为 `(continued)`
  - 默认页码格式从 `第 {current} 页 / 共 {total} 页` 改为 `Page {current} of {total}`
  - 中文用户可通过 `PaginatedRenderConfig` 自定义为中文格式
- **info-grid 区块国际化**：
  - 标签后的中文冒号 `：` 改为英文冒号 `:`
  - 默认 `checkbox-inline` 选项从 `['无', '有']` 改为 `['No', 'Yes']`
  - 所有中文注释翻译为英文（开源准备）
- **signature-area 区块国际化**：
  - 日期标签从 `日期：` 改为 `Date:`
  - 标签后的中文冒号 `：` 改为英文冒号 `:`
  - 文件级注释和函数注释翻译为英文（开源准备）
- **default-theme 模块国际化**：
  - 文件级注释和函数注释翻译为英文（开源准备）
  - 移除字体配置中的中文别名（`"宋体"` → 移除，`"黑体"` → 移除），保留 SimSun/SimHei 作为主要字体名
- **print-schema 类型定义国际化**：
  - 文件级注释翻译为英文（开源准备）
  - 类型注释从中文翻译为英文（`页面尺寸` → `Page size`，`页面方向` → `Page orientation` 等）
- **16K 纸张样式重构**：
  - 同时设置 `height` 和 `min-height` 为相同值，确保页面高度与物理打印尺寸完全匹配
  - 添加 `overflow: hidden` 防止内容溢出导致分页问题
  - 添加专用内边距 `padding: 8mm 10mm`，与前端 Vue 组件保持一致
  - 横向模式同步更新：`padding: 10mm 8mm`，`overflow: hidden`
- 默认页面边距从 20mm 改为 10mm，与前端 Vue 组件保持一致（Vue 组件使用 `8mm 10mm`，这里使用 10mm 作为基准）
- `formatBoolean` 函数的未选中符号从 `☐` (U+2610 BALLOT BOX) 改为 `□` (U+25A1 WHITE SQUARE)，与前端 Vue 组件保持一致
- 改进 `checkbox-inline` 类型的值匹配逻辑：
  - 布尔值：`index 0` 对应 `false`（如"无"），`index 1` 对应 `true`（如"有"）
  - 字符串值：直接与选项文本比较
  - 数字值：与选项索引比较
  - 移除对特定选项文本（"有"/"是"）的硬编码依赖，改为基于索引的通用逻辑
- 重构 `info-grid` 区块渲染器 (v2.0.0)：
  - 从表格布局（`<table>/<tr>/<td>`）改为 flex 布局（`<div>/<span>`）
  - 新增下划线填空样式，格式：`标签：______值______`
  - 移除 `formatValue` 依赖，改用内部 `getCellValue` 函数处理值格式化
  - 新增 `checkbox-text` 类型渲染：`☑/□ + 文本`
  - 新增 `textarea` 类型渲染：标签+内容自然换行
  - 新增空标签行支持：只显示下划线
  - 优化 `checkbox-inline` 渲染逻辑
  - 优化 `compound` 复合字段处理

### Added

- 隔离模式 HTML 渲染器
  - `renderToIsolatedHtml` - 渲染完整的隔离 HTML 文档
  - `renderToIsolatedFragment` - 渲染隔离 HTML 片段（用于嵌入现有页面）
  - 所有类名自动添加 `mpr-` 前缀
  - 字体强制使用内嵌的思源宋体 SC（忽略传入的字体配置）
  - 支持水印和水印透明度配置
- 分页渲染器隔离模式支持
  - `renderPaginatedHtml` 新增 `config.isolated` 选项
  - 多页共享单个 `.mpr-root` 隔离容器
  - 所有分页类名支持 `mpr-` 前缀（如 `mpr-print-page`、`mpr-continuation-page`）
  - `generatePaginationCss` 新增 `isolated` 参数，生成命名空间化的分页 CSS
- 字体隔离功能
  - `getFontCss` - 获取完整的字体 CSS（@font-face + 强制覆盖规则）
  - `getFontDataUrl` - 获取 Base64 编码的字体 Data URL
  - `generateFontFace` - 生成 @font-face 声明
  - `generateFontOverrideCss` - 生成字体强制覆盖 CSS
  - `isFontLoaded` - 同步检查字体加载状态
  - `waitForFonts` - 异步等待字体加载完成
  - 内嵌思源宋体 SC（子集化 woff2 格式）
- Storybook 示例
  - `FontIsolation/字体隔离` - 字体隔离功能交互式示例
    - 隔离渲染（完整文档）- 使用 iframe 展示完整 HTML 文档
    - 隔离渲染（HTML 片段）- 嵌入式片段渲染
    - 样式隔离测试 - 验证外部样式不影响隔离容器
    - 带水印的隔离渲染 - 水印功能演示
    - 字体加载 API - API 使用方法演示
- CSS 隔离模块
  - `CSS_NAMESPACE` - CSS 命名空间前缀常量 (`mpr`)
  - `ISOLATION_ROOT_CLASS` - 隔离容器根类名 (`mpr-root`)
  - `namespaceClass` - 为类名添加命名空间前缀
  - `namespaceClasses` - 批量转换类名
  - `generateIsolationCss` - 生成隔离容器样式（contain: layout style, isolation: isolate）
  - `generateIsolatedCss` - 生成完整的隔离 CSS（字体 + 隔离容器 + 带命名空间的组件样式）
  - `CLASS_NAME_MAP` - 类名映射表
  - `getNamespacedClass` - 获取命名空间类名
- 导出 `DeepPartial<T>` 工具类型，用于深层部分类型定义
- `SpacingConfig` 类型新增 10 个间距属性，与 `base-unit.ts` 中的 `SIZE_MULTIPLIERS.spacing` 保持一致：
  - `headerMarginBottom` - 页眉底部间距
  - `departmentMarginTop` - 科室名称顶部间距
  - `titleMarginTop` - 表单标题顶部间距
  - `signatureGap` - 签名区域间距
  - `signatureMarginTop` - 签名区域顶部间距
  - `signatureLineWidth` - 签名线最小宽度
  - `freeTextMinHeight` - 自由文本最小高度
  - `footerMarginTop` - 页脚顶部间距
  - `xs` - 小间距 (2mm)
  - `sm` - 中间距 (3mm)

### Changed

- 隔离模式配置 `ISOLATED_CONFIG.namespaced` 改为 `true`，section renderers 现已完整支持命名空间前缀
- 重构 `src/renderer/templates/index.ts` (v1.2.0)：
  - 增强类型安全，引入 `PaginatedPageContext` 接口消除非空断言
  - 页码格式化提取为可配置项 `DEFAULT_PAGE_NUMBER_FORMAT`
  - 提取公共页脚渲染逻辑
  - 新增 `formatPageNumber` 工具函数
- 重构 `src/renderer/templates/index.ts` (v1.1.0)：
  - 提取 CSS 类名常量，避免魔法字符串
  - 新增 `hasWatermarkOptions` 类型守卫，改进类型安全
  - 新增 `renderHeaderContent` 和 `renderBodyWrapper` 公共方法到基类，供子类复用
  - 减少 `SinglePageRenderer` 和 `PaginatedPageRenderer` 中的重复代码
- 新增 `src/utils/watermark.ts` 水印工具模块，提供统一的水印渲染功能：
  - `renderWatermarkHtml` - 渲染水印 HTML，支持自定义类名和透明度
  - `extractWatermarkOptions` - 从渲染选项中提取水印配置
  - `clamp` - 数值范围限制工具函数
  - `normalizeOpacity` - 透明度值安全处理
- `renderWatermark` 函数添加 `watermarkOpacity` 参数范围验证，超出 0-1 范围的值会被自动 clamp
- 重构 `isolated-html-renderer.ts`：
  - 新增 `IsolatedRenderOptions` 接口，扩展 `RenderOptions` 添加水印相关选项
  - 提取 `RenderContext` 内部类型，统一管理渲染上下文
  - 新增 `createRenderContext` 函数，消除 `renderToIsolatedHtml` 和 `renderToIsolatedFragment` 之间的重复代码
  - 新增 `renderIsolatedContent` 函数，统一隔离容器内容渲染逻辑
  - 简化内部函数命名（移除 `Isolated` 前缀）
- 签名区域 `.signature-label` 添加 `white-space: nowrap` 样式，防止标签文字换行
- 移除 `createRenderConfigFromPaginationConfig` 中对已废弃扁平配置字段的回退逻辑，简化内部实现
- 重构 `css-generator.ts`：将单一大函数拆分为多个职责单一的小函数，提升代码可维护性
- `mergeTheme` 函数改用自定义深度合并实现，正确处理嵌套主题配置
- CSS 生成器使用 `PAGE_SIZES` 常量替代硬编码的页面尺寸值
- `mergeTheme` 函数参数类型从 `Partial<Theme>` 改为 `DeepPartial<Theme>`，支持深层嵌套的主题配置覆盖

## [0.1.0] - 2026-01-03

### Added

- 核心渲染功能
  - `renderToHtml` - 将 PrintSchema 和表单数据渲染为 HTML
  - `renderToPdf` - 生成 PDF（Node.js 环境，需要 Puppeteer）
  - `mergePdfs` - 合并多个 PDF 文档

- 区块渲染器
  - `info-grid` - 信息网格
  - `table` - 数据表格
  - `checkbox-grid` - 勾选框网格
  - `signature-area` - 签名区域
  - `notes` - 静态备注
  - `free-text` - 自由文本
  - `registerSectionRenderer` - 自定义区块渲染器注册

- 智能分页系统
  - `calculatePageBreaks` - 分页计算
  - `calculateUsableHeight` - 可用高度计算
  - `renderPaginatedHtml` - 分页渲染
  - 页面尺寸预设：`PAGE_16K`、`PAGE_A4`、`PAGE_A5`
  - 单位转换：`mmToPx`、`pxToMm`

- 溢出字段处理
  - `getOverflowFirstLine` - 获取第一页内容
  - `getOverflowRest` - 获取续页内容
  - `hasOverflowContent` - 检测是否有溢出内容

- 内容测量器（浏览器环境）
  - `createContentMeasurer` - 创建测量器实例
  - `measureElementHeight` - 测量元素高度
  - `estimateTextHeight` - 文本高度估算（降级方案）

- 主题定制
  - 字体、颜色、间距自定义
  - `mergeTheme` - 主题合并

- 类型导出
  - `PrintSchema`、`FormData`、`RenderOptions`
  - `PaginationConfig`、`PageBreakResult`、`MeasurableItem`
  - `PageDimensions`、`PageSizePreset`

[Unreleased]: https://github.com/your-org/medical-print-renderer/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-org/medical-print-renderer/releases/tag/v0.1.0
