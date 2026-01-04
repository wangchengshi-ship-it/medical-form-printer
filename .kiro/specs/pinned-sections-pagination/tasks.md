# Implementation Plan: Overflow Field Pagination

## Overview

本实现计划将 `overflow-handler.ts` 的核心逻辑集成到 `paginated-renderer.ts` 中，实现溢出字段的分页渲染功能。采用增量开发方式，确保每个步骤都可验证。

**当前状态**：`overflow-handler.ts` 已实现核心逻辑（`getOverflowFirstLine`, `getOverflowRest`, `hasOverflowContent`, `processOverflowFields`），但 `paginated-renderer.ts` 尚未集成这些功能。

## Tasks

- [x] 1. 扩展类型定义
  - [x] 1.1 在 `pagination/types.ts` 中添加国际化文本配置类型
    - 添加 `OverflowTextConfig` 类型定义
    - 添加 `DEFAULT_OVERFLOW_TEXT` 常量（中文：续见附页、续）
    - 添加 `ENGLISH_OVERFLOW_TEXT` 常量（英文：continued on next page、continued）
    - _Requirements: 5.1_
  - [x] 1.2 扩展 `PaginatedRenderConfig` 类型
    - 在 `paginated-renderer.ts` 中添加 `overflowText?: Partial<OverflowTextConfig>` 属性
    - 更新 `DEFAULT_PAGINATED_RENDER_CONFIG` 默认值
    - 更新 JSDoc 注释说明国际化用法
    - _Requirements: 5.1_
  - [x] 1.3 编写类型定义单元测试 ✅ `test/overflow-types.test.ts`
    - 测试 `OverflowTextConfig` 类型导出正确
    - 测试 `DEFAULT_OVERFLOW_TEXT` 和 `ENGLISH_OVERFLOW_TEXT` 常量值正确
    - _Requirements: 5.1_

- [x] 2. 实现溢出字段识别逻辑
  - [x] 2.1 创建 `pagination/overflow-pagination.ts` 模块
    - 添加文件级注释（英文，遵循 Google Style）
    - 实现 `isOverflowSection(section, overflowFields)` 函数 - 检查 info-grid section 是否包含溢出字段
    - 实现 `findOverflowFieldLabel(section, fieldName)` 函数 - 从 info-grid 配置中提取字段标签
    - 实现 `getOverflowFieldsFromConfig(paginationConfig)` 函数 - 从 PaginationConfig 提取溢出字段配置
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 2.2 编写属性测试 - Overflow Field Identification
    - **Property 1: Overflow Field Identification**
    - *For any* printSchema with `pagination.overflowFields` configured and *for any* section of type `info-grid`, the renderer should correctly identify whether the section contains an overflow field
    - **Validates: Requirements 1.1, 1.2, 1.3**

- [x] 3. 实现第一页溢出字段渲染
  - [x] 3.1 在 `overflow-pagination.ts` 中实现 `renderOverflowFirstLine` 函数
    - 接收参数：section, overflowResult, textConfig, cls (class name function)
    - 调用已有的 `getOverflowFirstLine` 获取截断内容
    - 当有续页内容时添加红色 **"（续见附页）"** 标记（使用 textConfig.seeNextMarker）
    - 参考前端效果：`1. 母乳喂养指导，按需哺乳 (续见附页)`
    - 应用 CSS 类名 `.overflow-first-line`, `.see-next`（红色样式）
    - 返回渲染后的 HTML 字符串
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 3.2 编写属性测试 - First Page Overflow Rendering
    - **Property 2: First Page Overflow Rendering**
    - *For any* overflow field with content, the first page rendering should display truncated content and append marker when there is continuation content
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [x] 4. 实现续页溢出字段渲染
  - [x] 4.1 在 `overflow-pagination.ts` 中实现 `renderOverflowContinuation` 函数
    - 接收参数：overflowResult, fieldLabel, textConfig, cls
    - 调用已有的 `getOverflowRest` 获取剩余内容
    - 添加字段标签 + **"（续）"** 后缀（使用 textConfig.continuationSuffix）
    - 参考前端效果：`婴儿护理要点（不足书写请加附页）（续）：`
    - 应用 CSS 类名 `.overflow-continuation`, `.overflow-label`, `.overflow-content`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 4.2 在 `overflow-pagination.ts` 中实现 `renderOverflowContinuationPage` 函数
    - 接收参数：ctx (SinglePageContext), overflowResults, fieldLabels, cls
    - 渲染页头：标题带 **"（续）"** 后缀，如 `新生儿入院评估单（续）`
    - 渲染所有有溢出内容的字段（保留换行格式）
    - 条件渲染签名区域（根据 showSignatureOnEachPage 配置）
    - _Requirements: 3.1, 4.2, 4.3_
  - [x] 4.3 编写属性测试 - Continuation Page Overflow Rendering
    - **Property 3: Continuation Page Overflow Rendering**
    - *For any* overflow field with continuation content, the continuation page should display the field label with suffix and remaining content
    - **Validates: Requirements 3.1, 3.2, 3.4**

- [x] 5. 集成到 `paginated-renderer.ts`
  - [x] 5.1 修改 `renderPaginatedHtml` 函数
    - 从 schema.pagination 或 config 中提取溢出字段配置
    - 调用已有的 `processOverflowFields` 处理溢出字段
    - 使用 `hasAnyOverflowContent` 判断是否需要创建溢出续页
    - 将 overflowResults 添加到渲染上下文
    - _Requirements: 4.1_
  - [x] 5.2 修改第一页渲染逻辑
    - 在 `renderPageBody` 或 `renderContentItem` 中识别溢出 section
    - 对溢出 section 调用 `renderOverflowFirstLine` 替代默认渲染
    - 保持非溢出 section 正常渲染
    - _Requirements: 2.1, 2.2_
  - [x] 5.3 添加续页渲染逻辑
    - 在智能分页页面后添加溢出续页（调用 `renderOverflowContinuationPage`）
    - 正确处理页码（溢出续页计入总页数）
    - 更新 `totalPages` 计算逻辑
    - _Requirements: 3.1, 4.1_
  - [x] 5.4 编写属性测试 - Integration with Existing Features
    - **Property 4: Integration with Existing Features**
    - *For any* configuration combining `overflowFields` with other pagination features, the renderer should handle both correctly
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [-] 6. 生成 CSS 样式
  - [x] 6.1 扩展 `generatePaginationCss` 函数
    - 添加 `.overflow-first-line` 样式（截断内容容器）
    - 添加 `.overflow-continuation` 样式（续页内容容器）
    - 添加 `.see-next` 样式（**红色**"续见附页"标记，参考前端效果）
    - 添加 `.overflow-label` 样式（字段标签，带"（续）"后缀）
    - 添加 `.overflow-content` 样式（`white-space: pre-wrap` 保留换行，显示多行内容）
    - 支持隔离模式（mpr- 前缀）
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 6.2 编写 CSS 生成单元测试
    - 验证所有溢出相关 CSS 类名存在
    - 验证 `.overflow-content` 包含 `white-space: pre-wrap`
    - 验证隔离模式下类名有 `mpr-` 前缀
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. Checkpoint - 核心功能验证
  - 运行所有测试确保通过：`bun run test`
  - 检查 TypeScript 编译无错误：`bun run build`
  - 如有问题请询问用户

- [x] 8. 创建 Storybook 故事
  - [x] 8.1 创建 `stories/pagination/OverflowPagination.stories.ts`
    - 添加 BasicOverflow 故事 - 单个溢出字段基础场景
    - 添加 NoOverflow 故事 - 内容较短无需分页
    - 添加 WithSignatureOnEachPage 故事 - 续页显示签名
    - 添加 EnglishText 故事 - 使用 ENGLISH_OVERFLOW_TEXT 配置
    - _Requirements: 全部_
  - [x] 8.2 更新 `stories/forms/NewbornNursing.stories.ts`
    - 添加 WithOverflowPagination 故事 - 护理要点字段溢出示例
    - _Requirements: 全部_

- [x] 9. 更新模块导出
  - [x] 9.1 更新 `pagination/index.ts`
    - 导出 `OverflowTextConfig` 类型
    - 导出 `DEFAULT_OVERFLOW_TEXT`, `ENGLISH_OVERFLOW_TEXT` 常量
    - 导出 `isOverflowSection`, `findOverflowFieldLabel` 函数
    - 导出 `renderOverflowFirstLine`, `renderOverflowContinuation` 函数
    - _Requirements: 5.1_
  - [x] 9.2 更新 `src/index.ts`
    - 确保新增的公共 API 正确导出
    - 添加类型导出到 `export type` 块
    - _Requirements: 5.1_

- [x] 10. Final Checkpoint - 完整验证
  - [x] 运行所有测试确保通过：`bun run test` (854/854 tests pass)
  - [ ] 运行 Storybook 验证故事：`bun run storybook` (manual verification)
  - [x] 运行构建确保成功：`bun run build`
  - 如有问题请询问用户

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All code comments must be in English
- All user-visible text must use i18n configuration
- 已有的 `overflow-handler.ts` 提供核心逻辑，本任务主要是集成到渲染器
