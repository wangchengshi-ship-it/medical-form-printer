/**
 * @fileoverview Watermark rendering utility functions
 * @module utils/watermark
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * Provides unified watermark rendering functionality, ensuring all renderers use consistent watermark implementation.
 * Supports opacity settings and boundary checking.
 *
 * @usedBy
 * - ../renderer/isolated-html-renderer.ts - Isolated mode renderer
 * - ../pagination/paginated-renderer.ts - Paginated renderer
 * - ../renderer/templates/index.ts - Template renderer base class
 */

import { escapeHtml } from './html-builder'

// ==================== Type Definitions ====================

/**
 * Watermark configuration options
 */
export interface WatermarkOptions {
  /** Watermark text */
  text?: string
  /** Opacity (0-1), values outside range will be clamped */
  opacity?: number
  /** CSS class name, defaults to 'watermark' */
  className?: string
}

// ==================== Utility Functions ====================

/**
 * Clamp a value within specified range
 * @param value - Input value
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Safely handle opacity value
 * @param opacity - Original opacity value
 * @returns Processed opacity value (0-1 range), undefined means no setting
 */
export function normalizeOpacity(opacity?: number): number | undefined {
  if (opacity === undefined) return undefined
  return clamp(opacity, 0, 1)
}

// ==================== Core Rendering Functions ====================

/**
 * Render watermark HTML
 *
 * @param options - Watermark configuration options
 * @returns Watermark HTML string, returns empty string when no watermark
 *
 * @example
 * ```typescript
 * // Basic usage
 * renderWatermarkHtml({ text: 'Internal Use Only' })
 * // => '<div class="watermark">Internal Use Only</div>'
 *
 * // With opacity
 * renderWatermarkHtml({ text: 'Draft', opacity: 0.5 })
 * // => '<div class="watermark" style="opacity: 0.5">Draft</div>'
 *
 * // Custom class name (for namespacing)
 * renderWatermarkHtml({ text: 'Draft', className: 'mpr-watermark' })
 * // => '<div class="mpr-watermark">Draft</div>'
 *
 * // Opacity boundary handling
 * renderWatermarkHtml({ text: 'Test', opacity: 1.5 })
 * // => '<div class="watermark" style="opacity: 1">Test</div>'
 * ```
 */
export function renderWatermarkHtml(options: WatermarkOptions): string {
  const { text, opacity, className = 'watermark' } = options

  if (!text) return ''

  const safeOpacity = normalizeOpacity(opacity)
  const styleAttr = safeOpacity !== undefined ? ` style="opacity: ${safeOpacity}"` : ''

  return `<div class="${className}"${styleAttr}>${escapeHtml(text)}</div>`
}

/**
 * Extract watermark configuration from render options
 * Used for compatibility with existing RenderOptions interface
 *
 * @param options - Options object containing watermark configuration
 * @returns Watermark configuration options
 */
export function extractWatermarkOptions(
  options?: { watermark?: string; watermarkOpacity?: number },
  className?: string
): WatermarkOptions {
  return {
    text: options?.watermark,
    opacity: options?.watermarkOpacity,
    className,
  }
}
