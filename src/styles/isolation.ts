/**
 * @fileoverview CSS 隔离模块
 * @module styles/isolation
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * 提供 CSS 命名空间和隔离容器样式生成功能。
 * 确保组件样式与外部样式完全隔离，防止样式污染。
 *
 * @usedBy
 * - ./css-generator.ts - CSS 生成器
 * - ../renderer/html-renderer.ts - HTML 渲染器
 */

/** CSS 命名空间前缀 */
export const CSS_NAMESPACE = 'mpr'

/** 隔离容器根类名 */
export const ISOLATION_ROOT_CLASS = `${CSS_NAMESPACE}-root`

/**
 * 为类名添加命名空间前缀
 * @param className - 原始类名
 * @returns 带前缀的类名
 *
 * @example
 * ```typescript
 * namespaceClass('print-page') // 'mpr-print-page'
 * namespaceClass('header')     // 'mpr-header'
 * ```
 */
export function namespaceClass(className: string): string {
  // 如果已经有前缀，不重复添加
  if (className.startsWith(`${CSS_NAMESPACE}-`)) {
    return className
  }
  return `${CSS_NAMESPACE}-${className}`
}

/**
 * 批量转换类名
 * @param classNames - 原始类名数组
 * @returns 带前缀的类名数组
 *
 * @example
 * ```typescript
 * namespaceClasses(['print-page', 'header', 'footer'])
 * // ['mpr-print-page', 'mpr-header', 'mpr-footer']
 * ```
 */
export function namespaceClasses(classNames: string[]): string[] {
  return classNames.map(namespaceClass)
}

/**
 * 生成隔离容器样式
 * 使用多层防护确保样式完全隔离
 * @returns 隔离容器的 CSS 规则
 */
export function generateIsolationCss(): string {
  return `/* CSS 隔离容器 */
.${ISOLATION_ROOT_CLASS} {
  /* 样式隔离 - 创建新的堆叠上下文 */
  isolation: isolate;
  
  /* 布局隔离 - 使用 layout 而非 strict，避免高度塌陷 */
  contain: layout style;
  
  /* 确保块级显示 */
  display: block;
  
  /* 重置基础样式 */
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  
  /* 确保文本方向 */
  direction: ltr;
  text-align: left;
  
  /* 确保可见性 */
  visibility: visible;
  opacity: 1;
  
  /* 确保高度自适应 */
  height: auto;
  min-height: 0;
  
  /* 重置继承的文本样式 */
  font-style: normal;
  font-variant: normal;
  font-weight: normal;
  letter-spacing: normal;
  line-height: normal;
  text-decoration: none;
  text-transform: none;
  white-space: normal;
  word-spacing: normal;
}

/* 防止外部样式通过通配符选择器影响内部 */
.${ISOLATION_ROOT_CLASS} *,
.${ISOLATION_ROOT_CLASS} *::before,
.${ISOLATION_ROOT_CLASS} *::after {
  box-sizing: border-box;
}`
}

/**
 * 类名映射表：原始类名 -> 命名空间类名
 * 用于渲染器中的类名转换
 */
export const CLASS_NAME_MAP: Record<string, string> = {
  // 页面布局
  'print-page': namespaceClass('print-page'),
  'print-header': namespaceClass('print-header'),
  'print-content': namespaceClass('print-content'),
  'print-footer': namespaceClass('print-footer'),
  'print-section': namespaceClass('print-section'),
  
  // 页眉元素
  'header-row': namespaceClass('header-row'),
  'hospital-name': namespaceClass('hospital-name'),
  'department-name': namespaceClass('department-name'),
  'form-title': namespaceClass('form-title'),
  'header-logo': namespaceClass('header-logo'),
  
  // 区块
  'section-title': namespaceClass('section-title'),
  'info-grid': namespaceClass('info-grid'),
  'data-table': namespaceClass('data-table'),
  'checkbox-grid': namespaceClass('checkbox-grid'),
  'checkbox-item': namespaceClass('checkbox-item'),
  'checkbox-symbol': namespaceClass('checkbox-symbol'),
  
  // 信息网格 - 下划线填空样式
  'info-row': namespaceClass('info-row'),
  'info-item': namespaceClass('info-item'),
  'label': namespaceClass('label'),
  'field-value': namespaceClass('field-value'),
  'text': namespaceClass('text'),
  'line': namespaceClass('line'),
  'full-width': namespaceClass('full-width'),
  'custom-width': namespaceClass('custom-width'),
  'span-2': namespaceClass('span-2'),
  'checkbox-inline': namespaceClass('checkbox-inline'),
  'checkbox-text-item': namespaceClass('checkbox-text-item'),
  'checkbox-text': namespaceClass('checkbox-text'),
  'textarea-item': namespaceClass('textarea-item'),
  'textarea-content': namespaceClass('textarea-content'),
  
  // 单元格（旧表格样式，保留兼容）
  'label-cell': namespaceClass('label-cell'),
  'value-cell': namespaceClass('value-cell'),
  
  // 签名
  'signature-area': namespaceClass('signature-area'),
  'signature-item': namespaceClass('signature-item'),
  'signature-label': namespaceClass('signature-label'),
  'signature-line': namespaceClass('signature-line'),
  
  // 备注和自由文本
  'notes-section': namespaceClass('notes-section'),
  'free-text': namespaceClass('free-text'),
  
  // 页脚
  'footer-notes': namespaceClass('footer-notes'),
  'page-number': namespaceClass('page-number'),
  
  // 水印
  'watermark': namespaceClass('watermark'),
  
  // 分页控制
  'page-break-before': namespaceClass('page-break-before'),
  'page-break-after': namespaceClass('page-break-after'),
  'no-page-break': namespaceClass('no-page-break'),
  
  // 页面尺寸修饰符
  'landscape': namespaceClass('landscape'),
  'a5': namespaceClass('a5'),
  '16k': namespaceClass('16k'),
  
  // 修饰符
  'bordered': namespaceClass('bordered'),
}

/**
 * 获取命名空间类名
 * @param className - 原始类名
 * @returns 命名空间类名，如果不在映射表中则添加前缀
 */
export function getNamespacedClass(className: string): string {
  return CLASS_NAME_MAP[className] ?? namespaceClass(className)
}
