/**
 * @fileoverview Table Header Builder
 * @module renderer/section-renderers/table/header-builder
 * @version 2.0.0
 * @author Kiro
 * @created 2026-01-05
 *
 * @description
 * Implements the Builder Pattern (GoF) for constructing complex table header
 * configurations. Provides a fluent API for building multi-row headers with
 * colspan and rowspan support.
 *
 * Design Pattern: Builder Pattern (GoF)
 * - Separates the construction of a complex object from its representation
 * - Same construction process can create different representations
 * - Provides step-by-step construction with a fluent interface
 *
 * @example
 * ```typescript
 * const headerRows = new TableHeaderBuilder()
 *   .addRow()
 *     .addCell('Date').rowspan(2).done()
 *     .addCell('Blood Pressure').colspan(2).done()
 *   .addRow()
 *     .addCell('Systolic').field('systolic').done()
 *     .addCell('Diastolic').field('diastolic').done()
 *   .build()
 * ```
 */

import type { HeaderCell, HeaderRow } from '../../../types/print-schema'

/**
 * Header cell builder for constructing individual header cells
 *
 * @since next
 * @description
 * Provides a fluent API for building HeaderCell configurations.
 * Part of the Builder Pattern implementation for table headers.
 *
 * Design Pattern: Builder Pattern (GoF) - Component Builder
 * - Builds individual HeaderCell objects
 * - Supports method chaining for fluent configuration
 * - Returns parent builder via done() for continued construction
 *
 * @example
 * ```typescript
 * const cell = new HeaderCellBuilder('Blood Pressure')
 *   .colspan(2)
 *   .width('200px')
 *   .build()
 * ```
 */
export class HeaderCellBuilder {
  private cell: HeaderCell
  private parent: HeaderRowBuilder | null

  /**
   * Create a new header cell builder
   * @param text - The cell text content
   * @param parent - Optional parent row builder for chaining
   */
  constructor(text: string, parent?: HeaderRowBuilder) {
    this.cell = { text }
    this.parent = parent || null
  }

  /**
   * Set the colspan (number of columns this cell spans)
   * @param value - Number of columns to span (must be positive integer, default: 1)
   * @returns this builder for chaining
   */
  colspan(value: number): this {
    if (value > 1 && Number.isInteger(value)) {
      this.cell.colspan = value
    }
    return this
  }

  /**
   * Set the rowspan (number of rows this cell spans)
   * @param value - Number of rows to span (must be positive integer, default: 1)
   * @returns this builder for chaining
   */
  rowspan(value: number): this {
    if (value > 1 && Number.isInteger(value)) {
      this.cell.rowspan = value
    }
    return this
  }

  /**
   * Set the cell width
   * @param value - Width value (e.g., '100px', '20%')
   * @returns this builder for chaining
   */
  width(value: string): this {
    this.cell.width = value
    return this
  }

  /**
   * Set the associated data field name
   * @param value - Field name that links to data column
   * @returns this builder for chaining
   */
  field(value: string): this {
    this.cell.field = value
    return this
  }

  /**
   * Complete cell configuration and return to parent row builder
   * @returns Parent HeaderRowBuilder for continued construction
   * @throws Error if no parent builder is set
   */
  done(): HeaderRowBuilder {
    if (!this.parent) {
      throw new Error('Cannot call done() without a parent builder. Use build() instead.')
    }
    this.parent.addBuiltCell(this.build())
    return this.parent
  }

  /**
   * Build and return the HeaderCell configuration
   * @returns The constructed HeaderCell object
   */
  build(): HeaderCell {
    return { ...this.cell }
  }
}


/**
 * Header row builder for constructing header rows
 *
 * @since next
 * @description
 * Provides a fluent API for building HeaderRow configurations.
 * Part of the Builder Pattern implementation for table headers.
 *
 * Design Pattern: Builder Pattern (GoF) - Component Builder
 * - Builds individual HeaderRow objects containing cells
 * - Supports method chaining for fluent configuration
 * - Returns parent builder via done() for continued construction
 *
 * @example
 * ```typescript
 * const row = new HeaderRowBuilder()
 *   .addCell('Date').rowspan(2).done()
 *   .addCell('Value').done()
 *   .build()
 * ```
 */
export class HeaderRowBuilder {
  private row: HeaderRow
  private parent: TableHeaderBuilder | null

  /**
   * Create a new header row builder
   * @param parent - Optional parent table header builder for chaining
   */
  constructor(parent?: TableHeaderBuilder) {
    this.row = { cells: [] }
    this.parent = parent || null
  }

  /**
   * Add a new cell to this row and return a cell builder
   * @param text - The cell text content
   * @returns HeaderCellBuilder for configuring the cell
   */
  addCell(text: string): HeaderCellBuilder {
    return new HeaderCellBuilder(text, this)
  }

  /**
   * Internal method to add a built cell to the row
   * @internal
   * @param cell - The built HeaderCell to add
   */
  addBuiltCell(cell: HeaderCell): void {
    this.row.cells.push(cell)
  }

  /**
   * Complete row configuration and return to parent table builder
   * @returns Parent TableHeaderBuilder for continued construction
   * @throws Error if no parent builder is set
   */
  done(): TableHeaderBuilder {
    if (!this.parent) {
      throw new Error('Cannot call done() without a parent builder. Use build() instead.')
    }
    this.parent.addBuiltRow(this.build())
    return this.parent
  }

  /**
   * Build and return the HeaderRow configuration
   * @returns The constructed HeaderRow object
   */
  build(): HeaderRow {
    return { cells: [...this.row.cells] }
  }
}

/**
 * Table header builder for constructing complete multi-row header configurations
 *
 * @since next
 * @description
 * Provides a fluent API for building complete table header configurations
 * with multiple rows, colspan, and rowspan support.
 *
 * Design Pattern: Builder Pattern (GoF) - Director/Main Builder
 * - Orchestrates the construction of complex HeaderRow[] configurations
 * - Provides step-by-step construction with a fluent interface
 * - Separates construction logic from representation
 *
 * @example
 * ```typescript
 * // Build a complex header with blood pressure split into systolic/diastolic
 * const headerRows = new TableHeaderBuilder()
 *   .addRow()
 *     .addCell('Date').rowspan(2).done()
 *     .addCell('Blood Pressure (mmHg)').colspan(2).done()
 *     .addCell('Temperature (℃)').rowspan(2).done()
 *   .addRow()
 *     .addCell('Systolic').field('systolic').done()
 *     .addCell('Diastolic').field('diastolic').done()
 *   .build()
 * ```
 */
export class TableHeaderBuilder {
  private rows: HeaderRow[]

  /**
   * Create a new table header builder
   */
  constructor() {
    this.rows = []
  }

  /**
   * Add a new row to the header and return a row builder
   * @returns HeaderRowBuilder for configuring the row
   */
  addRow(): HeaderRowBuilder {
    return new HeaderRowBuilder(this)
  }

  /**
   * Internal method to add a built row to the header
   * @internal
   * @param row - The built HeaderRow to add
   */
  addBuiltRow(row: HeaderRow): void {
    this.rows.push(row)
  }

  /**
   * Build and return the complete header configuration
   * @returns Array of HeaderRow objects
   */
  build(): HeaderRow[] {
    return this.rows.map((row) => ({ cells: [...row.cells] }))
  }

  /**
   * Convert the header configuration to JSON string
   * @returns JSON string representation of the header rows
   */
  toJSON(): string {
    return JSON.stringify(this.build())
  }

  /**
   * Create a TableHeaderBuilder from JSON string
   * @param json - JSON string representation of header rows
   * @returns New TableHeaderBuilder with the parsed configuration
   */
  static fromJSON(json: string): TableHeaderBuilder {
    const rows: HeaderRow[] = JSON.parse(json)
    return TableHeaderBuilder.fromRows(rows)
  }

  /**
   * Create a TableHeaderBuilder from existing HeaderRow array
   * @param rows - Array of HeaderRow configurations
   * @returns New TableHeaderBuilder with the provided configuration
   */
  static fromRows(rows: HeaderRow[]): TableHeaderBuilder {
    const builder = new TableHeaderBuilder()
    for (const row of rows) {
      builder.rows.push({ cells: [...row.cells] })
    }
    return builder
  }
}
