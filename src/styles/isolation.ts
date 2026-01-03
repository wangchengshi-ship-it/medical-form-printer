/**
 * @fileoverview CSS Isolation Module
 * @module styles/isolation
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * Provides CSS namespace and isolation container style generation.
 * Ensures component styles are completely isolated from external styles, preventing style pollution.
 *
 * @usedBy
 * - ./css-generator.ts - CSS generator
 * - ../renderer/html-renderer.ts - HTML renderer
 */

/** CSS namespace prefix */
export const CSS_NAMESPACE = 'mpr'

/** Isolation container root class name */
export const ISOLATION_ROOT_CLASS = `${CSS_NAMESPACE}-root`

/**
 * Add namespace prefix to class name
 * @param className - Original class name
 * @returns Class name with prefix
 *
 * @example
 * ```typescript
 * namespaceClass('print-page') // 'mpr-print-page'
 * namespaceClass('header')     // 'mpr-header'
 * ```
 */
export function namespaceClass(className: string): string {
  // Don't add prefix if already present
  if (className.startsWith(`${CSS_NAMESPACE}-`)) {
    return className
  }
  return `${CSS_NAMESPACE}-${className}`
}

/**
 * Batch convert class names
 * @param classNames - Original class name array
 * @returns Class name array with prefix
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
 * Generate isolation container styles
 * Uses multiple layers of protection to ensure complete style isolation
 * @returns CSS rules for isolation container
 */
export function generateIsolationCss(): string {
  return `/* CSS Isolation Container */
.${ISOLATION_ROOT_CLASS} {
  /* Style isolation - create new stacking context */
  isolation: isolate;
  
  /* Layout isolation - use layout instead of strict to avoid height collapse */
  contain: layout style;
  
  /* Ensure block display */
  display: block;
  
  /* Reset base styles */
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  
  /* Ensure text direction */
  direction: ltr;
  text-align: left;
  
  /* Ensure visibility */
  visibility: visible;
  opacity: 1;
  
  /* Ensure auto height */
  height: auto;
  min-height: 0;
  
  /* Reset inherited text styles */
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

/* Prevent external styles from affecting internal elements via wildcard selectors */
.${ISOLATION_ROOT_CLASS} *,
.${ISOLATION_ROOT_CLASS} *::before,
.${ISOLATION_ROOT_CLASS} *::after {
  box-sizing: border-box;
}`
}

/**
 * Class name mapping table: original class name -> namespaced class name
 * Used for class name conversion in renderers
 */
export const CLASS_NAME_MAP: Record<string, string> = {
  // Page layout
  'print-page': namespaceClass('print-page'),
  'print-header': namespaceClass('print-header'),
  'print-content': namespaceClass('print-content'),
  'print-footer': namespaceClass('print-footer'),
  'print-section': namespaceClass('print-section'),
  
  // Header elements
  'header-row': namespaceClass('header-row'),
  'hospital-name': namespaceClass('hospital-name'),
  'department-name': namespaceClass('department-name'),
  'form-title': namespaceClass('form-title'),
  'header-logo': namespaceClass('header-logo'),
  
  // Sections
  'section-title': namespaceClass('section-title'),
  'info-grid': namespaceClass('info-grid'),
  'data-table': namespaceClass('data-table'),
  'checkbox-grid': namespaceClass('checkbox-grid'),
  'checkbox-item': namespaceClass('checkbox-item'),
  'checkbox-symbol': namespaceClass('checkbox-symbol'),
  
  // Info grid - underline fill-in style
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
  
  // Cells (legacy table style, kept for compatibility)
  'label-cell': namespaceClass('label-cell'),
  'value-cell': namespaceClass('value-cell'),
  
  // Signature
  'signature-area': namespaceClass('signature-area'),
  'signature-item': namespaceClass('signature-item'),
  'signature-label': namespaceClass('signature-label'),
  'signature-line': namespaceClass('signature-line'),
  
  // Notes and free text
  'notes-section': namespaceClass('notes-section'),
  'free-text': namespaceClass('free-text'),
  
  // Footer
  'footer-notes': namespaceClass('footer-notes'),
  'page-number': namespaceClass('page-number'),
  
  // Watermark
  'watermark': namespaceClass('watermark'),
  
  // Pagination control
  'page-break-before': namespaceClass('page-break-before'),
  'page-break-after': namespaceClass('page-break-after'),
  'no-page-break': namespaceClass('no-page-break'),
  
  // Page size modifiers
  'landscape': namespaceClass('landscape'),
  'a5': namespaceClass('a5'),
  '16k': namespaceClass('16k'),
  
  // Modifiers
  'bordered': namespaceClass('bordered'),
}

/**
 * Get namespaced class name
 * @param className - Original class name
 * @returns Namespaced class name, adds prefix if not in mapping table
 */
export function getNamespacedClass(className: string): string {
  return CLASS_NAME_MAP[className] ?? namespaceClass(className)
}
