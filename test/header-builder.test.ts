/**
 * @fileoverview Property-Based Tests for Table Header Builder
 * @module test/header-builder
 *
 * @description
 * Property-based tests for the table header builder pattern.
 * Uses fast-check to verify correctness properties across many inputs.
 *
 * **Feature: table-header-merge**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  HeaderCellBuilder,
  HeaderRowBuilder,
  TableHeaderBuilder,
} from '../src/renderer/section-renderers/table/header-builder'
import type { HeaderCell, HeaderRow } from '../src/types/print-schema'

// ============================================
// Generators
// ============================================

/**
 * Generate a valid header cell configuration
 */
const headerCellArb: fc.Arbitrary<HeaderCell> = fc.record({
  text: fc.string({ minLength: 1, maxLength: 20 }),
  colspan: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
  rowspan: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
  width: fc.option(fc.constantFrom('100px', '20%', '50px', '150px'), { nil: undefined }),
  field: fc.option(fc.string({ minLength: 1, maxLength: 15 }), { nil: undefined }),
})

/**
 * Generate a valid header row configuration
 */
const headerRowArb: fc.Arbitrary<HeaderRow> = fc.record({
  cells: fc.array(headerCellArb, { minLength: 1, maxLength: 5 }),
})

/**
 * Generate an array of header rows
 */
const headerRowsArb: fc.Arbitrary<HeaderRow[]> = fc.array(headerRowArb, {
  minLength: 1,
  maxLength: 4,
})

// ============================================
// Property 4: 配置序列化往返
// ============================================

describe('Property 4: 配置序列化往返', () => {
  /**
   * **Feature: table-header-merge, Property 4: Configuration serialization round-trip**
   * **Validates: Requirements 4.1, 4.2, 4.3**
   *
   * *For any* valid HeaderRow configuration, serializing to JSON and parsing back
   * SHALL produce an equivalent configuration object.
   */
  it('should round-trip HeaderRow[] through JSON serialization', () => {
    fc.assert(
      fc.property(headerRowsArb, (originalRows) => {
        // Build using TableHeaderBuilder.fromRows
        const builder = TableHeaderBuilder.fromRows(originalRows)

        // Serialize to JSON
        const json = builder.toJSON()

        // Parse back
        const rebuiltBuilder = TableHeaderBuilder.fromJSON(json)
        const rebuiltRows = rebuiltBuilder.build()

        // Should be equivalent
        expect(rebuiltRows).toEqual(originalRows)
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 4: Configuration serialization round-trip**
   * **Validates: Requirements 4.1, 4.2, 4.3**
   *
   * *For any* HeaderCell built with the builder, the resulting object
   * should match the expected configuration.
   */
  it('should build HeaderCell with correct properties', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        fc.constantFrom('100px', '20%', '50px'),
        fc.string({ minLength: 1, maxLength: 10 }),
        (text, colspan, rowspan, width, field) => {
          const builder = new HeaderCellBuilder(text)

          // Only set colspan/rowspan if > 1 (builder ignores value of 1)
          if (colspan > 1) builder.colspan(colspan)
          if (rowspan > 1) builder.rowspan(rowspan)
          builder.width(width).field(field)

          const cell = builder.build()

          expect(cell.text).toBe(text)
          if (colspan > 1) {
            expect(cell.colspan).toBe(colspan)
          } else {
            expect(cell.colspan).toBeUndefined()
          }
          if (rowspan > 1) {
            expect(cell.rowspan).toBe(rowspan)
          } else {
            expect(cell.rowspan).toBeUndefined()
          }
          expect(cell.width).toBe(width)
          expect(cell.field).toBe(field)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 4: Configuration serialization round-trip**
   * **Validates: Requirements 4.1, 4.2**
   *
   * *For any* sequence of cells added to a row, the built row should contain
   * all cells in the correct order.
   */
  it('should build HeaderRow with cells in correct order', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
        (texts) => {
          const rowBuilder = new HeaderRowBuilder()

          // Add cells using the fluent API
          for (const text of texts) {
            rowBuilder.addCell(text).done()
          }

          const row = rowBuilder.build()

          expect(row.cells.length).toBe(texts.length)
          for (let i = 0; i < texts.length; i++) {
            expect(row.cells[i].text).toBe(texts[i])
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 4: Configuration serialization round-trip**
   * **Validates: Requirements 4.1, 4.2**
   *
   * *For any* sequence of rows added to a table header, the built configuration
   * should contain all rows in the correct order.
   */
  it('should build TableHeader with rows in correct order', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 3 }),
          { minLength: 1, maxLength: 4 }
        ),
        (rowTexts) => {
          const builder = new TableHeaderBuilder()

          // Add rows using the fluent API
          for (const texts of rowTexts) {
            let rowBuilder = builder.addRow()
            for (const text of texts) {
              rowBuilder.addCell(text).done()
            }
            rowBuilder.done()
          }

          const rows = builder.build()

          expect(rows.length).toBe(rowTexts.length)
          for (let i = 0; i < rowTexts.length; i++) {
            expect(rows[i].cells.length).toBe(rowTexts[i].length)
            for (let j = 0; j < rowTexts[i].length; j++) {
              expect(rows[i].cells[j].text).toBe(rowTexts[i][j])
            }
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: table-header-merge, Property 4: Configuration serialization round-trip**
   * **Validates: Requirements 4.3**
   *
   * JSON serialization should produce valid JSON that can be parsed.
   */
  it('should produce valid JSON from toJSON()', () => {
    fc.assert(
      fc.property(headerRowsArb, (rows) => {
        const builder = TableHeaderBuilder.fromRows(rows)
        const json = builder.toJSON()

        // Should not throw when parsing
        expect(() => JSON.parse(json)).not.toThrow()

        // Parsed result should be an array
        const parsed = JSON.parse(json)
        expect(Array.isArray(parsed)).toBe(true)
        return true
      }),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Builder Pattern Unit Tests
// ============================================

describe('Builder Pattern - Fluent API', () => {
  it('should support complete fluent chain for complex header', () => {
    const headerRows = new TableHeaderBuilder()
      .addRow()
      .addCell('Date')
      .rowspan(2)
      .done()
      .addCell('Blood Pressure (mmHg)')
      .colspan(2)
      .done()
      .addCell('Temperature (℃)')
      .rowspan(2)
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

    expect(headerRows.length).toBe(2)

    // First row
    expect(headerRows[0].cells.length).toBe(3)
    expect(headerRows[0].cells[0]).toEqual({ text: 'Date', rowspan: 2 })
    expect(headerRows[0].cells[1]).toEqual({ text: 'Blood Pressure (mmHg)', colspan: 2 })
    expect(headerRows[0].cells[2]).toEqual({ text: 'Temperature (℃)', rowspan: 2 })

    // Second row
    expect(headerRows[1].cells.length).toBe(2)
    expect(headerRows[1].cells[0]).toEqual({ text: 'Systolic', field: 'systolic' })
    expect(headerRows[1].cells[1]).toEqual({ text: 'Diastolic', field: 'diastolic' })
  })

  it('should throw error when calling done() without parent', () => {
    const cellBuilder = new HeaderCellBuilder('Test')
    expect(() => cellBuilder.done()).toThrow('Cannot call done() without a parent builder')

    const rowBuilder = new HeaderRowBuilder()
    expect(() => rowBuilder.done()).toThrow('Cannot call done() without a parent builder')
  })

  it('should create independent copies when building', () => {
    const builder = new TableHeaderBuilder()
    builder.addRow().addCell('Test').done().done()

    const rows1 = builder.build()
    const rows2 = builder.build()

    // Should be equal but not the same reference
    expect(rows1).toEqual(rows2)
    expect(rows1).not.toBe(rows2)
    expect(rows1[0]).not.toBe(rows2[0])
    expect(rows1[0].cells).not.toBe(rows2[0].cells)
  })
})
