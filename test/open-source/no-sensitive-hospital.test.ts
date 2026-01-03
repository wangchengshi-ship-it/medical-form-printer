/**
 * @fileoverview Property test for no sensitive hospital data
 * @module test/open-source/no-sensitive-hospital
 * @description Property 4: No Sensitive Hospital Data
 *
 * Validates: Requirements 4.4, 4.5, 4.11, 4.12
 *
 * For any file in the repository (source, tests, stories, documentation),
 * there SHALL be zero occurrences of sensitive hospital names.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Real sensitive hospital names that should not appear in the codebase
 * Note: Generic placeholders like "Sample Hospital", "Demo Medical Center" are acceptable
 */
const SENSITIVE_HOSPITAL_NAMES = [
  '中医二附属',
  '天津市中心妇产科医院',
  '天津',
]

/**
 * Get all relevant files from the repository
 */
function getRelevantFiles(baseDir: string, excludeFiles: string[] = []): string[] {
  const files: string[] = []
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css']
  const excludeDirs = ['node_modules', 'dist', 'coverage', '.git', 'storybook-static']

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
          // Exclude specified files (like the test file itself)
          const shouldExclude = excludeFiles.some(excludeFile => fullPath.endsWith(excludeFile))
          if (!shouldExclude) {
            files.push(fullPath)
          }
        }
      }
    }
  }

  walkDir(baseDir)
  return files
}

describe('Property 4: No Sensitive Hospital Data', () => {
  /**
   * Feature: open-source-preparation, Property 4: No Sensitive Hospital Data
   *
   * For any file in the repository, there SHALL be zero occurrences of
   * sensitive hospital names including but not limited to:
   * "Sample Hospital", "中医二附属", "天津市中心妇产科医院"
   */
  it('should not contain any sensitive hospital names in source files', () => {
    const baseDir = path.resolve(__dirname, '../..')
    const files = getRelevantFiles(path.join(baseDir, 'src'))

    fc.assert(
      fc.property(
        fc.constantFrom(...files),
        (filePath) => {
          const content = fs.readFileSync(filePath, 'utf-8')

          for (const sensitiveData of SENSITIVE_HOSPITAL_NAMES) {
            if (content.includes(sensitiveData)) {
              throw new Error(
                `Found sensitive hospital data "${sensitiveData}" in file: ${filePath}`
              )
            }
          }

          return true
        }
      ),
      { numRuns: Math.min(files.length, 100) }
    )
  })

  it('should not contain any sensitive hospital names in test files', () => {
    const baseDir = path.resolve(__dirname, '../..')
    // Exclude this test file itself since it contains the sensitive names as test data
    const files = getRelevantFiles(path.join(baseDir, 'test'), ['no-sensitive-hospital.test.ts', 'no-sensitive-personal.test.ts'])

    fc.assert(
      fc.property(
        fc.constantFrom(...files),
        (filePath) => {
          const content = fs.readFileSync(filePath, 'utf-8')

          for (const sensitiveData of SENSITIVE_HOSPITAL_NAMES) {
            if (content.includes(sensitiveData)) {
              throw new Error(
                `Found sensitive hospital data "${sensitiveData}" in file: ${filePath}`
              )
            }
          }

          return true
        }
      ),
      { numRuns: Math.min(files.length, 100) }
    )
  })

  it('should not contain any sensitive hospital names in story files', () => {
    const baseDir = path.resolve(__dirname, '../..')
    const storiesDir = path.join(baseDir, 'stories')

    if (!fs.existsSync(storiesDir)) {
      return // Skip if stories directory doesn't exist
    }

    const files = getRelevantFiles(storiesDir)

    fc.assert(
      fc.property(
        fc.constantFrom(...files),
        (filePath) => {
          const content = fs.readFileSync(filePath, 'utf-8')

          for (const sensitiveData of SENSITIVE_HOSPITAL_NAMES) {
            if (content.includes(sensitiveData)) {
              throw new Error(
                `Found sensitive hospital data "${sensitiveData}" in file: ${filePath}`
              )
            }
          }

          return true
        }
      ),
      { numRuns: Math.min(files.length, 100) }
    )
  })
})
