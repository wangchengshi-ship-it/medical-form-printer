/**
 * @fileoverview Integration Property-Based Tests for Table Header Merge
 * @module test/table-integration
 *
 * @description
 * Integration property-based tests for the complete table header rendering system.
 * Tests the integration of Strategy, Builder, and Decorator patterns.
 *
 * **Feature: table-header-merge**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { renderTable } from '../src/renderer/section-renderers/table'
import {
  calculateCellMatrix,
  TableHeaderBuilder,
  createHeaderRenderer,
} from '../src/renderer/section-renderers/table/index'
import type { TableConfig, HeaderRow, HeaderCell, TableColumn, FormData } from '../src/types/print-schema'

// ============================================
// Generators
// ============================================

/**
 * Generate a valid header cell with controlled colspan/rowspan
 */
const headerCellArb = (maxColspan: number = 2, maxRowspan: number = 2): fc.Arbitrary<HeaderCell> =>
  fc.record({
    text: fc.string({ minLength: 1, maxLength: 15 }),
    colspan: fc.option(fc.integer({ min: 1, max: maxColspan }), { nil: undefined }),
    rowspan: fc.option(fc.integer({ min: 1, max: maxRowspan }), { nil: undefined }),
    width: fc.option(fc.constantFrom('100px', '20%', '50px'), { nil: undefined }),
    field: fc.option(fc.string({ minLength: 1, maxLength: 10 }), { nil: undefined }),
  })

/**
 * Generate a valid table column
 */
const tableColumnArb: fc.Arbitrary<TableColumn> = fc.record({
  header: fc.string({ minLength: 1, maxLength: 15 }),
  field: fc.string({ minLength: 1, maxLength: 15 }),
  width: fc.option(fc.constantFrom('100px', '20%', '50px'), { nil: undefined }),
  type: fc.option(fc.constantFrom('text', 'number', 'date'), { nil: undefined }),
})

/**
 * Generate well-formed header rows that don't have overlapping cells
 */
function generateWellFormedHeaderRows(columnCount: number, rowCount: number): HeaderRow[] {
  const rows: HeaderRow[] = []
  const occupied: boolean[][] = Array.from({ length: rowCount }, () =>
    Array.from({ length: columnCount }, () => false)
  )

  for (let r = 0; r < rowCount; r++) {
    const cells: HeaderCell[] = []
    let col = 0

    while (col < columnCount) {
      // Skip occupied positions
      while (col < columnCount && occupied[r][col]) {
        col++
      }
      if (col >= columnCount) break

      // Calculate max possible colspan and rowspan
      let maxColspan = 1
      while (col + maxColspan < columnCount && !occupied[r][col + maxColspan]) {
        maxColspan++
      }
      maxColspan = Math.min(maxColspan, 3) // Limit for test simplicity

      let maxRowspan = 1
      while (r + maxRowspan < rowCount) {
        let canExtend = true
        for (let c = col; c < col + 1; c++) {
          if (occupied[r + maxRowspan][c]) {
            canExtend = false
            break
          }
        }
        if (!canExtend) break
        maxRowspan++
      }
      maxRowspan = Math.min(maxRowspan, 3) // Limit for test simplicity

      // Randomly choose colspan and rowspan
      const colspan = Math.floor(Math.random() * maxColspan) + 1
      const rowspan = Math.floor(Math.random() * maxRowspan) + 1

      // Mark positions as occupied
      for (let dr = 0; dr < rowspan; dr++) {
        for (let dc = 0; dc < colspan; dc++) {
          if (r + dr < rowCount && col + dc < columnCount) {
            occupied[r + dr][col + dc] = true
          }
        }
      }

      const cell: HeaderCell = { text: `Cell_${r}_${col}` }
      if (colspan > 1) cell.colspan = colspan
      if (rowspan > 1) cell.rowspan = rowspan

      cells.push(cell)
      col += colspan
    }

    rows.push({ cells })
  }

  return rows
}

// ============================================
// Property 2: 单元格位置正确性
// ============================================

describe('Property 2: 单元格位置正确性', () => {
  /**
   * **Feature: table-header-merge, Property 2: Cell position correctness**
   * **Validates: Requirements 2.3, 3.3, 5.2**
   *
   * *For any* multi-row header configuration, the total effective column count
   * (accounting for colspan) in each row SHALL equal the total number of data columns.
   */
  it('should have consistent column count across all header rows', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }),
        fc.integer({ min: 1, max: 3 }),
        (columnCount, rowCount) => {
          // Generate well-formed header rows inline
          const headerRows = generateWellFormedHeaderRows(columnCount, rowCount)

          const matrix = calculateCellMatrix(headerRows, columnCount)

          // Matrix should have correct dimensions
          expect(matrix.length).toBe(rowCount)
          for (const row of matrix) {
            expect(row.length).toBe(columnCount)
          }

          // Verify that the total effective column count in each row equals columnCount
          // by checking that all cells' colspans sum up correctly
          for (let r = 0; r < rowCount; r++) {
            let effectiveColumns = 0
            for (const cell of headerRows[r].cells) {
              effectiveColumns += cell.colspan || 1
            }
            // Add columns occupied by rowspan from above
            for (let c = 0; c < columnCount; c++) {
              if (matrix[r][c].isOccupied) {
                effectiveColumns++
              }
            }
            expect(effectiveColumns).toBe(columnCount)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 2: Cell position correctness**
   * **Validates: Requirements 2.3, 5.2**
   *
   * *For any* header configuration with rowspan, cells with rowspan > 1 SHALL
   * cause subsequent rows to have fewer explicit cells, and no cells SHALL overlap.
   */
  it('should correctly mark occupied positions for rowspan', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 4 }),
        fc.integer({ min: 2, max: 3 }),
        (columnCount, rowCount) => {
          // Create a header with a cell that has rowspan
          const headerRows: HeaderRow[] = [
            {
              cells: [
                { text: 'Spanning', rowspan: rowCount },
                ...Array.from({ length: columnCount - 1 }, (_, i) => ({ text: `Col${i}` })),
              ],
            },
          ]

          // Add remaining rows with fewer cells (first column is occupied)
          for (let r = 1; r < rowCount; r++) {
            headerRows.push({
              cells: Array.from({ length: columnCount - 1 }, (_, i) => ({ text: `R${r}C${i}` })),
            })
          }

          const matrix = calculateCellMatrix(headerRows, columnCount)

          // First column should be occupied in all rows after the first
          for (let r = 1; r < rowCount; r++) {
            expect(matrix[r][0].isOccupied).toBe(true)
          }

          // First row, first column should have the cell
          expect(matrix[0][0].cell?.text).toBe('Spanning')
          expect(matrix[0][0].isOccupied).toBe(false)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 2: Cell position correctness**
   * **Validates: Requirements 3.3, 5.2**
   *
   * *For any* header configuration, the rendered HTML should have correct
   * number of th elements accounting for colspan and rowspan.
   */
  it('should render correct number of th elements', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 4 }),
        fc.integer({ min: 1, max: 3 }),
        (columnCount, rowCount) => {
          // Generate well-formed header rows inline
          const headerRows = generateWellFormedHeaderRows(columnCount, rowCount)

          const config: TableConfig = {
            columns: Array.from({ length: columnCount }, (_, i) => ({
              header: `Col${i}`,
              field: `field${i}`,
            })),
            dataField: 'data',
            headerRows,
          }

          const renderer = createHeaderRenderer(config)
          const html = renderer.renderHeader(config)

          // Count th elements (use <th to match opening tags)
          const thCount = (html.match(/<th[\s>]/g) || []).length

          // Count expected cells (cells that are not occupied by rowspan)
          let expectedCells = 0
          for (const row of headerRows) {
            expectedCells += row.cells.length
          }

          expect(thCount).toBe(expectedCells)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Integration Tests
// ============================================

describe('Table Integration Tests', () => {
  /**
   * Test that renderTable works with the new header system
   */
  it('should render complete table with multi-row headers', () => {
    const headerRows = new TableHeaderBuilder()
      .addRow()
      .addCell('Date')
      .rowspan(2)
      .done()
      .addCell('Blood Pressure (mmHg)')
      .colspan(2)
      .done()
      .done()
      .addRow()
      .addCell('Systolic')
      .field('systolic')
      .done()
      .addCell('Diastolic')
      .field('diastolic')
      .done()
      .done()
      .build()

    const config: TableConfig = {
      columns: [
        { header: 'Date', field: 'date' },
        { header: 'Systolic', field: 'systolic' },
        { header: 'Diastolic', field: 'diastolic' },
      ],
      dataField: 'vitalSigns',
      headerRows,
    }

    const data: FormData = {
      vitalSigns: [
        { date: '2024-01-01', systolic: 120, diastolic: 80 },
        { date: '2024-01-02', systolic: 118, diastolic: 78 },
      ],
    }

    const html = renderTable(config, data)

    // Should contain thead with multi-row structure
    expect(html).toContain('<thead>')
    expect(html).toContain('rowspan="2"')
    expect(html).toContain('colspan="2"')
    expect(html).toContain('Blood Pressure (mmHg)')
    expect(html).toContain('Systolic')
    expect(html).toContain('Diastolic')

    // Should contain data rows
    expect(html).toContain('<tbody>')
    expect(html).toContain('2024-01-01')
    expect(html).toContain('120')
    expect(html).toContain('80')
  })

  /**
   * Test backward compatibility with simple columns configuration
   */
  it('should maintain backward compatibility with simple columns', () => {
    const config: TableConfig = {
      columns: [
        { header: 'Name', field: 'name' },
        { header: 'Age', field: 'age' },
      ],
      dataField: 'records',
    }

    const data: FormData = {
      records: [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ],
    }

    const html = renderTable(config, data)

    // Should render simple header
    expect(html).toContain('<thead>')
    expect(html).toContain('Name')
    expect(html).toContain('Age')

    // Should not have colspan/rowspan for simple headers
    expect(html).not.toContain('colspan=')
    expect(html).not.toContain('rowspan=')

    // Should contain data
    expect(html).toContain('Alice')
    expect(html).toContain('30')
  })

  /**
   * Test row number integration with multi-row headers
   */
  it('should correctly add row number column to multi-row headers', () => {
    const config: TableConfig = {
      columns: [
        { header: 'Date', field: 'date' },
        { header: 'Value', field: 'value' },
      ],
      dataField: 'records',
      showRowNumber: true,
      headerRows: [
        { cells: [{ text: 'Date', rowspan: 2 }, { text: 'Values' }] },
        { cells: [{ text: 'Value' }] },
      ],
    }

    const data: FormData = {
      records: [{ date: '2024-01-01', value: 100 }],
    }

    const html = renderTable(config, data)

    // Should have row number header with rowspan
    expect(html).toContain('No.')
    expect(html).toMatch(/<th rowspan="2">No\.<\/th>/)

    // Should have row number in data row
    expect(html).toContain('<td>1</td>')
  })

  /**
   * Test partial rendering (pagination) with new header system
   */
  it('should support partial rendering with multi-row headers', () => {
    const config: TableConfig = {
      columns: [
        { header: 'ID', field: 'id' },
        { header: 'Name', field: 'name' },
      ],
      dataField: 'records',
      headerRows: [{ cells: [{ text: 'ID' }, { text: 'Name' }] }],
    }

    const data: FormData = {
      records: [
        { id: 1, name: 'First' },
        { id: 2, name: 'Second' },
        { id: 3, name: 'Third' },
      ],
    }

    // Render only rows 0 and 2
    const html = renderTable(config, data, undefined, { rowIndices: [0, 2] })

    expect(html).toContain('First')
    expect(html).toContain('Third')
    expect(html).not.toContain('Second')
  })

  /**
   * Test rendering without header (for pagination continuation)
   */
  it('should support rendering without header', () => {
    const config: TableConfig = {
      columns: [{ header: 'Name', field: 'name' }],
      dataField: 'records',
    }

    const data: FormData = {
      records: [{ name: 'Test' }],
    }

    const html = renderTable(config, data, undefined, { includeHeader: false })

    expect(html).not.toContain('<thead>')
    expect(html).toContain('<tbody>')
    expect(html).toContain('Test')
  })
})
