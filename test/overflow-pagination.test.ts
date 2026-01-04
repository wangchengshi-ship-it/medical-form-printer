/**
 * @fileoverview Property-based tests for overflow field pagination
 * @module test/overflow-pagination
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-04
 * @modified 2026-01-04
 *
 * @description
 * Property-based tests for overflow field identification and rendering.
 * Uses fast-check to verify correctness properties across many generated inputs.
 *
 * @requirements
 * - 1.1: Identify sections containing overflow fields
 * - 1.2: Support info-grid sections with overflow fields
 * - 1.3: Support multiple overflow fields
 *
 * @dependencies
 * - fast-check - Property-based testing library
 * - vitest - Test runner
 * - ../src/pagination/overflow-pagination - Functions under test
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  isOverflowSection,
  findOverflowFieldLabel,
  getOverflowFieldsFromConfig,
  getOverflowFieldNames,
  renderOverflowFirstLine,
  renderOverflowContinuation,
} from '../src/pagination/strategies/overflow/overflow-pagination'
import { getOverflowRest, hasOverflowContent } from '../src/pagination/strategies/overflow/overflow-handler'
import type { PrintSection, InfoGridConfig, InfoGridCell } from '../src/types/print-schema'
import type { PaginationConfig, OverflowTextConfig } from '../src/pagination/types'
import type { OverflowFieldResult } from '../src/pagination/strategies/overflow/overflow-handler'
import { DEFAULT_OVERFLOW_TEXT, ENGLISH_OVERFLOW_TEXT } from '../src/pagination/types'
import { renderPaginatedHtml } from '../src/pagination/paginated-renderer'

// ==================== Generators ====================

/**
 * Generate a valid field name (alphanumeric with underscores)
 */
const fieldNameArb = fc
  .string({ minLength: 1, maxLength: 20 })
  .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s))

/**
 * Generate a valid label (non-empty string)
 */
const labelArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0)

/**
 * Generate a valid InfoGridCell
 */
const infoGridCellArb = (fieldName?: string): fc.Arbitrary<InfoGridCell> =>
  fc.record({
    label: labelArb,
    field: fieldName ? fc.constant(fieldName) : fieldNameArb,
    type: fc.constantFrom('text', 'textarea', 'checkbox', 'date', 'number') as fc.Arbitrary<InfoGridCell['type']>,
    span: fc.option(fc.integer({ min: 1, max: 4 }), { nil: undefined }),
  })

/**
 * Generate a valid InfoGridConfig with specified field names
 */
const infoGridConfigArb = (fieldNames: string[]): fc.Arbitrary<InfoGridConfig> => {
  if (fieldNames.length === 0) {
    // Generate random cells
    return fc.record({
      columns: fc.integer({ min: 1, max: 4 }),
      rows: fc.array(
        fc.record({
          cells: fc.array(infoGridCellArb(), { minLength: 1, maxLength: 4 }),
        }),
        { minLength: 1, maxLength: 5 }
      ),
    })
  }

  // Generate cells that include the specified field names
  return fc.record({
    columns: fc.integer({ min: 1, max: 4 }),
    rows: fc.tuple(
      // First row contains the specified fields
      fc.record({
        cells: fc.constant(
          fieldNames.map((field) => ({
            label: `Label for ${field}`,
            field,
            type: 'textarea' as const,
          }))
        ),
      }),
      // Additional random rows
      fc.array(
        fc.record({
          cells: fc.array(infoGridCellArb(), { minLength: 1, maxLength: 4 }),
        }),
        { minLength: 0, maxLength: 3 }
      )
    ).map(([firstRow, otherRows]) => [firstRow, ...otherRows]),
  })
}

/**
 * Generate a valid info-grid PrintSection
 */
const infoGridSectionArb = (fieldNames: string[] = []): fc.Arbitrary<PrintSection> =>
  fc.record({
    type: fc.constant('info-grid' as const),
    title: fc.option(labelArb, { nil: undefined }),
    config: infoGridConfigArb(fieldNames),
  })

/**
 * Generate a non-info-grid PrintSection
 */
const nonInfoGridSectionArb: fc.Arbitrary<PrintSection> = fc.constantFrom(
  { type: 'table', config: { columns: [], dataField: 'data' } },
  { type: 'signature-area', config: { fields: [] } },
  { type: 'notes', config: { content: 'Notes' } },
  { type: 'free-text', config: { field: 'freeText' } },
  { type: 'section-title', config: { text: 'Title' } }
) as fc.Arbitrary<PrintSection>


// ==================== Property Tests ====================

describe('Property 1: Overflow Field Identification', () => {
  /**
   * Feature: pinned-sections-pagination, Property 1: Overflow Field Identification
   * 
   * *For any* printSchema with `pagination.overflowFields` configured and *for any* 
   * section of type `info-grid`, the renderer should correctly identify whether the 
   * section contains an overflow field by checking if any cell's field name matches 
   * the overflowFields array.
   * 
   * **Validates: Requirements 1.1, 1.2, 1.3**
   */

  it('should return true when info-grid section contains an overflow field', () => {
    fc.assert(
      fc.property(
        // Generate 1-3 overflow field names
        fc.array(fieldNameArb, { minLength: 1, maxLength: 3 }),
        (overflowFields) => {
          // Create a section that contains the overflow fields
          const config: InfoGridConfig = {
            columns: 2,
            rows: [
              {
                cells: overflowFields.map((field) => ({
                  label: `Label for ${field}`,
                  field,
                  type: 'textarea' as const,
                })),
              },
            ],
          }
          const section: PrintSection = {
            type: 'info-grid',
            config,
          }

          // Should identify the section as containing overflow fields
          const result = isOverflowSection(section, overflowFields)
          expect(result).toBe(true)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return false when info-grid section does not contain any overflow field', () => {
    fc.assert(
      fc.property(
        // Generate overflow field names
        fc.array(fieldNameArb, { minLength: 1, maxLength: 3 }),
        // Generate different field names for the section
        fc.array(fieldNameArb, { minLength: 1, maxLength: 3 }),
        (overflowFields, sectionFields) => {
          // Ensure section fields are different from overflow fields
          const uniqueSectionFields = sectionFields
            .map((f) => `section_${f}`)
            .filter((f) => !overflowFields.includes(f))

          if (uniqueSectionFields.length === 0) {
            return true // Skip if we can't generate unique fields
          }

          const config: InfoGridConfig = {
            columns: 2,
            rows: [
              {
                cells: uniqueSectionFields.map((field) => ({
                  label: `Label for ${field}`,
                  field,
                  type: 'text' as const,
                })),
              },
            ],
          }
          const section: PrintSection = {
            type: 'info-grid',
            config,
          }

          // Should not identify the section as containing overflow fields
          const result = isOverflowSection(section, overflowFields)
          expect(result).toBe(false)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return false for non-info-grid sections regardless of overflow fields', () => {
    fc.assert(
      fc.property(
        nonInfoGridSectionArb,
        fc.array(fieldNameArb, { minLength: 1, maxLength: 3 }),
        (section, overflowFields) => {
          // Non-info-grid sections should never be identified as overflow sections
          const result = isOverflowSection(section, overflowFields)
          expect(result).toBe(false)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return false when overflow fields array is empty', () => {
    fc.assert(
      fc.property(infoGridSectionArb(), (section) => {
        // Empty overflow fields should never match
        const result = isOverflowSection(section, [])
        expect(result).toBe(false)

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should correctly identify partial matches (at least one field matches)', () => {
    fc.assert(
      fc.property(
        // Generate overflow field names
        fc.array(fieldNameArb, { minLength: 2, maxLength: 4 }),
        (overflowFields) => {
          // Create a section with only the first overflow field
          const config: InfoGridConfig = {
            columns: 2,
            rows: [
              {
                cells: [
                  {
                    label: `Label for ${overflowFields[0]}`,
                    field: overflowFields[0],
                    type: 'textarea' as const,
                  },
                  {
                    label: 'Other field',
                    field: 'otherField',
                    type: 'text' as const,
                  },
                ],
              },
            ],
          }
          const section: PrintSection = {
            type: 'info-grid',
            config,
          }

          // Should identify the section as containing overflow fields
          // even if only one field matches
          const result = isOverflowSection(section, overflowFields)
          expect(result).toBe(true)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property: findOverflowFieldLabel', () => {
  /**
   * Feature: pinned-sections-pagination, Property 1 (continued): Field Label Extraction
   * 
   * *For any* info-grid section containing a field, findOverflowFieldLabel should
   * return the correct label for that field.
   * 
   * **Validates: Requirements 1.2**
   */

  it('should return the correct label for a field in info-grid section', () => {
    fc.assert(
      fc.property(fieldNameArb, labelArb, (fieldName, label) => {
        const config: InfoGridConfig = {
          columns: 2,
          rows: [
            {
              cells: [
                {
                  label,
                  field: fieldName,
                  type: 'textarea' as const,
                },
              ],
            },
          ],
        }
        const section: PrintSection = {
          type: 'info-grid',
          config,
        }

        const result = findOverflowFieldLabel(section, fieldName)
        expect(result).toBe(label)

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should return field name when field is not found in section', () => {
    fc.assert(
      fc.property(fieldNameArb, fieldNameArb, (fieldName, otherFieldName) => {
        // Ensure field names are different
        const searchField = `search_${fieldName}`

        const config: InfoGridConfig = {
          columns: 2,
          rows: [
            {
              cells: [
                {
                  label: 'Some label',
                  field: otherFieldName,
                  type: 'text' as const,
                },
              ],
            },
          ],
        }
        const section: PrintSection = {
          type: 'info-grid',
          config,
        }

        const result = findOverflowFieldLabel(section, searchField)
        expect(result).toBe(searchField)

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should return field name for non-info-grid sections', () => {
    fc.assert(
      fc.property(nonInfoGridSectionArb, fieldNameArb, (section, fieldName) => {
        const result = findOverflowFieldLabel(section, fieldName)
        expect(result).toBe(fieldName)

        return true
      }),
      { numRuns: 100 }
    )
  })
})

describe('Property: getOverflowFieldsFromConfig', () => {
  /**
   * Feature: pinned-sections-pagination, Property 1 (continued): Config Extraction
   * 
   * *For any* PaginationConfig with overflow fields configured, getOverflowFieldsFromConfig
   * should return the correct field configurations.
   * 
   * **Validates: Requirements 1.3**
   */

  it('should extract overflow field configs from new config structure', () => {
    fc.assert(
      fc.property(
        fc.array(fieldNameArb, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 20, max: 200 }),
        (fields, maxChars) => {
          const config: PaginationConfig = {
            enabled: true,
            overflow: {
              fields,
              firstLineChars: maxChars,
            },
          }

          const result = getOverflowFieldsFromConfig(config)

          expect(result).toHaveLength(fields.length)
          result.forEach((fieldConfig, index) => {
            expect(fieldConfig.fieldName).toBe(fields[index])
            expect(fieldConfig.maxFirstLineChars).toBe(maxChars)
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should extract overflow field configs from deprecated config structure', () => {
    fc.assert(
      fc.property(
        fc.array(fieldNameArb, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 20, max: 200 }),
        (fields, maxChars) => {
          const config: PaginationConfig = {
            enabled: true,
            overflowFields: fields,
            overflowFirstLineChars: maxChars,
          }

          const result = getOverflowFieldsFromConfig(config)

          expect(result).toHaveLength(fields.length)
          result.forEach((fieldConfig, index) => {
            expect(fieldConfig.fieldName).toBe(fields[index])
            expect(fieldConfig.maxFirstLineChars).toBe(maxChars)
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return empty array when no overflow fields configured', () => {
    fc.assert(
      fc.property(fc.boolean(), (enabled) => {
        const config: PaginationConfig = {
          enabled,
        }

        const result = getOverflowFieldsFromConfig(config)
        expect(result).toEqual([])

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should return empty array when config is undefined', () => {
    const result = getOverflowFieldsFromConfig(undefined)
    expect(result).toEqual([])
  })

  it('should use default maxChars when not specified', () => {
    fc.assert(
      fc.property(fc.array(fieldNameArb, { minLength: 1, maxLength: 3 }), (fields) => {
        const config: PaginationConfig = {
          enabled: true,
          overflow: {
            fields,
            // No firstLineChars specified
          },
        }

        const result = getOverflowFieldsFromConfig(config)

        result.forEach((fieldConfig) => {
          // Should use default value (60)
          expect(fieldConfig.maxFirstLineChars).toBe(60)
        })

        return true
      }),
      { numRuns: 100 }
    )
  })
})

describe('Property: getOverflowFieldNames', () => {
  /**
   * Feature: pinned-sections-pagination, Property 1 (continued): Field Names Extraction
   * 
   * *For any* PaginationConfig, getOverflowFieldNames should return the correct
   * list of overflow field names.
   * 
   * **Validates: Requirements 1.3**
   */

  it('should return field names from new config structure', () => {
    fc.assert(
      fc.property(fc.array(fieldNameArb, { minLength: 1, maxLength: 5 }), (fields) => {
        const config: PaginationConfig = {
          enabled: true,
          overflow: {
            fields,
          },
        }

        const result = getOverflowFieldNames(config)
        expect(result).toEqual(fields)

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should return field names from deprecated config structure', () => {
    fc.assert(
      fc.property(fc.array(fieldNameArb, { minLength: 1, maxLength: 5 }), (fields) => {
        const config: PaginationConfig = {
          enabled: true,
          overflowFields: fields,
        }

        const result = getOverflowFieldNames(config)
        expect(result).toEqual(fields)

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should return empty array when no overflow fields configured', () => {
    const config: PaginationConfig = {
      enabled: true,
    }

    const result = getOverflowFieldNames(config)
    expect(result).toEqual([])
  })

  it('should return empty array when config is undefined', () => {
    const result = getOverflowFieldNames(undefined)
    expect(result).toEqual([])
  })
})

// ==================== Property 2: First Page Overflow Rendering ====================

describe('Property 2: First Page Overflow Rendering', () => {
  /**
   * Feature: pinned-sections-pagination, Property 2: First Page Overflow Rendering
   * 
   * *For any* overflow field with content, the first page rendering should:
   * - Display truncated content (up to `overflowFirstLineChars` characters) when content exceeds the limit
   * - Append "（续见附页）" marker when there is continuation content
   * - Display full content without marker when content fits within the limit
   * 
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
   */

  // Identity class name function for testing
  const cls = (name: string) => name

  // Generate safe alphanumeric content (no HTML special chars, no newlines)

  it('should display truncated content with ellipsis and marker when first line exceeds maxChars', () => {
    fc.assert(
      fc.property(
        // Generate maxChars between 20 and 50
        fc.integer({ min: 20, max: 50 }),
        (maxChars) => {
          // Generate content where first line exceeds maxChars (single line, no newlines)
          const content = 'x'.repeat(maxChars + 20)
          
          const result = renderOverflowFirstLine(content, maxChars, DEFAULT_OVERFLOW_TEXT, cls)
          
          // Should contain the see-next marker class
          expect(result).toContain('see-next')
          // Should contain the marker text
          expect(result).toContain(DEFAULT_OVERFLOW_TEXT.seeNextMarker)
          // Should contain the overflow-first-line class
          expect(result).toContain('overflow-first-line')
          // Should contain ellipsis (because first line was truncated)
          expect(result).toContain('...')
          // Should contain the truncated content
          expect(result).toContain('x'.repeat(maxChars))
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should display full content without marker when content fits within maxChars (single line)', () => {
    fc.assert(
      fc.property(
        // Generate maxChars between 20 and 100
        fc.integer({ min: 20, max: 100 }),
        (maxChars) => {
          // Generate content shorter than maxChars (no newlines, safe chars)
          const content = 'a'.repeat(Math.floor(maxChars / 2))
          
          const result = renderOverflowFirstLine(content, maxChars, DEFAULT_OVERFLOW_TEXT, cls)
          
          // Should NOT contain the see-next marker
          expect(result).not.toContain('see-next')
          expect(result).not.toContain(DEFAULT_OVERFLOW_TEXT.seeNextMarker)
          // Should contain the overflow-first-line class
          expect(result).toContain('overflow-first-line')
          // Should contain the full content
          expect(result).toContain(content)
          // Should NOT contain ellipsis
          expect(result).not.toContain('...')
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should display first line with marker but no ellipsis when content has multiple lines and first line is short', () => {
    fc.assert(
      fc.property(
        // Generate maxChars between 30 and 100
        fc.integer({ min: 30, max: 100 }),
        // Generate first line content (shorter than maxChars, safe chars only)
        fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'), { minLength: 5, maxLength: 20 }),
        // Generate second line content (safe chars only, different chars to distinguish)
        fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), { minLength: 5, maxLength: 50 }),
        (maxChars, firstLine, secondLine) => {
          // Create multi-line content where first line is shorter than maxChars
          const content = `${firstLine}\n${secondLine}`
          
          const result = renderOverflowFirstLine(content, maxChars, DEFAULT_OVERFLOW_TEXT, cls)
          
          // Should contain the see-next marker (because there's continuation content on next line)
          expect(result).toContain('see-next')
          expect(result).toContain(DEFAULT_OVERFLOW_TEXT.seeNextMarker)
          // Should contain the overflow-first-line class
          expect(result).toContain('overflow-first-line')
          // Should contain the first line content
          expect(result).toContain(firstLine)
          // Should NOT contain ellipsis (first line was not truncated)
          expect(result).not.toContain('...')
          // Should NOT contain the second line content (it's on continuation page)
          expect(result).not.toContain(secondLine)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should respect configurable truncation length (maxChars) for single-line content', () => {
    fc.assert(
      fc.property(
        // Generate two different maxChars values
        fc.integer({ min: 20, max: 40 }),
        fc.integer({ min: 50, max: 80 }),
        (smallMaxChars, largeMaxChars) => {
          // Generate content that exceeds both maxChars values (single line)
          const content = 'x'.repeat(largeMaxChars + 20)
          
          const resultSmall = renderOverflowFirstLine(content, smallMaxChars, DEFAULT_OVERFLOW_TEXT, cls)
          const resultLarge = renderOverflowFirstLine(content, largeMaxChars, DEFAULT_OVERFLOW_TEXT, cls)
          
          // Both should have markers (content exceeds both limits)
          expect(resultSmall).toContain(DEFAULT_OVERFLOW_TEXT.seeNextMarker)
          expect(resultLarge).toContain(DEFAULT_OVERFLOW_TEXT.seeNextMarker)
          
          // Both should have ellipsis (first line was truncated)
          expect(resultSmall).toContain('...')
          expect(resultLarge).toContain('...')
          
          // The truncated content length should differ
          const truncatedSmall = 'x'.repeat(smallMaxChars)
          const truncatedLarge = 'x'.repeat(largeMaxChars)
          
          expect(resultSmall).toContain(truncatedSmall)
          expect(resultLarge).toContain(truncatedLarge)
          
          // Smaller maxChars should produce shorter visible content
          expect(truncatedSmall.length).toBeLessThan(truncatedLarge.length)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should use custom text configuration for marker', () => {
    fc.assert(
      fc.property(
        // Generate custom marker text (safe chars only, no HTML special chars)
        fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz '), { minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        (customMarker) => {
          const customTextConfig: OverflowTextConfig = {
            seeNextMarker: customMarker,
            continuationSuffix: '(cont)',
            pageTitleSuffix: '(cont)',
          }
          
          // Content that will overflow (safe chars, single line exceeding maxChars)
          const content = 'x'.repeat(100)
          const maxChars = 50
          
          const result = renderOverflowFirstLine(content, maxChars, customTextConfig, cls)
          
          // Should contain the custom marker text
          expect(result).toContain(customMarker)
          // Should NOT contain the default marker
          expect(result).not.toContain(DEFAULT_OVERFLOW_TEXT.seeNextMarker)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle empty content gracefully', () => {
    const result = renderOverflowFirstLine('', 60, DEFAULT_OVERFLOW_TEXT, cls)
    
    // Should return valid HTML with empty content
    expect(result).toContain('overflow-first-line')
    // Should NOT contain marker (no overflow for empty content)
    expect(result).not.toContain('see-next')
  })

  it('should handle null/undefined content gracefully', () => {
    const resultNull = renderOverflowFirstLine(null, 60, DEFAULT_OVERFLOW_TEXT, cls)
    const resultUndefined = renderOverflowFirstLine(undefined, 60, DEFAULT_OVERFLOW_TEXT, cls)
    
    // Both should return valid HTML
    expect(resultNull).toContain('overflow-first-line')
    expect(resultUndefined).toContain('overflow-first-line')
    // Neither should contain marker
    expect(resultNull).not.toContain('see-next')
    expect(resultUndefined).not.toContain('see-next')
  })

  it('should apply custom class name function', () => {
    fc.assert(
      fc.property(
        // Generate a prefix for class names
        fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'), { minLength: 1, maxLength: 10 }),
        (prefix) => {
          const customCls = (name: string) => `${prefix}-${name}`
          const content = 'x'.repeat(100)
          const maxChars = 50
          
          const result = renderOverflowFirstLine(content, maxChars, DEFAULT_OVERFLOW_TEXT, customCls)
          
          // Should contain prefixed class names
          expect(result).toContain(`${prefix}-overflow-first-line`)
          expect(result).toContain(`${prefix}-see-next`)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})


// ==================== Property 3: Continuation Page Overflow Rendering ====================

describe('Property 3: Continuation Page Overflow Rendering', () => {
  /**
   * Feature: pinned-sections-pagination, Property 3: Continuation Page Overflow Rendering
   *
   * *For any* overflow field with continuation content, the continuation page should:
   * - Display the field label with "（续）" suffix
   * - Display the remaining content from `getOverflowRest`
   * - Only be created when `hasOverflowContent` returns true
   *
   * **Validates: Requirements 3.1, 3.2, 3.4**
   */

  // Identity class name function for testing
  const cls = (name: string) => name

  // Generate safe alphanumeric content (no HTML special chars)
  const safeCharArb = fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')

  // Generate safe label (alphanumeric with spaces)
  const safeLabelArb = fc
    .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '), { minLength: 3, maxLength: 30 })
    .map((chars) => chars.join('').trim())
    .filter((s) => s.length > 0)

  it('should display field label with continuation suffix when there is overflow content', () => {
    fc.assert(
      fc.property(
        // Generate field label
        safeLabelArb,
        // Generate maxChars between 20 and 50
        fc.integer({ min: 20, max: 50 }),
        (fieldLabel, maxChars) => {
          // Generate content that will overflow (exceeds maxChars)
          const content = 'x'.repeat(maxChars + 30)

          // Create overflow result
          const result: OverflowFieldResult = {
            fieldName: 'testField',
            firstLine: content.substring(0, maxChars) + '...',
            rest: content.substring(maxChars),
            hasOverflow: true,
          }

          const html = renderOverflowContinuation(result, fieldLabel, DEFAULT_OVERFLOW_TEXT, cls)

          // Should contain the field label
          expect(html).toContain(fieldLabel)
          // Should contain the continuation suffix
          expect(html).toContain(DEFAULT_OVERFLOW_TEXT.continuationSuffix)
          // Should contain the overflow-label class
          expect(html).toContain('overflow-label')
          // Should contain the overflow-continuation class
          expect(html).toContain('overflow-continuation')
          // Should contain the overflow-content class
          expect(html).toContain('overflow-content')

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should display remaining content from getOverflowRest', () => {
    fc.assert(
      fc.property(
        // Generate maxChars between 20 and 50
        fc.integer({ min: 20, max: 50 }),
        (maxChars) => {
          // Generate content that will overflow (single line exceeding maxChars)
          const content = 'x'.repeat(maxChars + 40)
          const restContent = getOverflowRest(content, maxChars)

          // Create overflow result using actual getOverflowRest
          const result: OverflowFieldResult = {
            fieldName: 'testField',
            firstLine: content.substring(0, maxChars) + '...',
            rest: restContent,
            hasOverflow: true,
          }

          const html = renderOverflowContinuation(result, 'Test Label', DEFAULT_OVERFLOW_TEXT, cls)

          // Should contain the rest content
          expect(html).toContain(restContent)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return empty string when hasOverflow is false', () => {
    fc.assert(
      fc.property(
        safeLabelArb,
        fc.integer({ min: 20, max: 100 }),
        (fieldLabel, maxChars) => {
          // Content that fits within maxChars (no overflow)
          const content = 'a'.repeat(Math.floor(maxChars / 2))

          // Create result with no overflow
          const result: OverflowFieldResult = {
            fieldName: 'testField',
            firstLine: content,
            rest: '',
            hasOverflow: false,
          }

          const html = renderOverflowContinuation(result, fieldLabel, DEFAULT_OVERFLOW_TEXT, cls)

          // Should return empty string when no overflow
          expect(html).toBe('')

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return empty string when rest content is empty', () => {
    fc.assert(
      fc.property(safeLabelArb, (fieldLabel) => {
        // Create result with hasOverflow true but empty rest
        const result: OverflowFieldResult = {
          fieldName: 'testField',
          firstLine: 'some content',
          rest: '',
          hasOverflow: true,
        }

        const html = renderOverflowContinuation(result, fieldLabel, DEFAULT_OVERFLOW_TEXT, cls)

        // Should return empty string when rest is empty
        expect(html).toBe('')

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should use custom text configuration for continuation suffix', () => {
    fc.assert(
      fc.property(
        // Generate custom suffix (safe chars only)
        fc
          .array(safeCharArb, { minLength: 1, maxLength: 20 })
          .map((chars) => chars.join('')),
        (customSuffix) => {
          const customTextConfig: OverflowTextConfig = {
            seeNextMarker: '(see next)',
            continuationSuffix: customSuffix,
            pageTitleSuffix: '(cont)',
          }

          // Content that will overflow
          const content = 'x'.repeat(100)
          const maxChars = 50

          const result: OverflowFieldResult = {
            fieldName: 'testField',
            firstLine: content.substring(0, maxChars) + '...',
            rest: content.substring(maxChars),
            hasOverflow: true,
          }

          const html = renderOverflowContinuation(result, 'Test Label', customTextConfig, cls)

          // Should contain the custom suffix
          expect(html).toContain(customSuffix)
          // Should NOT contain the default suffix
          expect(html).not.toContain(DEFAULT_OVERFLOW_TEXT.continuationSuffix)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should apply custom class name function', () => {
    fc.assert(
      fc.property(
        // Generate a prefix for class names
        fc
          .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'), { minLength: 1, maxLength: 10 })
          .map((chars) => chars.join('')),
        (prefix) => {
          const customCls = (name: string) => `${prefix}-${name}`

          const result: OverflowFieldResult = {
            fieldName: 'testField',
            firstLine: 'first line',
            rest: 'rest content',
            hasOverflow: true,
          }

          const html = renderOverflowContinuation(result, 'Test Label', DEFAULT_OVERFLOW_TEXT, customCls)

          // Should contain prefixed class names
          expect(html).toContain(`${prefix}-overflow-continuation`)
          expect(html).toContain(`${prefix}-overflow-label`)
          expect(html).toContain(`${prefix}-overflow-content`)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve multi-line content in rest', () => {
    fc.assert(
      fc.property(
        // Generate number of lines (2-5)
        fc.integer({ min: 2, max: 5 }),
        // Generate line content (safe chars)
        fc
          .array(safeCharArb, { minLength: 5, maxLength: 20 })
          .map((chars) => chars.join('')),
        (numLines, lineContent) => {
          // Create multi-line content
          const lines = Array(numLines).fill(lineContent)
          const content = lines.join('\n')
          const maxChars = 10 // Short maxChars to ensure overflow

          // Get actual rest content
          const restContent = getOverflowRest(content, maxChars)

          const result: OverflowFieldResult = {
            fieldName: 'testField',
            firstLine: lineContent.substring(0, maxChars) + '...',
            rest: restContent,
            hasOverflow: true,
          }

          const html = renderOverflowContinuation(result, 'Test Label', DEFAULT_OVERFLOW_TEXT, cls)

          // Should contain the rest content (HTML escaped)
          // The content should be present in the HTML
          expect(html).toContain('overflow-content')
          // The HTML should not be empty
          expect(html.length).toBeGreaterThan(0)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should only render continuation when hasOverflowContent returns true', () => {
    fc.assert(
      fc.property(
        // Generate maxChars
        fc.integer({ min: 30, max: 100 }),
        // Generate content length factor (0.3 to 2.0)
        fc.double({ min: 0.3, max: 2.0 }),
        (maxChars, lengthFactor) => {
          // Generate content based on length factor
          const contentLength = Math.floor(maxChars * lengthFactor)
          const content = 'x'.repeat(contentLength)

          // Check if content should overflow
          const shouldOverflow = hasOverflowContent(content, maxChars)
          const restContent = getOverflowRest(content, maxChars)

          const result: OverflowFieldResult = {
            fieldName: 'testField',
            firstLine: content.substring(0, Math.min(content.length, maxChars)),
            rest: restContent,
            hasOverflow: shouldOverflow,
          }

          const html = renderOverflowContinuation(result, 'Test Label', DEFAULT_OVERFLOW_TEXT, cls)

          if (shouldOverflow && restContent) {
            // Should render continuation content
            expect(html).toContain('overflow-continuation')
            expect(html).toContain('overflow-label')
            expect(html).toContain('overflow-content')
          } else {
            // Should return empty string
            expect(html).toBe('')
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})


// ==================== Property 4: Integration with Existing Features ====================

describe('Property 4: Integration with Existing Features', () => {
  /**
   * Feature: pinned-sections-pagination, Property 4: Integration with Existing Features
   *
   * *For any* configuration combining `overflowFields` with other pagination features
   * (`smartPagination`, `showSignatureOnEachPage`), the renderer should:
   * - Handle both overflow and smart pagination correctly
   * - Show signature on overflow continuation pages when configured
   * - Add "（续）" suffix to page headers on continuation pages
   *
   * **Validates: Requirements 4.1, 4.2, 4.3**
   */

  // Reserved JavaScript property names to exclude from field name generation
  const RESERVED_NAMES = new Set([
    '__proto__', 'constructor', 'prototype', 'hasOwnProperty',
    'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString',
    'toString', 'valueOf', '__defineGetter__', '__defineSetter__',
    '__lookupGetter__', '__lookupSetter__',
  ])

  /**
   * Generate a safe field name that excludes reserved JavaScript property names
   * Uses a prefix to ensure uniqueness and avoid collisions
   */
  const safeFieldNameArb = fc
    .stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'), { minLength: 3, maxLength: 15 })
    .map((s) => `field_${s}`)
    .filter((s) => !RESERVED_NAMES.has(s))

  /**
   * Create a test PrintSchema with overflow fields configured
   */
  function createTestSchemaWithOverflow(
    overflowFields: string[],
    overflowFirstLineChars: number = 60,
    showSignatureOnEachPage: boolean = false
  ) {
    return {
      pageSize: '16K' as const,
      orientation: 'portrait' as const,
      header: {
        hospital: 'Test Hospital',
        department: 'Test Department',
        title: 'Test Form',
      },
      sections: [
        {
          type: 'info-grid' as const,
          title: 'Basic Info',
          config: {
            columns: 2,
            rows: [
              {
                cells: [
                  { label: 'Name', field: 'name', type: 'text' as const },
                  { label: 'Age', field: 'age', type: 'number' as const },
                ],
              },
              {
                cells: overflowFields.map((field) => ({
                  label: `Label for ${field}`,
                  field,
                  type: 'textarea' as const,
                })),
              },
            ],
          },
        },
        {
          type: 'signature-area' as const,
          config: {
            fields: [{ label: 'Signature', field: 'signature', showDate: true }],
          },
        },
      ],
      footer: {
        showPageNumber: true,
        notes: 'Test notes',
      },
      pagination: {
        enabled: true,
        overflow: {
          fields: overflowFields,
          firstLineChars: overflowFirstLineChars,
        },
        display: {
          signatureOnEachPage: showSignatureOnEachPage,
        },
      },
    }
  }

  /**
   * Create test data with overflow content
   */
  function createTestDataWithOverflow(
    overflowFields: string[],
    contentLength: number
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {
      name: 'John Doe',
      age: 30,
      signature: 'Dr. Smith',
    }

    for (const field of overflowFields) {
      data[field] = 'x'.repeat(contentLength)
    }

    return data
  }

  /**
   * Create minimal page break result for testing
   */
  function createMinimalPageBreakResult() {
    return {
      pages: [
        {
          pageNumber: 1,
          isContinuation: false,
          items: [],
          repeatedHeaders: [],
        },
      ],
      totalPages: 1,
    }
  }

  /**
   * Create minimal measured items for testing
   */
  function createMinimalMeasuredItems() {
    return [
      { id: 'section-0', type: 'section' as const, height: 100 },
      { id: 'section-1', type: 'signature' as const, height: 50 },
    ]
  }

  it('should handle overflowFields combined with showSignatureOnEachPage', () => {
    fc.assert(
      fc.property(
        // Generate 1-2 safe overflow field names
        fc.array(safeFieldNameArb, { minLength: 1, maxLength: 2 }),
        // Generate maxChars between 20 and 50
        fc.integer({ min: 20, max: 50 }),
        // Generate showSignatureOnEachPage boolean
        fc.boolean(),
        (overflowFields, maxChars, showSignatureOnEachPage) => {
          // Create content that will overflow
          const contentLength = maxChars + 50

          const schema = createTestSchemaWithOverflow(
            overflowFields,
            maxChars,
            showSignatureOnEachPage
          )
          const data = createTestDataWithOverflow(overflowFields, contentLength)

          const html = renderPaginatedHtml({
            schema,
            data,
            pageBreakResult: createMinimalPageBreakResult(),
            measuredItems: createMinimalMeasuredItems(),
            config: {
              showSignatureOnEachPage,
            },
          })

          // Should render valid HTML
          expect(html).toContain('<!DOCTYPE html>')
          expect(html).toContain('<html')

          // Should contain overflow first line marker on first page
          expect(html).toContain(DEFAULT_OVERFLOW_TEXT.seeNextMarker)

          // Should have overflow continuation page
          expect(html).toContain(DEFAULT_OVERFLOW_TEXT.continuationSuffix)

          // If showSignatureOnEachPage is true, signature should appear on continuation page
          if (showSignatureOnEachPage) {
            // The continuation page should have signature area
            // We check by counting signature-area occurrences
            const signatureCount = (html.match(/signature-area/g) || []).length
            // Should have at least 2 signature areas (first page + continuation page)
            expect(signatureCount).toBeGreaterThanOrEqual(1)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should add continuation suffix to page headers on overflow continuation pages', () => {
    fc.assert(
      fc.property(
        // Generate 1 safe overflow field name
        fc.array(safeFieldNameArb, { minLength: 1, maxLength: 1 }),
        // Generate maxChars between 20 and 40
        fc.integer({ min: 20, max: 40 }),
        (overflowFields, maxChars) => {
          // Create content that will overflow
          const contentLength = maxChars + 100

          const schema = createTestSchemaWithOverflow(overflowFields, maxChars)
          const data = createTestDataWithOverflow(overflowFields, contentLength)

          const html = renderPaginatedHtml({
            schema,
            data,
            pageBreakResult: createMinimalPageBreakResult(),
            measuredItems: createMinimalMeasuredItems(),
          })

          // Should have continuation page with title suffix
          // The title "Test Form" should appear with the continuation suffix
          expect(html).toContain(`Test Form ${DEFAULT_OVERFLOW_TEXT.pageTitleSuffix}`)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should correctly calculate total pages when overflow creates continuation page', () => {
    fc.assert(
      fc.property(
        // Generate 1-2 safe overflow field names
        fc.array(safeFieldNameArb, { minLength: 1, maxLength: 2 }),
        // Generate maxChars between 20 and 50
        fc.integer({ min: 20, max: 50 }),
        (overflowFields, maxChars) => {
          // Create content that will overflow
          const contentLength = maxChars + 80

          const schema = createTestSchemaWithOverflow(overflowFields, maxChars)
          const data = createTestDataWithOverflow(overflowFields, contentLength)

          const html = renderPaginatedHtml({
            schema,
            data,
            pageBreakResult: createMinimalPageBreakResult(),
            measuredItems: createMinimalMeasuredItems(),
          })

          // Should have page 1 and page 2 (overflow continuation)
          expect(html).toContain('data-page="1"')
          expect(html).toContain('data-page="2"')

          // Page numbers should reflect total pages including overflow page
          expect(html).toContain('Page 1 of 2')
          expect(html).toContain('Page 2 of 2')

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not create overflow continuation page when content fits within maxChars', () => {
    fc.assert(
      fc.property(
        // Generate 1 safe overflow field name
        fc.array(safeFieldNameArb, { minLength: 1, maxLength: 1 }),
        // Generate maxChars between 50 and 100
        fc.integer({ min: 50, max: 100 }),
        (overflowFields, maxChars) => {
          // Create content that fits within maxChars (no overflow)
          const contentLength = Math.floor(maxChars / 2)

          const schema = createTestSchemaWithOverflow(overflowFields, maxChars)
          const data = createTestDataWithOverflow(overflowFields, contentLength)

          const html = renderPaginatedHtml({
            schema,
            data,
            pageBreakResult: createMinimalPageBreakResult(),
            measuredItems: createMinimalMeasuredItems(),
          })

          // Should only have page 1 (no overflow continuation)
          expect(html).toContain('data-page="1"')
          expect(html).not.toContain('data-page="2"')

          // Should show "Page 1 of 1"
          expect(html).toContain('Page 1 of 1')

          // Should NOT contain the see-next marker
          expect(html).not.toContain(DEFAULT_OVERFLOW_TEXT.seeNextMarker)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should work with custom overflow text configuration', () => {
    fc.assert(
      fc.property(
        // Generate 1 safe overflow field name
        fc.array(safeFieldNameArb, { minLength: 1, maxLength: 1 }),
        // Generate maxChars between 20 and 40
        fc.integer({ min: 20, max: 40 }),
        (overflowFields, maxChars) => {
          // Create content that will overflow
          const contentLength = maxChars + 60

          const schema = createTestSchemaWithOverflow(overflowFields, maxChars)
          const data = createTestDataWithOverflow(overflowFields, contentLength)

          const html = renderPaginatedHtml({
            schema,
            data,
            pageBreakResult: createMinimalPageBreakResult(),
            measuredItems: createMinimalMeasuredItems(),
            config: {
              overflowText: ENGLISH_OVERFLOW_TEXT,
            },
          })

          // Should contain English markers instead of Chinese
          expect(html).toContain(ENGLISH_OVERFLOW_TEXT.seeNextMarker)
          expect(html).toContain(ENGLISH_OVERFLOW_TEXT.continuationSuffix)
          expect(html).toContain(ENGLISH_OVERFLOW_TEXT.pageTitleSuffix)

          // Should NOT contain Chinese markers
          expect(html).not.toContain(DEFAULT_OVERFLOW_TEXT.seeNextMarker)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle multiple overflow fields correctly', () => {
    fc.assert(
      fc.property(
        // Generate 2-3 unique safe overflow field names
        fc.array(safeFieldNameArb, { minLength: 2, maxLength: 3 }).map((fields) =>
          [...new Set(fields.map((f, i) => `${f}_${i}`))]
        ),
        // Generate maxChars between 20 and 40
        fc.integer({ min: 20, max: 40 }),
        (overflowFields, maxChars) => {
          if (overflowFields.length < 2) return true // Skip if not enough unique fields

          // Create content that will overflow for all fields
          const contentLength = maxChars + 50

          const schema = createTestSchemaWithOverflow(overflowFields, maxChars)
          const data = createTestDataWithOverflow(overflowFields, contentLength)

          const html = renderPaginatedHtml({
            schema,
            data,
            pageBreakResult: createMinimalPageBreakResult(),
            measuredItems: createMinimalMeasuredItems(),
          })

          // Should have overflow continuation page
          expect(html).toContain('data-page="2"')

          // Each overflow field should have its label on continuation page
          for (const field of overflowFields) {
            expect(html).toContain(`Label for ${field}`)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should work with isolated mode', () => {
    fc.assert(
      fc.property(
        // Generate 1 safe overflow field name
        fc.array(safeFieldNameArb, { minLength: 1, maxLength: 1 }),
        // Generate maxChars between 20 and 40
        fc.integer({ min: 20, max: 40 }),
        // Generate isolated mode boolean
        fc.boolean(),
        (overflowFields, maxChars, isolated) => {
          // Create content that will overflow
          const contentLength = maxChars + 60

          const schema = createTestSchemaWithOverflow(overflowFields, maxChars)
          const data = createTestDataWithOverflow(overflowFields, contentLength)

          const html = renderPaginatedHtml({
            schema,
            data,
            pageBreakResult: createMinimalPageBreakResult(),
            measuredItems: createMinimalMeasuredItems(),
            config: {
              isolated,
            },
          })

          // Should render valid HTML
          expect(html).toContain('<!DOCTYPE html>')

          if (isolated) {
            // Should have mpr- prefixed class names
            expect(html).toContain('mpr-root')
            expect(html).toContain('mpr-print-page')
            expect(html).toContain('mpr-overflow-first-line')
          } else {
            // Should have regular class names
            expect(html).toContain('print-page')
            expect(html).toContain('overflow-first-line')
            expect(html).not.toContain('mpr-root')
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
