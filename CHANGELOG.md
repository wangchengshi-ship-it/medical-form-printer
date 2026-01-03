# Changelog

本文件记录 `@medical/print-renderer` 的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added

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
