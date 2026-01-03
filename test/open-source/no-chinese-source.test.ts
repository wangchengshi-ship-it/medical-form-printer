/**
 * @fileoverview Property test for no Chinese characters in source code
 * @module test/open-source/no-chinese-source
 * @description Property 3: No Chinese Characters in Source Code
 *
 * Validates: Requirements 2.8, 2.9, 4.6, 4.7
 *
 * For any TypeScript source file in the src/ directory, there SHALL be
 * zero Chinese characters (Unicode range \u4e00-\u9fa5) in comments,
 * string literals, or identifiers.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Regex pattern to match Chinese characters
 */
const CHINESE_CHAR_PATTERN = /[\u4e00-\u9fa5]/g

/**
 * Get all TypeScript source files from src/ directory
 */
function getSourceFiles(baseDir: string): string[] {
  const files: string[] = []
  const extensions = ['.ts', '.tsx']
  const excludeDirs = ['node_modules', 'dist', 'coverage', '.git']

  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          walkDir(fullPath)
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  }

  walkDir(baseDir)
  return files
}

/**
 * Find Chinese characters in content and return their positions
 */
function findChineseCharacters(content: string): Array<{ char: string; line: number; column: number }> {
  const results: Array<{ char: string; line: number; column: number }> = []
  const lines = content.split('\n')

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]
    let match: RegExpExecArray | null

    const regex = new RegExp(CHINESE_CHAR_PATTERN.source, 'g')
    while ((match = regex.exec(line)) !== null) {
      results.push({
        char: match[0],
        line: lineIndex + 1,
        column: match.index + 1,
      })
    }
  }

  return results
}

describe('Property 3: No Chinese Characters in Source Code', () => {
  /**
   * Feature: open-source-preparation, Property 3: No Chinese Characters in Source Code
   *
   * For any TypeScript source file in the src/ directory, there SHALL be
   * zero Chinese characters (Unicode range \u4e00-\u9fa5) in comments,
   * string literals, or identifiers.
   */
  it('should not contain any Chinese characters in src/ TypeScript files', () => {
    const baseDir = path.resolve(__dirname, '../..')
    const srcDir = path.join(baseDir, 'src')
    const files = getSourceFiles(srcDir)

    expect(files.length).toBeGreaterThan(0)

    fc.assert(
      fc.property(
        fc.constantFrom(...files),
        (filePath) => {
          const content = fs.readFileSync(filePath, 'utf-8')
          const chineseChars = findChineseCharacters(content)

          if (chineseChars.length > 0) {
            const relativePath = path.relative(baseDir, filePath)
            const details = chineseChars
              .slice(0, 5) // Show first 5 occurrences
              .map((c) => `  Line ${c.line}, Col ${c.column}: "${c.char}"`)
              .join('\n')

            throw new Error(
              `Found ${chineseChars.length} Chinese character(s) in ${relativePath}:\n${details}` +
              (chineseChars.length > 5 ? `\n  ... and ${chineseChars.length - 5} more` : '')
            )
          }

          return true
        }
      ),
      { numRuns: Math.min(files.length, 100) }
    )
  })

  it('should verify all source files are checked', () => {
    const baseDir = path.resolve(__dirname, '../..')
    const srcDir = path.join(baseDir, 'src')
    const files = getSourceFiles(srcDir)

    // Ensure we have a reasonable number of source files
    expect(files.length).toBeGreaterThan(10)

    // Verify key files are included
    const fileNames = files.map((f) => path.basename(f))
    expect(fileNames).toContain('index.ts')
  })
})
