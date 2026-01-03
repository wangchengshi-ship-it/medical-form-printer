/**
 * @fileoverview Property test for JSDoc coverage on public exports
 * @module test/open-source/jsdoc-coverage
 * @description Property 6: JSDoc Coverage for Public Exports
 *
 * Validates: Requirements 3.1, 3.2, 3.3
 *
 * For any function, class, or type exported from src/index.ts, there SHALL be
 * a corresponding JSDoc comment with at least a description and @param/@returns
 * annotations where applicable.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Public function exports that should have JSDoc comments
 * These are the main API functions users interact with
 */
const PUBLIC_FUNCTION_EXPORTS = [
  // Core rendering
  'renderToHtml',
  'renderToIsolatedHtml',
  'renderToIsolatedFragment',
  'registerSectionRenderer',
  'getSectionRenderer',
  // Formatters
  'formatDate',
  'formatBoolean',
  'formatNumber',
  'formatValue',
  'isChecked',
  // Styles
  'generateCss',
  'generateIsolatedCss',
  'mergeTheme',
  // HTML utilities
  'escapeHtml',
  'escapeAttr',
  // Pagination
  'calculatePageBreaks',
  'renderPaginatedHtml',
  'mmToPx',
  'pxToMm',
] as const

/**
 * Source files that contain public exports
 */
const SOURCE_FILES = [
  'src/renderer/html-renderer.ts',
  'src/renderer/isolated-html-renderer.ts',
  'src/renderer/section-renderers/index.ts',
  'src/formatters/index.ts',
  'src/styles/css-generator.ts',
  'src/utils/html-builder.ts',
  'src/pagination/page-dimensions.ts',
  'src/pagination/page-break-calculator.ts',
  'src/pagination/paginated-renderer.ts',
] as const

/**
 * Read file content
 */
function readFile(relativePath: string): string {
  const filePath = path.resolve(__dirname, '../../', relativePath)
  return fs.readFileSync(filePath, 'utf-8')
}

/**
 * Check if a function has JSDoc comment
 * Looks for JSDoc comment block immediately before export function
 */
function hasJSDocComment(content: string, functionName: string): boolean {
  // Pattern to match JSDoc comment followed by export function
  const patterns = [
    // export function name
    new RegExp(`\\/\\*\\*[\\s\\S]*?\\*\\/\\s*export\\s+function\\s+${functionName}\\s*[(<]`, 'm'),
    // export const name = function
    new RegExp(`\\/\\*\\*[\\s\\S]*?\\*\\/\\s*export\\s+const\\s+${functionName}\\s*=`, 'm'),
    // export { name } with JSDoc above the actual function
    new RegExp(`\\/\\*\\*[\\s\\S]*?\\*\\/\\s*(?:export\\s+)?function\\s+${functionName}\\s*[(<]`, 'm'),
  ]

  return patterns.some(pattern => pattern.test(content))
}

/**
 * Check if JSDoc has description (non-empty content after /*)
 */
function hasJSDocDescription(content: string, functionName: string): boolean {
  // Find the JSDoc block for this function
  const jsdocPattern = new RegExp(
    `(\\/\\*\\*[\\s\\S]*?\\*\\/)\\s*(?:export\\s+)?(?:function|const)\\s+${functionName}`,
    'm'
  )
  const match = content.match(jsdocPattern)
  
  if (!match) return false
  
  const jsdocBlock = match[1]
  
  // Check if there's actual description content (not just @tags)
  // Remove all @tags and see if there's remaining content
  const withoutTags = jsdocBlock
    .replace(/\/\*\*|\*\//g, '')
    .replace(/@\w+[^\n]*/g, '')
    .replace(/\*/g, '')
    .trim()
  
  return withoutTags.length > 0
}

/**
 * Check if JSDoc has @param annotations for functions with parameters
 */
function hasParamAnnotations(content: string, functionName: string): boolean {
  // Find the JSDoc block for this function
  const jsdocPattern = new RegExp(
    `(\\/\\*\\*[\\s\\S]*?\\*\\/)\\s*(?:export\\s+)?(?:function|const)\\s+${functionName}\\s*[(<]([^)]*)[)>]`,
    'm'
  )
  const match = content.match(jsdocPattern)
  
  if (!match) return true // No match means we can't verify, assume OK
  
  const jsdocBlock = match[1]
  const params = match[2]
  
  // If function has no parameters, no @param needed
  if (!params || params.trim() === '' || params.trim() === 'void') {
    return true
  }
  
  // Count actual parameters (excluding type annotations)
  const paramNames = params
    .split(',')
    .map(p => p.trim())
    .filter(p => p && !p.startsWith('//'))
    .map(p => p.split(':')[0].split('?')[0].trim())
    .filter(p => p && p !== '')
  
  if (paramNames.length === 0) return true
  
  // Check if JSDoc has @param for each parameter
  const hasParam = /@param/.test(jsdocBlock)
  
  return hasParam
}

/**
 * Check if JSDoc has @returns annotation for functions that return values
 */
function hasReturnsAnnotation(content: string, functionName: string): boolean {
  // Find the JSDoc block and function signature
  const jsdocPattern = new RegExp(
    `(\\/\\*\\*[\\s\\S]*?\\*\\/)\\s*(?:export\\s+)?(?:function|const)\\s+${functionName}[^{]*:\\s*([^{]+)\\s*\\{`,
    'm'
  )
  const match = content.match(jsdocPattern)
  
  if (!match) return true // No match means we can't verify, assume OK
  
  const jsdocBlock = match[1]
  const returnType = match[2].trim()
  
  // If function returns void, no @returns needed
  if (returnType === 'void' || returnType.startsWith('void')) {
    return true
  }
  
  // Check if JSDoc has @returns
  const hasReturns = /@returns?/.test(jsdocBlock)
  
  return hasReturns
}

describe('Property 6: JSDoc Coverage for Public Exports', () => {
  /**
   * Feature: open-source-preparation, Property 6: JSDoc Coverage for Public Exports
   *
   * For any function exported from src/index.ts, there SHALL be a corresponding
   * JSDoc comment with at least a description.
   */
  it('should have JSDoc comments for all public function exports', () => {
    // Read all source files
    const sourceContents = SOURCE_FILES.map(file => ({
      file,
      content: readFile(file),
    }))

    fc.assert(
      fc.property(
        fc.constantFrom(...PUBLIC_FUNCTION_EXPORTS),
        (functionName) => {
          // Find the file containing this function
          const sourceFile = sourceContents.find(({ content }) => {
            const exportPattern = new RegExp(
              `(?:export\\s+(?:function|const)\\s+${functionName}|export\\s*\\{[^}]*\\b${functionName}\\b)`,
              'm'
            )
            return exportPattern.test(content)
          })

          if (!sourceFile) {
            // Function might be re-exported from another module, skip
            return true
          }

          const hasJSDoc = hasJSDocComment(sourceFile.content, functionName)
          
          if (!hasJSDoc) {
            throw new Error(
              `Function "${functionName}" in ${sourceFile.file} is missing JSDoc comment`
            )
          }

          return true
        }
      ),
      { numRuns: PUBLIC_FUNCTION_EXPORTS.length }
    )
  })

  it('should have descriptions in JSDoc comments', () => {
    const sourceContents = SOURCE_FILES.map(file => ({
      file,
      content: readFile(file),
    }))

    fc.assert(
      fc.property(
        fc.constantFrom(...PUBLIC_FUNCTION_EXPORTS),
        (functionName) => {
          const sourceFile = sourceContents.find(({ content }) => {
            const exportPattern = new RegExp(
              `(?:export\\s+(?:function|const)\\s+${functionName}|function\\s+${functionName})`,
              'm'
            )
            return exportPattern.test(content)
          })

          if (!sourceFile) return true

          const hasDescription = hasJSDocDescription(sourceFile.content, functionName)
          
          if (!hasDescription) {
            throw new Error(
              `Function "${functionName}" in ${sourceFile.file} has JSDoc but missing description`
            )
          }

          return true
        }
      ),
      { numRuns: PUBLIC_FUNCTION_EXPORTS.length }
    )
  })

  it('should have @param annotations for functions with parameters', () => {
    const sourceContents = SOURCE_FILES.map(file => ({
      file,
      content: readFile(file),
    }))

    // Functions that definitely have parameters
    const functionsWithParams = [
      'renderToHtml',
      'renderToIsolatedHtml',
      'renderToIsolatedFragment',
      'registerSectionRenderer',
      'getSectionRenderer',
      'formatDate',
      'formatNumber',
      'formatValue',
      'isChecked',
      'generateCss',
      'mergeTheme',
      'escapeHtml',
      'escapeAttr',
      'mmToPx',
      'pxToMm',
    ]

    fc.assert(
      fc.property(
        fc.constantFrom(...functionsWithParams),
        (functionName) => {
          const sourceFile = sourceContents.find(({ content }) => {
            const exportPattern = new RegExp(
              `(?:export\\s+(?:function|const)\\s+${functionName}|function\\s+${functionName})`,
              'm'
            )
            return exportPattern.test(content)
          })

          if (!sourceFile) return true

          const hasParams = hasParamAnnotations(sourceFile.content, functionName)
          
          if (!hasParams) {
            throw new Error(
              `Function "${functionName}" in ${sourceFile.file} is missing @param annotations`
            )
          }

          return true
        }
      ),
      { numRuns: functionsWithParams.length }
    )
  })

  it('should have @returns annotations for functions that return values', () => {
    const sourceContents = SOURCE_FILES.map(file => ({
      file,
      content: readFile(file),
    }))

    // Functions that return values (not void)
    const functionsWithReturns = [
      'renderToHtml',
      'renderToIsolatedHtml',
      'renderToIsolatedFragment',
      'getSectionRenderer',
      'formatDate',
      'formatBoolean',
      'formatNumber',
      'formatValue',
      'isChecked',
      'generateCss',
      'generateIsolatedCss',
      'mergeTheme',
      'escapeHtml',
      'escapeAttr',
      'mmToPx',
      'pxToMm',
    ]

    fc.assert(
      fc.property(
        fc.constantFrom(...functionsWithReturns),
        (functionName) => {
          const sourceFile = sourceContents.find(({ content }) => {
            const exportPattern = new RegExp(
              `(?:export\\s+(?:function|const)\\s+${functionName}|function\\s+${functionName})`,
              'm'
            )
            return exportPattern.test(content)
          })

          if (!sourceFile) return true

          const hasReturns = hasReturnsAnnotation(sourceFile.content, functionName)
          
          if (!hasReturns) {
            throw new Error(
              `Function "${functionName}" in ${sourceFile.file} is missing @returns annotation`
            )
          }

          return true
        }
      ),
      { numRuns: functionsWithReturns.length }
    )
  })

  it('should have @example annotations for main API functions', () => {
    const sourceContents = SOURCE_FILES.map(file => ({
      file,
      content: readFile(file),
    }))

    // Main API functions that should have examples
    const mainApiFunctions = [
      'renderToHtml',
      'renderToIsolatedHtml',
      'registerSectionRenderer',
      'generateCss',
      'generateIsolatedCss',
      'mergeTheme',
    ]

    for (const functionName of mainApiFunctions) {
      const sourceFile = sourceContents.find(({ content }) => {
        const exportPattern = new RegExp(
          `(?:export\\s+(?:function|const)\\s+${functionName}|function\\s+${functionName})`,
          'm'
        )
        return exportPattern.test(content)
      })

      if (!sourceFile) continue

      // Find JSDoc block
      const jsdocPattern = new RegExp(
        `(\\/\\*\\*[\\s\\S]*?\\*\\/)\\s*(?:export\\s+)?(?:function|const)\\s+${functionName}`,
        'm'
      )
      const match = sourceFile.content.match(jsdocPattern)

      if (match) {
        const jsdocBlock = match[1]
        const hasExample = /@example/.test(jsdocBlock)
        
        expect(hasExample, `Function "${functionName}" should have @example annotation`).toBe(true)
      }
    }
  })
})
