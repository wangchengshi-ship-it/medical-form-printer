/**
 * @fileoverview Font loading state management
 * @module fonts/font-loader
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * Provides font loading state checking and waiting functionality.
 * Uses FontFace API in browser environment, returns success directly in Node.js environment.
 *
 * @dependencies
 * - ./font-css - Font configuration constants
 * - ./font-data - Base64 encoded font data
 */

import { FONT_FAMILY, FONT_WEIGHT, FONT_STYLE } from './font-css'
import { FONT_DATA_URL } from './font-data'

/** Font load options */
export interface FontLoadOptions {
  /** Timeout in milliseconds, default 5000 */
  timeout?: number
}

/** Font load error */
export class FontLoadError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'FontLoadError'
  }
}

/** Font loading state cache */
let fontLoaded = false
let fontLoadPromise: Promise<void> | null = null

/**
 * Detect if running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * Detect if FontFace API is supported
 */
function supportsFontFaceApi(): boolean {
  return isBrowser() && 'FontFace' in window
}

/**
 * Check if font is loaded (synchronous)
 * 
 * @returns Font loading status
 * - In Node.js environment, always returns true (font is embedded, no loading needed)
 * - In browser environment, returns actual loading status
 */
export function isFontLoaded(): boolean {
  // Node.js environment: font is embedded in CSS, no preloading needed
  if (!isBrowser()) {
    return true
  }
  return fontLoaded
}

/**
 * Load font into browser
 */
async function loadFont(): Promise<void> {
  if (!supportsFontFaceApi()) {
    // FontFace API not supported, rely on CSS @font-face auto-loading
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
    // FontFaceSet.add() type is incomplete in some TypeScript versions
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
 * Wait for fonts to load
 * 
 * @param options - Load options
 * @returns Promise that resolves when font is loaded
 * @throws {FontLoadError} Rejects on timeout or load failure
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

  // Node.js environment: return directly
  if (!isBrowser()) {
    return
  }

  // Already loaded: return directly
  if (fontLoaded) {
    return
  }

  // Loading in progress: reuse existing Promise
  if (fontLoadPromise) {
    return fontLoadPromise
  }

  // Create loading Promise with timeout
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
 * Reset font load state (for testing only)
 * @internal
 */
export function _resetFontLoadState(): void {
  fontLoaded = false
  fontLoadPromise = null
}
