/**
 * @fileoverview Property test for no old package name references
 * @module test/open-source/no-old-references
 * @description Property 2: No Old Package Name References
 *
 * Validates: Requirements 1.6
 *
 * For any source file, test file, or documentation file in the repository,
 * there SHALL be zero occurrences of the old package name `@medical/print-renderer`.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Old package name that should not appear anywhere in the codebase
 */
const OLD_PACKAGE_NAME = '@medical/print-renderer'

/**
 * Get all relevant files from the repository
 */
function getRelevantFiles(baseDir: string, excludeFiles: string[] = []): string[] {
  const files: string[] = []
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css', '.yml', '.yaml']
  const excludeDirs = ['node_modules', 'dist', 'coverage', '.git', 'storybook-static', 'bun.lock', 'package-lock.json']

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
        // Skip lock files
        if (entry.name === 'bun.lock' || entry.name === 'package-lock.json') {
          continue
        }
        // Skip excluded files
        const shouldExclude = excludeFiles.some(excludeFile => fullPath.endsWith(excludeFile))
        if (shouldExclude) {
          continue
        }
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  }

  walkDir(baseDir)
  return files
}

describe('Property 2: No Old Package Name References', () => {
  /**
   * Feature: open-source-preparation, Property 2: No Old Package Name References
   *
   * For any source file, test file, or documentation file in the repository,
   * there SHALL be zero occurrences of the old package name `@medical/print-renderer`.
   */
  it('should not contain old package name in source files', () => {
    const baseDir = path.resolve(__dirname, '../..')
    const srcDir = path.join(baseDir, 'src')

    if (!fs.existsSync(srcDir)) {
      return // Skip if src directory doesn't exist
    }

    const files = getRelevantFiles(srcDir)

    if (files.length === 0) {
      return // Skip if no files found
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...files),
        (filePath) => {
          const content = fs.readFileSync(filePath, 'utf-8')

          if (content.includes(OLD_PACKAGE_NAME)) {
            throw new Error(
              `Found old package name "${OLD_PACKAGE_NAME}" in file: ${filePath}`
            )
          }

          return true
        }
      ),
      { numRuns: Math.min(files.length, 100) }
    )
  })

  it('should not contain old package name in test files', () => {
    const baseDir = path.resolve(__dirname, '../..')
    const testDir = path.join(baseDir, 'test')

    if (!fs.existsSync(testDir)) {
      return // Skip if test directory doesn't exist
    }

    // Exclude this test file itself since it contains the old package name as test data
    const files = getRelevantFiles(testDir, ['no-old-references.test.ts'])

    if (files.length === 0) {
      return // Skip if no files found
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...files),
        (filePath) => {
          const content = fs.readFileSync(filePath, 'utf-8')

          if (content.includes(OLD_PACKAGE_NAME)) {
            throw new Error(
              `Found old package name "${OLD_PACKAGE_NAME}" in file: ${filePath}`
            )
          }

          return true
        }
      ),
      { numRuns: Math.min(files.length, 100) }
    )
  })

  it('should not contain old package name in story files', () => {
    const baseDir = path.resolve(__dirname, '../..')
    const storiesDir = path.join(baseDir, 'stories')

    if (!fs.existsSync(storiesDir)) {
      return // Skip if stories directory doesn't exist
    }

    const files = getRelevantFiles(storiesDir)

    if (files.length === 0) {
      return // Skip if no files found
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...files),
        (filePath) => {
          const content = fs.readFileSync(filePath, 'utf-8')

          if (content.includes(OLD_PACKAGE_NAME)) {
            throw new Error(
              `Found old package name "${OLD_PACKAGE_NAME}" in file: ${filePath}`
            )
          }

          return true
        }
      ),
      { numRuns: Math.min(files.length, 100) }
    )
  })

  it('should not contain old package name in documentation files', () => {
    const baseDir = path.resolve(__dirname, '../..')
    const docsDir = path.join(baseDir, 'docs')

    if (!fs.existsSync(docsDir)) {
      return // Skip if docs directory doesn't exist
    }

    const files = getRelevantFiles(docsDir)

    if (files.length === 0) {
      return // Skip if no files found
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...files),
        (filePath) => {
          const content = fs.readFileSync(filePath, 'utf-8')

          if (content.includes(OLD_PACKAGE_NAME)) {
            throw new Error(
              `Found old package name "${OLD_PACKAGE_NAME}" in file: ${filePath}`
            )
          }

          return true
        }
      ),
      { numRuns: Math.min(files.length, 100) }
    )
  })

  it('should not contain old package name in root config files', () => {
    const baseDir = path.resolve(__dirname, '../..')
    const configFiles = [
      'package.json',
      'tsconfig.json',
      'README.md',
      'CHANGELOG.md',
      'CONTRIBUTING.md',
    ]

    const existingFiles = configFiles
      .map(f => path.join(baseDir, f))
      .filter(f => fs.existsSync(f))

    if (existingFiles.length === 0) {
      return // Skip if no config files found
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...existingFiles),
        (filePath) => {
          const content = fs.readFileSync(filePath, 'utf-8')

          if (content.includes(OLD_PACKAGE_NAME)) {
            throw new Error(
              `Found old package name "${OLD_PACKAGE_NAME}" in file: ${filePath}`
            )
          }

          return true
        }
      ),
      { numRuns: existingFiles.length }
    )
  })
})
