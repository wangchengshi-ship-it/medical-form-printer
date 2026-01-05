/**
 * @fileoverview Table Header Render Strategy
 * @module renderer/section-renderers/table/header-strategy
 * @version 2.0.0
 * @author Kiro
 * @created 2026-01-05
 *
 * @description
 * Implements the Strategy Pattern (GoF) for table header rendering.
 * Supports both simple single-row headers (from columns) and complex
 * multi-row headers with colspan/rowspan support.
 *
 * Design Pattern: Strategy Pattern (GoF)
 * - Defines a family of algorithms (header rendering strategies)
 * - Encapsulates each algorithm in a separate class
 * - Makes them interchangeable at runtime
 *
 * @example
 * ```typescript
 * // Select strategy based on configuration
 * const strategy = config.headerRows
 *   ? new MultiRowHeaderStrategy()
 *   : new SimpleHeaderStrategy()
 * const html = strategy.render(config, options)
 * ```
 */

import type { TableConfig, TableColumn, HeaderRow, HeaderCell } from '../../../types/print-schema'
import type { RenderOptions } from '../../../types/options'
import { cls } from '../../../types/options'
import { escapeHtml, h, tr, th, thead, fragment } from '../../../utils'

/**
 * Cell position information for matrix calculation
 *
 * @since next
 * @description
 * Represents a cell's position in the header matrix, tracking
 * whether a position is occupied by a rowspan from above.
 */
export interface CellPosition {
  /** Row index in the header */
  row: number
  /** Column index in the header */
  col: number
  /** The header cell at this position (null if occupied by rowspan) */
  cell: HeaderCell | null
  /** Whether this position is occupied by a rowspan from above */
  isOccupied: boolean
}

/**
 * Table header render strategy interface
 *
 * @since next
 * @description
 * Defines the contract for header rendering strategies.
 *
 * Design Pattern: Strategy Pattern (GoF)
 * - Defines algorithm interface for header rendering
 * - Allows runtime selection of rendering approach
 * - Enables easy extension with new strategies
 *
 * @example
 * ```typescript
 * const strategy: HeaderRenderStrategy = new MultiRowHeaderStrategy()
 * if (strategy.canHandle(config)) {
 *   const html = strategy.render(config, options)
 * }
 * ```
 */
export interface HeaderRenderStrategy {
  /**
   * Check if this strategy can handle the given configuration
   * @param config - Table configuration
   * @returns true if this strategy can handle the configuration
   */
  canHandle(config: TableConfig): boolean

  /**
   * Render the table header HTML
   * @param config - Table configuration
   * @param options - Render options
   * @returns Rendered header HTML string (without thead wrapper)
   */
  render(config: TableConfig, options?: RenderOptions): string
}

/**
 * Simple header strategy - generates single-row header from columns
 *
 * @since next
 * @description
 * Renders a simple single-row header using the columns configuration.
 * This is the default strategy for backward compatibility.
 *
 * Design Pattern: Strategy Pattern (GoF) - Concrete Strategy
 *
 * @example
 * ```typescript
 * const strategy = new SimpleHeaderStrategy()
 * const html = strategy.render({
 *   columns: [
 *     { header: 'Date', field: 'date' },
 *     { header: 'Value', field: 'value' }
 *   ],
 *   dataField: 'records'
 * })
 * ```
 */
export class SimpleHeaderStrategy implements HeaderRenderStrategy {
  /**
   * Check if this strategy can handle the configuration
   * Returns true when headerRows is not provided or empty
   */
  canHandle(config: TableConfig): boolean {
    return !config.headerRows || config.headerRows.length === 0
  }

  /**
   * Render single-row header from columns configuration
   */
  render(config: TableConfig, options?: RenderOptions): string {
    const headers = config.columns
      .map((col) => {
        const thBuilder = th().text(col.header)
        if (col.width) {
          thBuilder.style('width', col.width)
        }
        return thBuilder.build()
      })
      .join('\n')

    return tr().raw(headers).build()
  }
}

/**
 * Multi-row header strategy - uses headerRows configuration
 *
 * @since next
 * @description
 * Renders complex multi-row headers with colspan and rowspan support.
 * Uses a cell matrix to correctly handle rowspan positioning.
 *
 * Design Pattern: Strategy Pattern (GoF) - Concrete Strategy
 *
 * @example
 * ```typescript
 * const strategy = new MultiRowHeaderStrategy()
 * const html = strategy.render({
 *   columns: [...],
 *   dataField: 'records',
 *   headerRows: [
 *     { cells: [{ text: 'Date', rowspan: 2 }, { text: 'Blood Pressure', colspan: 2 }] },
 *     { cells: [{ text: 'Systolic' }, { text: 'Diastolic' }] }
 *   ]
 * })
 * ```
 */
export class MultiRowHeaderStrategy implements HeaderRenderStrategy {
  /**
   * Check if this strategy can handle the configuration
   * Returns true when headerRows is provided and not empty
   */
  canHandle(config: TableConfig): boolean {
    return !!config.headerRows && config.headerRows.length > 0
  }

  /**
   * Render multi-row header from headerRows configuration
   */
  render(config: TableConfig, options?: RenderOptions): string {
    if (!config.headerRows || config.headerRows.length === 0) {
      return ''
    }

    const totalColumns = config.columns.length
    const matrix = calculateCellMatrix(config.headerRows, totalColumns)
    const rows: string[] = []

    for (let rowIndex = 0; rowIndex < config.headerRows.length; rowIndex++) {
      const headerRow = config.headerRows[rowIndex]
      const cells: string[] = []
      let cellIndex = 0

      for (let colIndex = 0; colIndex < totalColumns; colIndex++) {
        const position = matrix[rowIndex]?.[colIndex]

        // Skip if this position is occupied by a rowspan from above
        if (position?.isOccupied) {
          continue
        }

        // Get the cell for this position
        const cell = headerRow.cells[cellIndex]
        if (!cell) {
          cellIndex++
          continue
        }

        const thBuilder = th().text(cell.text)

        // Apply colspan (clamp to available columns)
        const colspan = Math.min(cell.colspan || 1, totalColumns - colIndex)
        if (colspan > 1) {
          thBuilder.attr('colspan', colspan)
        }

        // Apply rowspan (clamp to available rows)
        const rowspan = Math.min(cell.rowspan || 1, config.headerRows.length - rowIndex)
        if (rowspan > 1) {
          thBuilder.attr('rowspan', rowspan)
        }

        // Apply width if specified
        if (cell.width) {
          thBuilder.style('width', cell.width)
        }

        cells.push(thBuilder.build())
        cellIndex++

        // Skip columns covered by colspan
        colIndex += colspan - 1
      }

      rows.push(tr().raw(cells.join('\n')).build())
    }

    return rows.join('\n')
  }
}

/**
 * Calculate cell position matrix for multi-row headers
 *
 * @since next
 * @description
 * Builds a matrix representing cell positions in the header grid.
 * Tracks which positions are occupied by rowspan from cells above.
 * This is essential for correctly rendering multi-row headers.
 *
 * @param headerRows - Array of header row configurations
 * @param totalColumns - Total number of columns in the table
 * @returns 2D array of cell positions
 *
 * @example
 * ```typescript
 * const matrix = calculateCellMatrix([
 *   { cells: [{ text: 'A', rowspan: 2 }, { text: 'B', colspan: 2 }] },
 *   { cells: [{ text: 'C' }, { text: 'D' }] }
 * ], 3)
 * // Result: 3x2 matrix showing A spans rows 0-1, B spans cols 1-2
 * ```
 */
export function calculateCellMatrix(
  headerRows: HeaderRow[],
  totalColumns: number
): CellPosition[][] {
  const rowCount = headerRows.length
  const matrix: CellPosition[][] = []

  // Initialize empty matrix
  for (let row = 0; row < rowCount; row++) {
    matrix[row] = []
    for (let col = 0; col < totalColumns; col++) {
      matrix[row][col] = {
        row,
        col,
        cell: null,
        isOccupied: false,
      }
    }
  }

  // Fill matrix with cell positions
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const headerRow = headerRows[rowIndex]
    let cellIndex = 0
    let colIndex = 0

    while (colIndex < totalColumns && cellIndex < headerRow.cells.length) {
      // Skip occupied positions
      while (colIndex < totalColumns && matrix[rowIndex][colIndex].isOccupied) {
        colIndex++
      }

      if (colIndex >= totalColumns) break

      const cell = headerRow.cells[cellIndex]
      const colspan = Math.min(cell.colspan || 1, totalColumns - colIndex)
      const rowspan = Math.min(cell.rowspan || 1, rowCount - rowIndex)

      // Mark positions occupied by this cell
      for (let r = 0; r < rowspan; r++) {
        for (let c = 0; c < colspan; c++) {
          const targetRow = rowIndex + r
          const targetCol = colIndex + c

          if (targetRow < rowCount && targetCol < totalColumns) {
            matrix[targetRow][targetCol] = {
              row: targetRow,
              col: targetCol,
              cell: r === 0 && c === 0 ? cell : null,
              isOccupied: r > 0, // Only mark as occupied for rows below the cell
            }
          }
        }
      }

      colIndex += colspan
      cellIndex++
    }
  }

  return matrix
}

/**
 * Get the appropriate header render strategy for a configuration
 *
 * @since next
 * @description
 * Factory function that returns the appropriate strategy based on
 * the table configuration.
 *
 * @param config - Table configuration
 * @returns The appropriate header render strategy
 *
 * @example
 * ```typescript
 * const strategy = getHeaderStrategy(config)
 * const html = strategy.render(config, options)
 * ```
 */
export function getHeaderStrategy(config: TableConfig): HeaderRenderStrategy {
  const multiRowStrategy = new MultiRowHeaderStrategy()
  if (multiRowStrategy.canHandle(config)) {
    return multiRowStrategy
  }
  return new SimpleHeaderStrategy()
}
