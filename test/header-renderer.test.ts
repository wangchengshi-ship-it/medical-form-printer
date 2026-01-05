/**
 * @fileoverview Property-Based Tests for Table Header Renderer (Decorator Pattern)
 * @module test/header-renderer
 *
 * @description
 * Property-based tests for the table header renderer decorator pattern.
 * Uses fast-check to verify correctness properties across many inputs.
 *
 * **Feature: table-header-merge**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  HeaderRenderer,
  BaseHeaderRenderer,
  RowNumberHeaderDecorator,
  createHeaderRenderer,
} from '../src/renderer/section-renderers/table/header-renderer'
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

/**
 * Generate any valid table config (simple or multi-row)
 */
const anyTableConfigArb: fc.Arbitrary<TableConfig> = fc.oneof(
  simpleTableConfigArb,
  multiRowTableConfigArb
)

// ============================================
// Property 5: 有效 HTML 输出
// ============================================

describe('Property 5: 有效 HTML 输出', () => {
  /**
   * **Feature: table-header-merge, Property 5: Valid HTML output**
   * **Validates: Requirements 5.1, 5.3, 5.4**
   *
   * *For any* header configuration, the rendered output SHALL be valid
   * HTML table structure with thead wrapper.
   */
  it('should produce valid HTML with thead wrapper', () => {
    fc.assert(
      fc.property(anyTableConfigArb, (config) => {
        const renderer = new BaseHeaderRenderer()
        const html = renderer.renderHeader(config)

        // Should have thead wrapper
        expect(html).toMatch(/^<thead>/)
        expect(html).toMatch(/<\/thead>$/)

        // Should have at least one tr
        expect(html).toContain('<tr>')
        expect(html).toContain('</tr>')

        // Should have at least one th
        expect(html).toContain('<th')
        expect(html).toContain('</th>')

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 5: Valid HTML output**
   * **Validates: Requirements 5.1, 5.3**
   *
   * *For any* header configuration, all th elements should be properly closed.
   */
  it('should produce balanced th tags', () => {
    fc.assert(
      fc.property(anyTableConfigArb, (config) => {
        const renderer = new BaseHeaderRenderer()
        const html = renderer.renderHeader(config)

        // Count opening and closing th tags (use <th> or <th  to avoid matching <thead)
        const openingTh = (html.match(/<th[\s>]/g) || []).length
        const closingTh = (html.match(/<\/th>/g) || []).length

        expect(openingTh).toBe(closingTh)
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 5: Valid HTML output**
   * **Validates: Requirements 5.1, 5.3**
   *
   * *For any* header configuration, all tr elements should be properly closed.
   */
  it('should produce balanced tr tags', () => {
    fc.assert(
      fc.property(anyTableConfigArb, (config) => {
        const renderer = new BaseHeaderRenderer()
        const html = renderer.renderHeader(config)

        // Count opening and closing tr tags
        const openingTr = (html.match(/<tr>/g) || []).length
        const closingTr = (html.match(/<\/tr>/g) || []).length

        expect(openingTr).toBe(closingTr)
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 5: Valid HTML output**
   * **Validates: Requirements 5.4**
   *
   * *For any* header configuration with showRowNumber=true, the output
   * SHALL include a row number header cell.
   */
  it('should include row number header when showRowNumber is true', () => {
    fc.assert(
      fc.property(anyTableConfigArb, (baseConfig) => {
        const config = { ...baseConfig, showRowNumber: true }
        const renderer = new RowNumberHeaderDecorator(new BaseHeaderRenderer())
        const html = renderer.renderHeader(config)

        // Should contain "No." text for row number header
        expect(html).toContain('No.')
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 5: Valid HTML output**
   * **Validates: Requirements 5.4**
   *
   * *For any* multi-row header configuration with showRowNumber=true,
   * the row number cell SHALL have correct rowspan.
   */
  it('should add correct rowspan to row number cell for multi-row headers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 4 }),
        fc.integer({ min: 1, max: 3 }),
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
            showRowNumber: true,
          }

          const renderer = new RowNumberHeaderDecorator(new BaseHeaderRenderer())
          const html = renderer.renderHeader(config)

          // Should contain rowspan attribute matching row count
          expect(html).toContain(`rowspan="${rowCount}"`)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 5: Valid HTML output**
   * **Validates: Requirements 5.4**
   *
   * *For any* single-row header with showRowNumber=true,
   * the row number cell SHALL NOT have rowspan attribute.
   */
  it('should not add rowspan to row number cell for single-row headers', () => {
    fc.assert(
      fc.property(simpleTableConfigArb, (baseConfig) => {
        const config = { ...baseConfig, showRowNumber: true }
        const renderer = new RowNumberHeaderDecorator(new BaseHeaderRenderer())
        const html = renderer.renderHeader(config)

        // Should contain "No." but not rowspan (since it's single row)
        expect(html).toContain('No.')
        // The No. cell should not have rowspan attribute
        const noMatch = html.match(/<th[^>]*>No\.<\/th>/)
        if (noMatch) {
          expect(noMatch[0]).not.toContain('rowspan')
        }
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 5: Valid HTML output**
   * **Validates: Requirements 5.1, 5.4**
   *
   * *For any* configuration, createHeaderRenderer should return appropriate renderer.
   */
  it('should create appropriate renderer based on config', () => {
    fc.assert(
      fc.property(fc.boolean(), (showRowNumber) => {
        const config: TableConfig = {
          columns: [{ header: 'Col', field: 'field' }],
          dataField: 'data',
          showRowNumber,
        }

        const renderer = createHeaderRenderer(config)

        if (showRowNumber) {
          expect(renderer).toBeInstanceOf(RowNumberHeaderDecorator)
        } else {
          expect(renderer).toBeInstanceOf(BaseHeaderRenderer)
        }
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 5: Valid HTML output**
   * **Validates: Requirements 5.1, 5.3**
   *
   * *For any* configuration, decorator should not modify output when showRowNumber is false.
   */
  it('should not modify output when showRowNumber is false', () => {
    fc.assert(
      fc.property(anyTableConfigArb, (baseConfig) => {
        const config = { ...baseConfig, showRowNumber: false }

        const baseRenderer = new BaseHeaderRenderer()
        const decoratedRenderer = new RowNumberHeaderDecorator(baseRenderer)

        const baseHtml = baseRenderer.renderHeader(config)
        const decoratedHtml = decoratedRenderer.renderHeader(config)

        // Output should be identical when showRowNumber is false
        expect(decoratedHtml).toBe(baseHtml)
        return true
      }),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Decorator Pattern Unit Tests
// ============================================

describe('Decorator Pattern - Unit Tests', () => {
  it('should render simple header correctly', () => {
    const config: TableConfig = {
      columns: [
        { header: 'Name', field: 'name' },
        { header: 'Age', field: 'age' },
      ],
      dataField: 'records',
    }

    const renderer = new BaseHeaderRenderer()
    const html = renderer.renderHeader(config)

    expect(html).toContain('<thead>')
    expect(html).toContain('</thead>')
    expect(html).toContain('Name')
    expect(html).toContain('Age')
  })

  it('should render multi-row header correctly', () => {
    const config: TableConfig = {
      columns: [
        { header: 'Date', field: 'date' },
        { header: 'Systolic', field: 'systolic' },
        { header: 'Diastolic', field: 'diastolic' },
      ],
      dataField: 'records',
      headerRows: [
        {
          cells: [
            { text: 'Date', rowspan: 2 },
            { text: 'Blood Pressure', colspan: 2 },
          ],
        },
        {
          cells: [{ text: 'Systolic' }, { text: 'Diastolic' }],
        },
      ],
    }

    const renderer = new BaseHeaderRenderer()
    const html = renderer.renderHeader(config)

    expect(html).toContain('<thead>')
    expect(html).toContain('rowspan="2"')
    expect(html).toContain('colspan="2"')
    expect(html).toContain('Blood Pressure')
  })

  it('should add row number column with decorator', () => {
    const config: TableConfig = {
      columns: [{ header: 'Name', field: 'name' }],
      dataField: 'records',
      showRowNumber: true,
    }

    const baseRenderer = new BaseHeaderRenderer()
    const renderer = new RowNumberHeaderDecorator(baseRenderer)
    const html = renderer.renderHeader(config)

    expect(html).toContain('No.')
    expect(html).toContain('Name')
  })

  it('should add rowspan to row number for multi-row headers', () => {
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

    const baseRenderer = new BaseHeaderRenderer()
    const renderer = new RowNumberHeaderDecorator(baseRenderer)
    const html = renderer.renderHeader(config)

    // Row number should have rowspan="2" for 2-row header
    expect(html).toMatch(/<th rowspan="2">No\.<\/th>/)
  })

  it('should support decorator chaining', () => {
    const config: TableConfig = {
      columns: [{ header: 'Name', field: 'name' }],
      dataField: 'records',
      showRowNumber: true,
    }

    // Create nested decorators (even though we only have one decorator type)
    const baseRenderer = new BaseHeaderRenderer()
    const decorated = new RowNumberHeaderDecorator(baseRenderer)

    const html = decorated.renderHeader(config)

    expect(html).toContain('<thead>')
    expect(html).toContain('No.')
  })
})
