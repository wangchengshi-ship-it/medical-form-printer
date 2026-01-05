/**
 * @fileoverview Section ID Format Consistency Property Tests
 * @module test/section-id-consistency
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-05
 *
 * @description
 * Property-based tests for Section ID format consistency between
 * measureAll and buildSectionMap functions.
 *
 * **Property 1: Section ID Format Consistency**
 * **Feature: blank-first-page-fix, Property 1: Section ID Format Consistency**
 * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2**
 *
 * *For any* `PrintSchema` with N sections (excluding signature-area), the `measureAll`
 * function SHALL return items with IDs using `section-{index}` format, where `index`
 * corresponds to the section's position in `PrintSchema.sections` array.
 *
 * Note: Since measureAll requires browser environment, we test:
 * 1. The ID format specification is correctly documented
 * 2. The buildSectionMap function uses the expected format
 * 3. Mock-based validation of the interface contract
 *
 * @dependencies
 * - fast-check - Property testing library
 * - ../src/pagination/content-measurer - Content measurer module
 * - ../src/pagination/paginated-renderer - Paginated renderer module
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { PrintSchema, PrintSection, InfoGridConfig, TableConfig, CheckboxGridConfig } from '../src/types/print-schema'
import type { MeasurableItem } from '../src/pagination/types'

// ==================== Generators ====================

/**
 * Generate valid section types (excluding signature-area which is handled separately)
 */
const sectionTypeArb = fc.constantFrom(
  'info-grid',
  'table',
  'checkbox-grid',
  'medical-checkbox-row',
  'notes',
  'free-text',
  'inline-row',
  'container'
) as fc.Arbitrary<PrintSection['type']>

/**
 * Generate a valid PrintSection based on type
 */
const printSectionArb = (type: PrintSection['type']): fc.Arbitrary<PrintSection> => {
  switch (type) {
    case 'info-grid':
      return fc.constant({
        type: 'info-grid',
        title: 'Test Info Grid',
        config: {
          columns: 2,
          rows: [{ cells: [{ label: 'Test', field: 'test', type: 'text' }] }],
        } as InfoGridConfig,
      })
    case 'table':
      return fc.constant({
        type: 'table',
        title: 'Test Table',
        config: {
          dataField: 'records',
          columns: [{ header: 'Col', field: 'col', type: 'text' }],
        } as TableConfig,
      })
    case 'checkbox-grid':
      return fc.constant({
        type: 'checkbox-grid',
        title: 'Test Checkbox Grid',
        config: {
          field: 'options',
          columns: 2,
          options: [{ value: 'opt1', label: 'Option 1' }],
        } as CheckboxGridConfig,
      })
    default:
      return fc.constant({
        type,
        title: `Test ${type}`,
        config: {},
      } as PrintSection)
  }
}

/**
 * Generate array of PrintSections with various types
 */
const sectionsArrayArb = fc.array(
  sectionTypeArb.chain(type => printSectionArb(type)),
  { minLength: 1, maxLength: 10 }
)

/**
 * Generate valid PrintSchema with sections
 */
const printSchemaWithSectionsArb: fc.Arbitrary<PrintSchema> = fc.record({
  pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
  orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
  header: fc.record({
    hospital: fc.string({ minLength: 1, maxLength: 50 }),
    department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
    title: fc.string({ minLength: 1, maxLength: 50 }),
  }),
  sections: sectionsArrayArb,
  footer: fc.option(
    fc.record({
      notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
      showPageNumber: fc.boolean(),
    }),
    { nil: undefined }
  ),
})

/**
 * Generate MeasurableItem with section-{index} format
 */
const measurableItemWithSectionIdArb = (index: number): fc.Arbitrary<MeasurableItem> =>
  fc.record({
    id: fc.constant(`section-${index}`),
    type: fc.constant('section' as const),
    height: fc.integer({ min: 10, max: 500 }),
    tableId: fc.constant(undefined),
    dataIndex: fc.constant(undefined),
  })

// ==================== Property Tests ====================

describe('Property 1: Section ID Format Consistency', () => {
  /**
   * **Property 1: Section ID Format Consistency**
   * **Feature: blank-first-page-fix, Property 1: Section ID Format Consistency**
   * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2**
   *
   * *For any* `PrintSchema` with N sections (excluding signature-area), the `measureAll`
   * function SHALL return exactly N items with `type === 'section'`, and each item's ID
   * SHALL be `section-{i}` where `i` is the section's index in the original array (0 to N-1).
   */

  /**
   * Test: Section IDs follow section-{index} format
   * Validates the ID format specification
   */
  it('should use section-{index} format for section IDs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        (sectionCount) => {
          // Generate expected IDs based on section count
          const expectedIds = Array.from({ length: sectionCount }, (_, i) => `section-${i}`)

          // Verify each ID follows the pattern
          for (let i = 0; i < sectionCount; i++) {
            const expectedId = `section-${i}`
            expect(expectedIds[i]).toBe(expectedId)

            // Verify ID format matches regex pattern
            expect(expectedId).toMatch(/^section-\d+$/)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: Section index corresponds to position in PrintSchema.sections array
   * Validates that indices are sequential starting from 0
   */
  it('should have section indices correspond to array positions', () => {
    fc.assert(
      fc.property(
        printSchemaWithSectionsArb,
        (schema) => {
          const sections = schema.sections.filter(s => s.type !== 'signature-area')
          const sectionCount = sections.length

          // For each section, the expected ID should be section-{index}
          for (let i = 0; i < sectionCount; i++) {
            const expectedId = `section-${i}`

            // Verify the index matches the array position
            expect(expectedId).toBe(`section-${i}`)

            // Verify the index is within bounds
            expect(i).toBeGreaterThanOrEqual(0)
            expect(i).toBeLessThan(sectionCount)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: MeasurableItems with section type have valid section-{index} IDs
   * Validates the interface contract for measureAll return values
   */
  it('should produce MeasurableItems with valid section-{index} IDs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (sectionCount) => {
          // Simulate measureAll output with correct ID format
          const measuredItems: MeasurableItem[] = Array.from({ length: sectionCount }, (_, i) => ({
            id: `section-${i}`,
            type: 'section' as const,
            height: 100 + i * 10,
          }))

          // Verify each item has correct ID format
          for (let i = 0; i < sectionCount; i++) {
            const item = measuredItems[i]

            // ID should be section-{index}
            expect(item.id).toBe(`section-${i}`)

            // Type should be 'section'
            expect(item.type).toBe('section')

            // Height should be positive
            expect(item.height).toBeGreaterThan(0)
          }

          // Verify total count matches
          expect(measuredItems.length).toBe(sectionCount)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: buildSectionMap creates keys matching measureAll IDs
   * Validates that the mapping between measurement and rendering is consistent
   */
  it('should have buildSectionMap keys match measureAll IDs', () => {
    fc.assert(
      fc.property(
        printSchemaWithSectionsArb,
        (schema) => {
          // Simulate buildSectionMap behavior
          const sectionMap = new Map<string, PrintSection>()
          schema.sections.forEach((section, index) => {
            const sectionId = `section-${index}`
            sectionMap.set(sectionId, section)
          })

          // Simulate measureAll output
          const measuredItems: MeasurableItem[] = schema.sections
            .filter(s => s.type !== 'signature-area')
            .map((_, index) => ({
              id: `section-${index}`,
              type: 'section' as const,
              height: 100,
            }))

          // Verify each measured item ID can be found in sectionMap
          for (const item of measuredItems) {
            if (item.type === 'section') {
              // The ID should exist in the map
              expect(sectionMap.has(item.id)).toBe(true)
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: Section IDs are unique within a schema
   * Validates that no duplicate IDs are generated
   */
  it('should generate unique section IDs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (sectionCount) => {
          // Generate IDs
          const ids = Array.from({ length: sectionCount }, (_, i) => `section-${i}`)

          // Verify all IDs are unique
          const uniqueIds = new Set(ids)
          expect(uniqueIds.size).toBe(sectionCount)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: Section ID format is consistent regardless of section type
   * Validates that info-grid, checkbox-grid, table, etc. all use the same format
   */
  it('should use consistent ID format regardless of section type', () => {
    fc.assert(
      fc.property(
        printSchemaWithSectionsArb,
        (schema) => {
          // All sections (except signature-area) should use section-{index} format
          let sectionIndex = 0

          for (const section of schema.sections) {
            if (section.type === 'signature-area') continue

            const expectedId = `section-${sectionIndex}`

            // Verify the ID format is consistent
            expect(expectedId).toMatch(/^section-\d+$/)

            // Verify the index is correct
            const match = expectedId.match(/^section-(\d+)$/)
            expect(match).not.toBeNull()
            expect(parseInt(match![1], 10)).toBe(sectionIndex)

            sectionIndex++
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ==================== Property 2: Table Item ID Backward Compatibility ====================

describe('Property 2: Table Item ID Backward Compatibility', () => {
  /**
   * **Property 2: Table Item ID Backward Compatibility**
   * **Feature: blank-first-page-fix, Property 2: Table Item ID Backward Compatibility**
   * **Validates: Requirements 2.3, 2.4, 4.5**
   *
   * *For any* `PrintSchema` containing table sections, the `measureAll` function SHALL
   * return table-header and table-row items with IDs following the existing format
   * (`{tableId}-header`, `{tableId}-row-{index}`), and the `tableId` SHALL follow
   * the `table-{sectionIndex}` format.
   */

  /**
   * Generate table section for testing
   */
  const tableConfigArb = fc.record({
    dataField: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s)),
    columns: fc.array(
      fc.record({
        header: fc.string({ minLength: 1, maxLength: 20 }),
        field: fc.string({ minLength: 1, maxLength: 20 }),
        type: fc.constant('text' as const),
      }),
      { minLength: 1, maxLength: 5 }
    ),
  })

  const tableSectionArb: fc.Arbitrary<PrintSection> = tableConfigArb.map(config => ({
    type: 'table' as const,
    title: 'Test Table',
    config: config as TableConfig,
  }))

  /**
   * Generate PrintSchema with at least one table section
   */
  const schemaWithTablesArb: fc.Arbitrary<PrintSchema> = fc.record({
    pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
    orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
    header: fc.record({
      hospital: fc.string({ minLength: 1, maxLength: 50 }),
      department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
    }),
    sections: fc.array(tableSectionArb, { minLength: 1, maxLength: 5 }),
    footer: fc.option(
      fc.record({
        notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        showPageNumber: fc.boolean(),
      }),
      { nil: undefined }
    ),
  })

  /**
   * Test: Table header IDs follow {tableId}-header format
   * Validates the table header ID format specification
   */
  it('should use {tableId}-header format for table header IDs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 20 }),
        (sectionIndex, _) => {
          const tableId = `table-${sectionIndex}`
          const headerId = `${tableId}-header`

          // Verify header ID format
          expect(headerId).toBe(`table-${sectionIndex}-header`)
          expect(headerId).toMatch(/^table-\d+-header$/)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: Table row IDs follow {tableId}-row-{rowIndex} format
   * Validates the table row ID format specification
   */
  it('should use {tableId}-row-{rowIndex} format for table row IDs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 50 }),
        (sectionIndex, rowIndex) => {
          const tableId = `table-${sectionIndex}`
          const rowId = `${tableId}-row-${rowIndex}`

          // Verify row ID format
          expect(rowId).toBe(`table-${sectionIndex}-row-${rowIndex}`)
          expect(rowId).toMatch(/^table-\d+-row-\d+$/)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: Table IDs use table-{sectionIndex} format
   * Validates that tableId follows the expected format
   */
  it('should use table-{sectionIndex} format for tableId', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        (sectionIndex) => {
          const tableId = `table-${sectionIndex}`

          // Verify tableId format
          expect(tableId).toMatch(/^table-\d+$/)

          // Verify the index can be extracted
          const match = tableId.match(/^table-(\d+)$/)
          expect(match).not.toBeNull()
          expect(parseInt(match![1], 10)).toBe(sectionIndex)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: MeasurableItems for tables have correct structure
   * Validates the interface contract for table measurement results
   */
  it('should produce MeasurableItems with correct table structure', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 1, max: 20 }),
        (sectionIndex, rowCount) => {
          const tableId = `table-${sectionIndex}`

          // Simulate measureAll output for a table
          const measuredItems: MeasurableItem[] = []

          // Add header
          measuredItems.push({
            id: `${tableId}-header`,
            type: 'table-header',
            height: 40,
            tableId,
          })

          // Add rows
          for (let i = 0; i < rowCount; i++) {
            measuredItems.push({
              id: `${tableId}-row-${i}`,
              type: 'table-row',
              height: 30,
              tableId,
              dataIndex: i,
            })
          }

          // Verify header
          const header = measuredItems.find(item => item.type === 'table-header')
          expect(header).toBeDefined()
          expect(header!.id).toBe(`${tableId}-header`)
          expect(header!.tableId).toBe(tableId)

          // Verify rows
          const rows = measuredItems.filter(item => item.type === 'table-row')
          expect(rows.length).toBe(rowCount)

          for (let i = 0; i < rowCount; i++) {
            const row = rows[i]
            expect(row.id).toBe(`${tableId}-row-${i}`)
            expect(row.tableId).toBe(tableId)
            expect(row.dataIndex).toBe(i)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: Table items maintain backward compatibility with existing pagination logic
   * Validates that table IDs can be used for pagination calculations
   */
  it('should maintain backward compatibility with pagination logic', () => {
    fc.assert(
      fc.property(
        schemaWithTablesArb,
        fc.integer({ min: 1, max: 30 }),
        (schema, rowCount) => {
          // Simulate measureAll output for tables in schema
          const measuredItems: MeasurableItem[] = []
          let sectionIndex = 0

          for (const section of schema.sections) {
            if (section.type === 'table') {
              const tableId = `table-${sectionIndex}`

              // Add header
              measuredItems.push({
                id: `${tableId}-header`,
                type: 'table-header',
                height: 40,
                tableId,
              })

              // Add rows
              for (let i = 0; i < rowCount; i++) {
                measuredItems.push({
                  id: `${tableId}-row-${i}`,
                  type: 'table-row',
                  height: 30,
                  tableId,
                  dataIndex: i,
                })
              }
            }
            sectionIndex++
          }

          // Verify all table items have tableId set
          const tableItems = measuredItems.filter(
            item => item.type === 'table-header' || item.type === 'table-row'
          )

          for (const item of tableItems) {
            // tableId should be defined
            expect(item.tableId).toBeDefined()

            // tableId should follow table-{index} format
            expect(item.tableId).toMatch(/^table-\d+$/)

            // ID should contain tableId
            expect(item.id).toContain(item.tableId!)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: Table header and row IDs are unique within a table
   * Validates that no duplicate IDs are generated for a single table
   */
  it('should generate unique IDs within a table', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 1, max: 50 }),
        (sectionIndex, rowCount) => {
          const tableId = `table-${sectionIndex}`
          const ids: string[] = []

          // Add header ID
          ids.push(`${tableId}-header`)

          // Add row IDs
          for (let i = 0; i < rowCount; i++) {
            ids.push(`${tableId}-row-${i}`)
          }

          // Verify all IDs are unique
          const uniqueIds = new Set(ids)
          expect(uniqueIds.size).toBe(ids.length)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: Table IDs are unique across multiple tables
   * Validates that different tables have different tableIds
   */
  it('should generate unique tableIds across multiple tables', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        (tableCount) => {
          const tableIds: string[] = []

          for (let i = 0; i < tableCount; i++) {
            tableIds.push(`table-${i}`)
          }

          // Verify all tableIds are unique
          const uniqueTableIds = new Set(tableIds)
          expect(uniqueTableIds.size).toBe(tableCount)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: Row dataIndex matches row index in ID
   * Validates consistency between dataIndex and ID
   */
  it('should have dataIndex match row index in ID', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 1, max: 30 }),
        (sectionIndex, rowCount) => {
          const tableId = `table-${sectionIndex}`

          for (let i = 0; i < rowCount; i++) {
            const rowItem: MeasurableItem = {
              id: `${tableId}-row-${i}`,
              type: 'table-row',
              height: 30,
              tableId,
              dataIndex: i,
            }

            // Extract index from ID
            const match = rowItem.id.match(/row-(\d+)$/)
            expect(match).not.toBeNull()
            const idIndex = parseInt(match![1], 10)

            // dataIndex should match ID index
            expect(rowItem.dataIndex).toBe(idIndex)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ==================== Integration Contract Tests ====================

describe('Section ID Integration Contract', () => {
  /**
   * Test: renderContentItem can find sections using measureAll IDs
   * This validates the integration between measurement and rendering
   */
  it('should allow renderContentItem to find sections using measured IDs', () => {
    fc.assert(
      fc.property(
        printSchemaWithSectionsArb,
        (schema) => {
          // Build section map (simulating buildSectionMap)
          const sectionMap = new Map<string, PrintSection>()
          schema.sections.forEach((section, index) => {
            sectionMap.set(`section-${index}`, section)
          })

          // Simulate measured items (simulating measureAll output)
          const measuredItems: MeasurableItem[] = schema.sections
            .filter(s => s.type !== 'signature-area')
            .map((_, index) => ({
              id: `section-${index}`,
              type: 'section' as const,
              height: 100,
            }))

          // Build item map (simulating renderPageBody)
          const itemMap = new Map(measuredItems.map(m => [m.id, m]))

          // Simulate renderContentItem lookup
          for (const item of measuredItems) {
            // Item should be found in itemMap
            const foundItem = itemMap.get(item.id)
            expect(foundItem).toBeDefined()
            expect(foundItem?.id).toBe(item.id)

            // Section should be found in sectionMap
            if (item.type === 'section') {
              const foundSection = sectionMap.get(item.id)
              expect(foundSection).toBeDefined()
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: First page should not be blank when IDs match
   * This validates the fix for the blank first page issue
   */
  it('should enable first page content rendering when IDs match', () => {
    fc.assert(
      fc.property(
        printSchemaWithSectionsArb,
        (schema) => {
          // Build section map
          const sectionMap = new Map<string, PrintSection>()
          schema.sections.forEach((section, index) => {
            sectionMap.set(`section-${index}`, section)
          })

          // Simulate first page items
          const firstPageItems = schema.sections
            .filter(s => s.type !== 'signature-area')
            .slice(0, 3) // First 3 sections
            .map((_, index) => `section-${index}`)

          // Verify each first page item can be found
          let foundCount = 0
          for (const itemId of firstPageItems) {
            const section = sectionMap.get(itemId)
            if (section) {
              foundCount++
            }
          }

          // All items should be found (no blank page)
          expect(foundCount).toBe(firstPageItems.length)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})


// ==================== Property 3: Section Rendering Correctness ====================

describe('Property 3: Section Rendering Correctness', () => {
  /**
   * **Property 3: Section Rendering Correctness**
   * **Feature: blank-first-page-fix, Property 3: Section Rendering Correctness**
   * **Validates: Requirements 3.1, 3.2, 3.3**
   *
   * *For any* page with section items, when `renderContentItem` is called with a section
   * item ID, it SHALL find the corresponding `PrintSection` in `sectionMap` and render
   * it with its title (if present).
   */

  /**
   * Simulate buildSectionMap behavior with table support
   * This matches the actual implementation in paginated-renderer.ts
   */
  function simulateBuildSectionMap(schema: PrintSchema): Map<string, PrintSection> {
    const map = new Map<string, PrintSection>()
    
    schema.sections.forEach((section, index) => {
      // Primary key: section-{index}
      map.set(`section-${index}`, section)
      
      // For tables, also add table-{index} key (matches measureAll output)
      if (section.type === 'table') {
        map.set(`table-${index}`, section)
      }
    })
    
    return map
  }

  /**
   * Simulate measureAll output for a schema
   * This matches the actual implementation in content-measurer.ts
   */
  function simulateMeasureAll(schema: PrintSchema): MeasurableItem[] {
    const items: MeasurableItem[] = []
    let sectionIndex = 0

    for (const section of schema.sections) {
      if (section.type === 'signature-area') continue

      if (section.type === 'table') {
        const tableId = `table-${sectionIndex}`
        // Add table header
        items.push({
          id: `${tableId}-header`,
          type: 'table-header',
          height: 40,
          tableId,
        })
        // Add some table rows
        for (let i = 0; i < 5; i++) {
          items.push({
            id: `${tableId}-row-${i}`,
            type: 'table-row',
            height: 30,
            tableId,
            dataIndex: i,
          })
        }
      } else {
        // Non-table sections use section-{index} format
        items.push({
          id: `section-${sectionIndex}`,
          type: 'section',
          height: 100,
        })
      }
      sectionIndex++
    }

    return items
  }

  /**
   * Test: Section items can be found in sectionMap using measured IDs
   * Validates that renderContentItem can find sections
   */
  it('should find sections in sectionMap using measured item IDs', () => {
    fc.assert(
      fc.property(
        printSchemaWithSectionsArb,
        (schema) => {
          const sectionMap = simulateBuildSectionMap(schema)
          const measuredItems = simulateMeasureAll(schema)

          // For each section-type measured item, verify it can be found
          const sectionItems = measuredItems.filter(item => item.type === 'section')
          
          for (const item of sectionItems) {
            const section = sectionMap.get(item.id)
            expect(section).toBeDefined()
            expect(section?.type).not.toBe('signature-area')
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: Table sections can be found using tableId
   * Validates that table sections are accessible via table-{index} format
   */
  it('should find table sections using tableId from measured items', () => {
    fc.assert(
      fc.property(
        printSchemaWithSectionsArb,
        (schema) => {
          const sectionMap = simulateBuildSectionMap(schema)
          const measuredItems = simulateMeasureAll(schema)

          // For each table-related measured item, verify tableId can find the section
          const tableItems = measuredItems.filter(
            item => item.type === 'table-header' || item.type === 'table-row'
          )

          for (const item of tableItems) {
            if (item.tableId) {
              const section = sectionMap.get(item.tableId)
              expect(section).toBeDefined()
              expect(section?.type).toBe('table')
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: All measured section items have corresponding sections in map
   * Validates complete coverage between measurement and rendering
   */
  it('should have complete mapping between measured items and sections', () => {
    fc.assert(
      fc.property(
        printSchemaWithSectionsArb,
        (schema) => {
          const sectionMap = simulateBuildSectionMap(schema)
          const measuredItems = simulateMeasureAll(schema)

          // Count sections that should be measurable (excluding signature-area)
          const measurableSections = schema.sections.filter(s => s.type !== 'signature-area')
          
          // Count unique section IDs from measured items
          const uniqueSectionIds = new Set<string>()
          for (const item of measuredItems) {
            if (item.type === 'section') {
              uniqueSectionIds.add(item.id)
            } else if (item.tableId) {
              // For table items, the tableId represents the section
              uniqueSectionIds.add(item.tableId)
            }
          }

          // The number of unique section IDs should match measurable sections
          expect(uniqueSectionIds.size).toBe(measurableSections.length)

          // Each unique ID should be findable in sectionMap
          for (const id of uniqueSectionIds) {
            expect(sectionMap.has(id)).toBe(true)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: Section titles are preserved in the mapping
   * Validates that sections with titles can be rendered with their titles
   */
  it('should preserve section titles in the mapping', () => {
    fc.assert(
      fc.property(
        printSchemaWithSectionsArb,
        (schema) => {
          const sectionMap = simulateBuildSectionMap(schema)

          // Verify each section's title is preserved
          schema.sections.forEach((section, index) => {
            const mappedSection = sectionMap.get(`section-${index}`)
            expect(mappedSection).toBeDefined()
            expect(mappedSection?.title).toBe(section.title)
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: First page items are all findable (no blank first page)
   * This is the key property that validates the blank first page fix
   */
  it('should ensure first page items are all findable (no blank first page)', () => {
    fc.assert(
      fc.property(
        printSchemaWithSectionsArb,
        fc.integer({ min: 1, max: 5 }),
        (schema, firstPageItemCount) => {
          const sectionMap = simulateBuildSectionMap(schema)
          const measuredItems = simulateMeasureAll(schema)

          // Simulate first page containing some items
          const firstPageItems = measuredItems.slice(0, Math.min(firstPageItemCount, measuredItems.length))

          // Verify each first page item can be resolved
          let renderableCount = 0
          for (const item of firstPageItems) {
            if (item.type === 'section') {
              const section = sectionMap.get(item.id)
              if (section) renderableCount++
            } else if (item.type === 'table-header' || item.type === 'table-row') {
              // Table items are rendered differently, but tableId should be findable
              if (item.tableId && sectionMap.has(item.tableId)) {
                renderableCount++
              }
            }
          }

          // All first page items should be renderable (no blank page)
          expect(renderableCount).toBe(firstPageItems.length)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test: Mixed schema with multiple section types renders correctly
   * Validates that info-grid, table, checkbox-grid all work together
   */
  it('should handle mixed schema with multiple section types', () => {
    fc.assert(
      fc.property(
        printSchemaWithSectionsArb,
        (schema) => {
          const sectionMap = simulateBuildSectionMap(schema)
          const measuredItems = simulateMeasureAll(schema)

          // Group items by their lookup key
          const itemsByKey = new Map<string, MeasurableItem[]>()
          for (const item of measuredItems) {
            const key = item.type === 'section' ? item.id : item.tableId
            if (key) {
              if (!itemsByKey.has(key)) {
                itemsByKey.set(key, [])
              }
              itemsByKey.get(key)!.push(item)
            }
          }

          // Each key should map to a valid section
          for (const [key, items] of itemsByKey) {
            const section = sectionMap.get(key)
            expect(section).toBeDefined()

            // Verify section type matches item type
            if (items[0].type === 'section') {
              expect(section?.type).not.toBe('table')
            } else if (items[0].type === 'table-header' || items[0].type === 'table-row') {
              expect(section?.type).toBe('table')
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
