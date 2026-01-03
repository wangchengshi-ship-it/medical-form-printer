/**
 * @fileoverview 字体加载状态管理
 * @module fonts/font-loader
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * 提供字体加载状态检查和等待功能。
 * 在浏览器环境中使用 FontFace API，在 Node.js 环境中直接返回成功。
 *
 * @dependencies
 * - ./font-css - 字体配置常量
 * - ./font-data - Base64 编码的字体数据
 */

import { FONT_FAMILY, FONT_WEIGHT, FONT_STYLE } from './font-css'
import { FONT_DATA_URL } from './font-data'

/** 字体加载选项 */
export interface FontLoadOptions {
  /** 超时时间（毫秒），默认 5000 */
  timeout?: number
}

/** 字体加载错误 */
export class FontLoadError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'FontLoadError'
  }
}

/** 字体加载状态缓存 */
let fontLoaded = false
let fontLoadPromise: Promise<void> | null = null

/**
 * 检测是否在浏览器环境
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * 检测是否支持 FontFace API
 */
function supportsFontFaceApi(): boolean {
  return isBrowser() && 'FontFace' in window
}

/**
 * 检查字体是否已加载（同步）
 * 
 * @returns 字体加载状态
 * - 在 Node.js 环境中始终返回 true（字体内嵌，无需加载）
 * - 在浏览器环境中返回实际加载状态
 */
export function isFontLoaded(): boolean {
  // Node.js 环境：字体内嵌在 CSS 中，无需预加载
  if (!isBrowser()) {
    return true
  }
  return fontLoaded
}

/**
 * 加载字体到浏览器
 */
async function loadFont(): Promise<void> {
  if (!supportsFontFaceApi()) {
    // 不支持 FontFace API，依赖 CSS @font-face 自动加载
    fontLoaded = true
    return
  }

  try {
    const font = new FontFace(FONT_FAMILY, `url(${FONT_DATA_URL})`, {
      weight: String(FONT_WEIGHT),
      style: FONT_STYLE,
      display: 'block',
    })

    const loadedFont = await font.load()
    // FontFaceSet.add() 在某些 TypeScript 版本中类型不完整
    ;(document.fonts as unknown as { add(font: FontFace): void }).add(loadedFont)
    fontLoaded = true
  } catch (error) {
    throw new FontLoadError(
      `Failed to load font '${FONT_FAMILY}'`,
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * 等待字体加载完成
 * 
 * @param options - 加载选项
 * @returns Promise，字体加载完成时 resolve
 * @throws {FontLoadError} 超时或加载失败时 reject
 * 
 * @example
 * ```typescript
 * try {
 *   await waitForFonts({ timeout: 3000 })
 *   console.log('Font loaded successfully')
 * } catch (error) {
 *   if (error instanceof FontLoadError) {
 *     console.error('Font loading failed:', error.message)
 *   }
 * }
 * ```
 */
export async function waitForFonts(options?: FontLoadOptions): Promise<void> {
  const timeout = options?.timeout ?? 5000

  // Node.js 环境：直接返回
  if (!isBrowser()) {
    return
  }

  // 已加载：直接返回
  if (fontLoaded) {
    return
  }

  // 正在加载：复用现有 Promise
  if (fontLoadPromise) {
    return fontLoadPromise
  }

  // 创建带超时的加载 Promise
  fontLoadPromise = new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      fontLoadPromise = null
      reject(new FontLoadError(`Font loading timed out after ${timeout}ms`))
    }, timeout)

    loadFont()
      .then(() => {
        clearTimeout(timeoutId)
        resolve()
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        fontLoadPromise = null
        reject(error)
      })
  })

  return fontLoadPromise
}

/**
 * 重置字体加载状态（仅用于测试）
 * @internal
 */
export function _resetFontLoadState(): void {
  fontLoaded = false
  fontLoadPromise = null
}
