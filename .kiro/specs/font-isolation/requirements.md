# Requirements Document

## Introduction

为 `@medical/print-renderer` 库实现强制字体绑定和 CSS 隔离功能。确保库在任何环境（浏览器、Node.js PDF 生成）下都使用统一的思源宋体（Source Han Serif / Noto Serif SC），且内部样式完全隔离，不受外部 CSS 影响，也不泄漏到外部。

## Glossary

- **Print_Renderer**: `@medical/print-renderer` 库，负责将表单数据渲染为可打印的 HTML/PDF
- **Source_Han_Serif**: 思源宋体，Adobe 与 Google 合作开发的开源中文宋体字体
- **Font_Bundle**: 字体资源包，包含 woff2/woff 格式的字体文件
- **CSS_Isolation**: CSS 隔离机制，防止样式泄漏和外部样式侵入
- **Shadow_DOM**: Web Components 的样式隔离技术
- **CSS_Containment**: CSS 容器隔离属性（contain、isolation）
- **Base64_Embedding**: 将字体文件编码为 Base64 字符串嵌入 CSS

## Requirements

### Requirement 1: 字体资源整合

**User Story:** As a developer, I want the library to bundle Source Han Serif font, so that the rendered output uses consistent typography across all platforms.

#### Acceptance Criteria

1. THE Print_Renderer SHALL include Source_Han_Serif font files (Regular weight) in the npm package
2. THE Font_Bundle SHALL use woff2 format as primary with woff as fallback for browser compatibility
3. THE Font_Bundle SHALL support both Simplified Chinese (SC) character set
4. WHEN the library is imported, THE Print_Renderer SHALL NOT require external font downloads or CDN access
5. THE Font_Bundle file size SHALL be optimized through subsetting to include only commonly used CJK characters (approximately 6,000-8,000 characters)

### Requirement 2: 强制字体绑定

**User Story:** As a developer, I want the library to enforce a single font family, so that all rendered content has consistent appearance.

#### Acceptance Criteria

1. THE Print_Renderer SHALL use Source_Han_Serif as the ONLY font for all text rendering
2. THE Print_Renderer SHALL NOT allow external configuration to change the font family
3. WHEN generating CSS, THE Print_Renderer SHALL include @font-face declarations with embedded Base64 font data
4. THE Print_Renderer SHALL apply `font-family: 'Source Han Serif SC'` to all text elements with `!important` flag
5. THE Print_Renderer SHALL set `font-synthesis: none` to prevent browser font synthesis

### Requirement 3: CSS 样式隔离

**User Story:** As a developer, I want the library's CSS to be completely isolated, so that external styles cannot affect the rendered output and internal styles do not leak out.

#### Acceptance Criteria

1. THE Print_Renderer SHALL wrap all rendered content in an isolation container
2. THE Print_Renderer SHALL use CSS `all: initial` to reset inherited styles on the isolation container
3. THE Print_Renderer SHALL use CSS `contain: strict` for layout containment
4. THE Print_Renderer SHALL use CSS `isolation: isolate` to create a new stacking context
5. WHEN external CSS targets elements inside the isolation container, THE Print_Renderer SHALL override them using high-specificity selectors
6. THE Print_Renderer SHALL prefix all internal CSS class names with a unique namespace (e.g., `mpr-`)

### Requirement 4: 跨环境一致性

**User Story:** As a developer, I want the rendered output to look identical in browser preview and PDF generation, so that WYSIWYG is guaranteed.

#### Acceptance Criteria

1. WHEN rendering in browser, THE Print_Renderer SHALL produce identical visual output as PDF generation
2. THE Print_Renderer SHALL embed font data inline in generated HTML for PDF rendering compatibility
3. WHEN using Puppeteer for PDF generation, THE Print_Renderer SHALL wait for fonts to be loaded before capturing
4. THE Print_Renderer SHALL provide a `getFontDataUrl()` function to retrieve Base64-encoded font for external use

### Requirement 5: 字体加载 API

**User Story:** As a developer, I want programmatic access to font loading status, so that I can ensure fonts are ready before rendering.

#### Acceptance Criteria

1. THE Print_Renderer SHALL export a `waitForFonts()` async function that resolves when fonts are loaded
2. THE Print_Renderer SHALL export a `isFontLoaded()` function to check font loading status synchronously
3. WHEN fonts fail to load, THE Print_Renderer SHALL reject with a descriptive error message
4. THE Print_Renderer SHALL support a timeout parameter for font loading (default: 5000ms)

### Requirement 6: 打印样式优化

**User Story:** As a developer, I want the font to be optimized for print output, so that the printed documents are crisp and professional.

#### Acceptance Criteria

1. THE Print_Renderer SHALL use `font-display: block` to prevent FOIT (Flash of Invisible Text)
2. THE Print_Renderer SHALL set appropriate `font-weight: 400` for body text
3. THE Print_Renderer SHALL disable font smoothing for print media (`-webkit-font-smoothing: none`)
4. WHEN generating PDF, THE Print_Renderer SHALL embed fonts in the PDF file for offline viewing
