/**
 * @fileoverview Property test for package.json validity
 * @module test/open-source/package-validation
 * @description Property 1: Package.json Validity
 *
 * Validates: Requirements 1.1, 1.2, 1.5
 *
 * For any valid release build, the package.json SHALL contain all required
 * npm publishing fields (name, version, description, repository, homepage,
 * bugs, keywords, license) with non-empty values, and the version SHALL
 * match semantic versioning format (X.Y.Z).
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Semantic versioning regex pattern
 * Matches: X.Y.Z, X.Y.Z-alpha, X.Y.Z-beta.1, etc.
 */
const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$/

/**
 * Required fields for npm publishing
 */
const REQUIRED_FIELDS = [
  'name',
  'version',
  'description',
  'repository',
  'homepage',
  'bugs',
  'keywords',
  'license',
] as const

/**
 * Expected package name after migration
 */
const EXPECTED_PACKAGE_NAME = 'medical-form-printer'

/**
 * Read and parse package.json
 */
function readPackageJson(): Record<string, unknown> {
  const packagePath = path.resolve(__dirname, '../../package.json')
  const content = fs.readFileSync(packagePath, 'utf-8')
  return JSON.parse(content)
}

describe('Property 1: Package.json Validity', () => {
  /**
   * Feature: open-source-preparation, Property 1: Package.json Validity
   *
   * For any valid release build, the package.json SHALL contain all required
   * npm publishing fields with non-empty values.
   */
  it('should contain all required npm publishing fields', () => {
    const packageJson = readPackageJson()

    fc.assert(
      fc.property(
        fc.constantFrom(...REQUIRED_FIELDS),
        (field) => {
          const value = packageJson[field]

          if (value === undefined || value === null) {
            throw new Error(`Missing required field: ${field}`)
          }

          // Check for non-empty values
          if (typeof value === 'string' && value.trim() === '') {
            throw new Error(`Field "${field}" is empty`)
          }

          if (Array.isArray(value) && value.length === 0) {
            throw new Error(`Field "${field}" is an empty array`)
          }

          if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
            throw new Error(`Field "${field}" is an empty object`)
          }

          return true
        }
      ),
      { numRuns: REQUIRED_FIELDS.length }
    )
  })

  it('should have correct package name', () => {
    const packageJson = readPackageJson()

    expect(packageJson.name).toBe(EXPECTED_PACKAGE_NAME)
  })

  it('should have version matching semantic versioning format', () => {
    const packageJson = readPackageJson()
    const version = packageJson.version as string

    expect(version).toMatch(SEMVER_REGEX)
  })

  it('should have English description', () => {
    const packageJson = readPackageJson()
    const description = packageJson.description as string

    // Check that description doesn't contain Chinese characters
    const chineseRegex = /[\u4e00-\u9fa5]/
    expect(description).not.toMatch(chineseRegex)
    expect(description.length).toBeGreaterThan(10)
  })

  it('should have valid repository object with url', () => {
    const packageJson = readPackageJson()
    const repository = packageJson.repository as { type?: string; url?: string }

    expect(repository).toBeDefined()
    expect(repository.type).toBe('git')
    expect(repository.url).toMatch(/^git\+https:\/\/github\.com\//)
  })

  it('should have valid homepage URL', () => {
    const packageJson = readPackageJson()
    const homepage = packageJson.homepage as string

    expect(homepage).toMatch(/^https:\/\/github\.com\//)
    expect(homepage).toContain('#readme')
  })

  it('should have valid bugs URL', () => {
    const packageJson = readPackageJson()
    const bugs = packageJson.bugs as { url?: string }

    expect(bugs).toBeDefined()
    expect(bugs.url).toMatch(/^https:\/\/github\.com\//)
    expect(bugs.url).toContain('/issues')
  })

  it('should have meaningful keywords array', () => {
    const packageJson = readPackageJson()
    const keywords = packageJson.keywords as string[]

    expect(Array.isArray(keywords)).toBe(true)
    expect(keywords.length).toBeGreaterThanOrEqual(5)

    // Check that essential keywords are present
    const essentialKeywords = ['medical', 'form', 'print', 'pdf']
    for (const keyword of essentialKeywords) {
      expect(keywords).toContain(keyword)
    }
  })

  it('should have MIT license', () => {
    const packageJson = readPackageJson()

    expect(packageJson.license).toBe('MIT')
  })

  it('should have engines field with minimum Node.js version', () => {
    const packageJson = readPackageJson()
    const engines = packageJson.engines as { node?: string }

    expect(engines).toBeDefined()
    expect(engines.node).toBeDefined()
    expect(engines.node).toMatch(/^>=\d+\.\d+\.\d+$/)
  })

  it('should have files field specifying distribution files', () => {
    const packageJson = readPackageJson()
    const files = packageJson.files as string[]

    expect(Array.isArray(files)).toBe(true)
    expect(files).toContain('dist')
  })
})
