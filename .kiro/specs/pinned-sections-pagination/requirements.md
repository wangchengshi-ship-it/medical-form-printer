# Requirements Document

## Introduction

本需求文档定义了 `medical-form-printer` 库的**溢出字段分页渲染**功能。库已实现溢出字段处理的核心逻辑（`overflow-handler.ts`），但 `paginated-renderer.ts` 尚未集成该功能。本需求旨在完成集成，使库能够正确渲染溢出字段的分页效果。

**背景**：
- 前端 `PrintModeForm.vue` 已实现溢出字段分页（如"护理要点"字段）
- `medical-form-printer` 库的 `overflow-handler.ts` 已实现核心逻辑
- `paginated-renderer.ts` 需要集成溢出字段渲染

**重要说明**：分页配置完全由后端模板（`printSchema.pagination`）控制。

## Glossary

- **Overflow_Field**: 溢出字段，内容过长需要分页显示的字段（如 textarea 类型的"护理要点"）
- **Overflow_Handler**: 溢出处理器（`overflow-handler.ts`），提供 `getOverflowFirstLine`、`getOverflowRest` 等函数
- **Paginated_Renderer**: 分页渲染器（`paginated-renderer.ts`），负责将分页结果渲染为 HTML
- **Continuation_Page**: 续页，即第一页之后的所有页面
- **First_Line**: 第一页显示的截断内容
- **Rest_Content**: 续页显示的剩余内容

## Requirements

### Requirement 1: 识别溢出字段 Section

**User Story:** As a paginated renderer, I want to identify which sections contain overflow fields, so that I can apply special rendering logic.

#### Acceptance Criteria

1. WHEN `printSchema.pagination.overflowFields` is configured, THE Paginated_Renderer SHALL identify sections containing these fields
2. WHEN a section of type `info-grid` contains an overflow field, THE Paginated_Renderer SHALL mark it for special handling
3. THE Paginated_Renderer SHALL support multiple overflow fields in the configuration

### Requirement 2: 第一页渲染溢出字段

**User Story:** As a paginated renderer, I want to render overflow fields on the first page with truncated content and a continuation marker, so that users know there is more content.

#### Acceptance Criteria

1. WHEN rendering an overflow field on the first page, THE Paginated_Renderer SHALL display truncated content using `getOverflowFirstLine`
2. WHEN the overflow field has continuation content, THE Paginated_Renderer SHALL append "（续见附页）" marker
3. THE truncation length SHALL be configurable via `pagination.overflowFirstLineChars` (default 60)
4. WHEN the overflow field has no continuation content, THE Paginated_Renderer SHALL render it normally without marker

### Requirement 3: 续页渲染溢出字段

**User Story:** As a paginated renderer, I want to render the remaining content of overflow fields on continuation pages, so that all content is displayed.

#### Acceptance Criteria

1. WHEN rendering a continuation page with overflow content, THE Paginated_Renderer SHALL display the field label with "（续）" suffix
2. WHEN rendering overflow content, THE Paginated_Renderer SHALL use `getOverflowRest` to get remaining content
3. THE continuation content SHALL preserve whitespace and line breaks (pre-wrap)
4. THE Paginated_Renderer SHALL only create continuation pages when `hasOverflowContent` returns true

### Requirement 4: 与现有分页功能集成

**User Story:** As a template developer, I want overflow field pagination to work with existing pagination features, so that I can use them together.

#### Acceptance Criteria

1. WHEN both `overflowFields` and `smartPagination` are configured, THE Paginated_Renderer SHALL handle both correctly
2. WHEN `showSignatureOnEachPage` is true, THE Paginated_Renderer SHALL show signature on overflow continuation pages
3. THE overflow field pagination SHALL work with the existing page header rendering (adding "（续）" suffix)

### Requirement 5: CSS 样式支持

**User Story:** As a paginated renderer, I want to generate appropriate CSS for overflow field rendering, so that the output looks correct.

#### Acceptance Criteria

1. THE Paginated_Renderer SHALL generate CSS class `.overflow-first-line` for first page truncated content
2. THE Paginated_Renderer SHALL generate CSS class `.overflow-continuation` for continuation page content
3. THE CSS SHALL include `.see-next` class for the "（续见附页）" marker styling
4. THE continuation content SHALL use `white-space: pre-wrap` for proper text formatting
