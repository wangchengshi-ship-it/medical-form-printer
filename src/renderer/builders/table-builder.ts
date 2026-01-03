/**
 * @fileoverview Table Builder
 * @module renderer/builders/table-builder
 * 
 * @description
 * Uses Builder pattern to construct HTML table structure.
 * Supports header, body, row numbers, column widths and other configurations.
 */

import { escapeHtml } from '../../utils'

/** Column configuration */
export interface ColumnConfig {
  /** Column header */
  header: string
  /** Data field */
  field: string
  /** Column width */
  width?: string
  /** Alignment */
  align?: 'left' | 'center' | 'right'
  /** Formatter function */
  formatter?: (value: unknown, row: Record<string, unknown>, index: number) => string
}

/** Table configuration */
export interface TableConfig {
  /** Whether to show row numbers */
  showRowNumber?: boolean
  /** Row number column header */
  rowNumberHeader?: string
  /** Table class name */
  className?: string
  /** Whether to show borders */
  bordered?: boolean
}

/**
 * Table Builder
 * Constructs HTML table structure
 */
export class TableBuilder {
  private columns: ColumnConfig[] = []
  private rows: Record<string, unknown>[] = []
  private config: TableConfig = {}
  private headerRows: string[][] = []
  private footerRows: string[][] = []

  /**
   * Create table builder
   * @param config - Table configuration
   */
  constructor(config?: TableConfig) {
    if (config) {
      this.config = config
    }
  }

  /**
   * Set configuration
   * @param config - Table configuration
   */
  setConfig(config: TableConfig): this {
    this.config = { ...this.config, ...config }
    return this
  }

  /**
   * Add column
   * @param column - Column configuration
   */
  addColumn(column: ColumnConfig): this {
    this.columns.push(column)
    return this
  }

  /**
   * Add multiple columns
   * @param columns - Column configuration array
   */
  addColumns(columns: ColumnConfig[]): this {
    this.columns.push(...columns)
    return this
  }

  /**
   * Set data rows
   * @param rows - Data row array
   */
  setRows(rows: Record<string, unknown>[]): this {
    this.rows = rows
    return this
  }

  /**
   * Add data row
   * @param row - Data row
   */
  addRow(row: Record<string, unknown>): this {
    this.rows.push(row)
    return this
  }

  /**
   * Add custom header row
   * @param cells - Cell content array
   */
  addHeaderRow(cells: string[]): this {
    this.headerRows.push(cells)
    return this
  }

  /**
   * Add custom footer row
   * @param cells - Cell content array
   */
  addFooterRow(cells: string[]): this {
    this.footerRows.push(cells)
    return this
  }

  /**
   * Build header HTML
   */
  private buildHeader(): string {
    const headerCells: string[] = []

    // Row number column
    if (this.config.showRowNumber) {
      const header = this.config.rowNumberHeader || 'No.'
      headerCells.push(`<th>${escapeHtml(header)}</th>`)
    }

    // Data columns
    for (const col of this.columns) {
      const widthStyle = col.width ? ` style="width: ${col.width}"` : ''
      headerCells.push(`<th${widthStyle}>${escapeHtml(col.header)}</th>`)
    }

    const rows: string[] = []

    // Custom header rows
    for (const cells of this.headerRows) {
      const cellsHtml = cells.map(cell => `<th>${escapeHtml(cell)}</th>`).join('\n')
      rows.push(`<tr>\n${cellsHtml}\n</tr>`)
    }

    // Default header row
    if (headerCells.length > 0) {
      rows.push(`<tr>\n${headerCells.join('\n')}\n</tr>`)
    }

    return `<thead>\n${rows.join('\n')}\n</thead>`
  }

  /**
   * Build body HTML
   */
  private buildBody(): string {
    const bodyRows: string[] = []

    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i]
      const cells: string[] = []

      // Row number
      if (this.config.showRowNumber) {
        cells.push(`<td>${i + 1}</td>`)
      }

      // Data cells
      for (const col of this.columns) {
        const value = row[col.field]
        let displayValue: string

        if (col.formatter) {
          displayValue = col.formatter(value, row, i)
        } else if (value === undefined || value === null || value === '') {
          displayValue = ''
        } else {
          displayValue = escapeHtml(String(value))
        }

        const alignStyle = col.align ? ` style="text-align: ${col.align}"` : ''
        cells.push(`<td${alignStyle}>${displayValue}</td>`)
      }

      bodyRows.push(`<tr>\n${cells.join('\n')}\n</tr>`)
    }

    return `<tbody>\n${bodyRows.join('\n')}\n</tbody>`
  }

  /**
   * Build footer HTML
   */
  private buildFooter(): string {
    if (this.footerRows.length === 0) return ''

    const rows: string[] = []

    for (const cells of this.footerRows) {
      const cellsHtml = cells.map(cell => `<td>${escapeHtml(cell)}</td>`).join('\n')
      rows.push(`<tr>\n${cellsHtml}\n</tr>`)
    }

    return `<tfoot>\n${rows.join('\n')}\n</tfoot>`
  }

  /**
   * Build table HTML
   * @returns Table HTML string
   */
  build(): string {
    const className = this.config.className || 'data-table'
    const header = this.buildHeader()
    const body = this.buildBody()
    const footer = this.buildFooter()

    return `<div class="print-section ${className}">
<table>
${header}
${body}
${footer}
</table>
</div>`
  }

  /**
   * Build table element only (without wrapper div)
   * @returns Table HTML string
   */
  buildTable(): string {
    const header = this.buildHeader()
    const body = this.buildBody()
    const footer = this.buildFooter()

    return `<table>
${header}
${body}
${footer}
</table>`
  }
}
