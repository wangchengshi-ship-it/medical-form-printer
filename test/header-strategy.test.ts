/**
 * @fileoverview Property-Based Tests for Table Header Strategy
 * @module test/header-strategy
 *
 * @description
 * Property-based tests for the table header rendering strategies.
 * Uses fast-check to verify correctness properties across many inputs.
 *
 * **Feature: table-header-merge**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  SimpleHeaderStrategy,
  MultiRowHeaderStrategy,
  calculateCellMatrix,
  getHeaderStrategy,
  type CellPosition,
} from '../src/renderer/section-renderers/table/header-strategy'
import type { TableConfig, HeaderRow, HeaderCell, TableColumn } from '../src/types/print-schema'

// ============================================
// Generators
// ============================================

/**
 * Generate a valid header cell
 */
const headerCellArb = (maxColspan: number = 3, maxRowspan: number = 3): fc.Arbitrary<HeaderCell> =>
  fc.record({
    text: fc.string({ minLength: 1, maxLength: 20 }),
    colspan: fc.option(fc.integer({ min: 1, max: maxColspan }), { nil: undefined }),
    rowspan: fc.option(fc.integer({ min: 1, max: maxRowspan }), { nil: undefined }),
    width: fc.option(fc.constantFrom('100px', '20%', '50px'), { nil: undefined }),
    field: fc.option(fc.string({ minLength: 1, maxLength: 10 }), { nil: undefined }),
  })

/**
 * Generate a valid header row
 */
const headerRowArb = (cellCount: number = 3): fc.Arbitrary<HeaderRow> =>
  fc.record({
    cells: fc.array(headerCellArb(), { minLength: 1, maxLength: cellCount }),
  })

/**
 * Generate a valid table column
 */
const tableColumnArb: fc.Arbitrary<TableColumn> = fc.record({
  header: fc.string({ minLength: 1, maxLength: 20 }),
  field: fc.string({ minLength: 1, maxLength: 20 }),
  width: fc.option(fc.constantFrom('100px', '20%', '50px'), { nil: undefined }),
  type: fc.option(fc.constantFrom('text', 'number', 'date'), { nil: undefined }),
})

/**
 * Generate a simple table config (no headerRows)
 */
const simpleTableConfigArb: fc.Arbitrary<TableConfig> = fc.record({
  columns: fc.array(tableColumnArb, { minLength: 1, maxLength: 5 }),
  dataField: fc.string({ minLength: 1, maxLength: 20 }),
  showRowNumber: fc.option(fc.boolean(), { nil: undefined }),
})

/**
 * Generate a multi-row header table config
 */
const multiRowTableConfigArb: fc.Arbitrary<TableConfig> = fc
  .integer({ min: 2, max: 5 })
  .chain((columnCount) =>
    fc.record({
      columns: fc.array(tableColumnArb, { minLength: columnCount, maxLength: columnCount }),
      dataField: fc.string({ minLength: 1, maxLength: 20 }),
      showRowNumber: fc.option(fc.boolean(), { nil: undefined }),
      headerRows: fc.array(headerRowArb(columnCount), { minLength: 1, maxLength: 3 }),
    })
  )

// ============================================
// Property 1: Colspan/Rowspan 属性正确渲染
// ============================================

describe('Property 1: Colspan/Rowspan 属性正确渲染', () => {
  /**
   * **Feature: table-header-merge, Property 1: Colspan/Rowspan attributes render correctly**
   * **Validates: Requirements 1.1, 1.2, 2.1, 2.2**
   *
   * *For any* header cell configuration with colspan or rowspan values,
   * the rendered HTML `<th>` element SHALL contain the correct `colspan`
   * and `rowspan` attributes matching the configuration.
   */
  it('should render colspan attribute when colspan > 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (colspan, text) => {
          const config: TableConfig = {
            columns: Array.from({ length: colspan + 2 }, (_, i) => ({
              header: `Col ${i}`,
              field: `field${i}`,
            })),
            dataField: 'data',
            headerRows: [
              {
                cells: [{ text, colspan }],
              },
            ],
          }

          const strategy = new MultiRowHeaderStrategy()
          const html = strategy.render(config)

          // Should contain colspan attribute
          expect(html).toContain(`colspan="${colspan}"`)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 1: Colspan/Rowspan attributes render correctly**
   * **Validates: Requirements 1.1, 1.2, 2.1, 2.2**
   */
  it('should render rowspan attribute when rowspan > 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 4 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (rowspan, text) => {
          const headerRows: HeaderRow[] = [{ cells: [{ text, rowspan }] }]
          // Add empty rows for rowspan to span into
          for (let i = 1; i < rowspan; i++) {
            headerRows.push({ cells: [] })
          }

          const config: TableConfig = {
            columns: [{ header: 'Col', field: 'field' }],
            dataField: 'data',
            headerRows,
          }

          const strategy = new MultiRowHeaderStrategy()
          const html = strategy.render(config)

          // Should contain rowspan attribute
          expect(html).toContain(`rowspan="${rowspan}"`)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 1: Colspan/Rowspan attributes render correctly**
   * **Validates: Requirements 1.2, 2.2**
   *
   * When colspan/rowspan is not specified or is 1, no attribute should be rendered.
   */
  it('should not render colspan/rowspan attributes when value is 1 or undefined', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 10 }), (text) => {
        const config: TableConfig = {
          columns: [
            { header: 'Col1', field: 'field1' },
            { header: 'Col2', field: 'field2' },
          ],
          dataField: 'data',
          headerRows: [
            {
              cells: [
                { text, colspan: 1, rowspan: 1 },
                { text: 'Other' },
              ],
            },
          ],
        }

        const strategy = new MultiRowHeaderStrategy()
        const html = strategy.render(config)

        // Should NOT contain colspan="1" or rowspan="1"
        expect(html).not.toContain('colspan="1"')
        expect(html).not.toContain('rowspan="1"')
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 1: Colspan/Rowspan attributes render correctly**
   * **Validates: Requirements 1.3**
   *
   * Colspan should be clamped to available columns.
   */
  it('should clamp colspan to available columns', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        fc.integer({ min: 5, max: 10 }),
        (columnCount, requestedColspan) => {
          const config: TableConfig = {
            columns: Array.from({ length: columnCount }, (_, i) => ({
              header: `Col ${i}`,
              field: `field${i}`,
            })),
            dataField: 'data',
            headerRows: [
              {
                cells: [{ text: 'Wide', colspan: requestedColspan }],
              },
            ],
          }

          const strategy = new MultiRowHeaderStrategy()
          const html = strategy.render(config)

          // The actual colspan should be clamped to columnCount
          const expectedColspan = Math.min(requestedColspan, columnCount)
          if (expectedColspan > 1) {
            expect(html).toContain(`colspan="${expectedColspan}"`)
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Property 3: 多行表头渲染
// ============================================

describe('Property 3: 多行表头渲染', () => {
  /**
   * **Feature: table-header-merge, Property 3: Multi-row header rendering**
   * **Validates: Requirements 3.1, 3.2**
   *
   * *For any* table configuration, if `headerRows` is provided,
   * the renderer SHALL produce exactly that many `<tr>` elements.
   */
  it('should render correct number of tr elements for headerRows', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }),
        fc.integer({ min: 1, max: 5 }),
        (rowCount, columnCount) => {
          const headerRows: HeaderRow[] = Array.from({ length: rowCount }, () => ({
            cells: [{ text: 'Cell' }],
          }))

          const config: TableConfig = {
            columns: Array.from({ length: columnCount }, (_, i) => ({
              header: `Col ${i}`,
              field: `field${i}`,
            })),
            dataField: 'data',
            headerRows,
          }

          const strategy = new MultiRowHeaderStrategy()
          const html = strategy.render(config)

          // Count <tr> elements
          const trCount = (html.match(/<tr>/g) || []).length
          expect(trCount).toBe(rowCount)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 3: Multi-row header rendering**
   * **Validates: Requirements 3.2**
   *
   * When headerRows is not provided, SimpleHeaderStrategy should produce
   * a single-row header from columns.
   */
  it('should render single tr for simple header (no headerRows)', () => {
    fc.assert(
      fc.property(simpleTableConfigArb, (config) => {
        const strategy = new SimpleHeaderStrategy()
        const html = strategy.render(config)

        // Should have exactly one <tr>
        const trCount = (html.match(/<tr>/g) || []).length
        expect(trCount).toBe(1)

        // Should contain all column headers (HTML escaped)
        for (const col of config.columns) {
          const escaped = col.header
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
          expect(html).toContain(escaped)
        }
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 3: Multi-row header rendering**
   * **Validates: Requirements 3.1, 3.2**
   *
   * Strategy selection should be correct based on configuration.
   */
  it('should select correct strategy based on headerRows presence', () => {
    fc.assert(
      fc.property(fc.boolean(), (hasHeaderRows) => {
        const config: TableConfig = {
          columns: [{ header: 'Col', field: 'field' }],
          dataField: 'data',
          headerRows: hasHeaderRows ? [{ cells: [{ text: 'Header' }] }] : undefined,
        }

        const strategy = getHeaderStrategy(config)

        if (hasHeaderRows) {
          expect(strategy).toBeInstanceOf(MultiRowHeaderStrategy)
        } else {
          expect(strategy).toBeInstanceOf(SimpleHeaderStrategy)
        }
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 3: Multi-row header rendering**
   * **Validates: Requirements 3.1**
   *
   * All header cell text should appear in the rendered output.
   */
  it('should include all header cell text in output', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
        (texts) => {
          const config: TableConfig = {
            columns: texts.map((_, i) => ({ header: `Col ${i}`, field: `field${i}` })),
            dataField: 'data',
            headerRows: [
              {
                cells: texts.map((text) => ({ text })),
              },
            ],
          }

          const strategy = new MultiRowHeaderStrategy()
          const html = strategy.render(config)

          // All texts should appear (HTML escaped)
          for (const text of texts) {
            const escaped = text
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;')
            expect(html).toContain(escaped)
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Cell Matrix Calculation Tests
// ============================================

describe('calculateCellMatrix', () => {
  /**
   * Matrix should have correct dimensions
   */
  it('should create matrix with correct dimensions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }),
        fc.integer({ min: 1, max: 5 }),
        (rowCount, columnCount) => {
          const headerRows: HeaderRow[] = Array.from({ length: rowCount }, () => ({
            cells: [{ text: 'Cell' }],
          }))

          const matrix = calculateCellMatrix(headerRows, columnCount)

          expect(matrix.length).toBe(rowCount)
          for (const row of matrix) {
            expect(row.length).toBe(columnCount)
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Rowspan should mark subsequent rows as occupied
   */
  it('should mark positions as occupied for rowspan', () => {
    const headerRows: HeaderRow[] = [
      { cells: [{ text: 'A', rowspan: 2 }, { text: 'B' }] },
      { cells: [{ text: 'C' }] },
    ]

    const matrix = calculateCellMatrix(headerRows, 2)

    // Position [0][0] should have cell A, not occupied
    expect(matrix[0][0].cell?.text).toBe('A')
    expect(matrix[0][0].isOccupied).toBe(false)

    // Position [1][0] should be occupied by rowspan
    expect(matrix[1][0].isOccupied).toBe(true)
  })
})
