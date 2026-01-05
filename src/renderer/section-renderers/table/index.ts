/**
 * @fileoverview Table Header Module Exports
 * @module renderer/section-renderers/table
 * @version 2.0.0
 * @author Kiro
 * @created 2026-01-05
 *
 * @description
 * Exports all public interfaces and classes for the table header module.
 * This module provides support for complex multi-row table headers with
 * colspan and rowspan capabilities.
 *
 * ## Design Patterns Used
 * - Strategy Pattern: HeaderRenderStrategy for different header rendering approaches
 * - Builder Pattern: TableHeaderBuilder for fluent header configuration
 * - Decorator Pattern: HeaderRenderer with RowNumberHeaderDecorator
 *
 * @example
 * ```typescript
 * import {
 *   TableHeaderBuilder,
 *   createHeaderRenderer,
 *   SimpleHeaderStrategy,
 *   MultiRowHeaderStrategy,
 * } from './table'
 *
 * // Build complex header using builder pattern
 * const headerRows = new TableHeaderBuilder()
 *   .addRow()
 *     .addCell('Date').rowspan(2).done()
 *     .addCell('Blood Pressure (mmHg)').colspan(2).done()
 *   .addRow()
 *     .addCell('Systolic').field('systolic').done()
 *     .addCell('Diastolic').field('diastolic').done()
 *   .build()
 * ```
 */

// Strategy Pattern exports
export {
  type HeaderRenderStrategy,
  type CellPosition,
  SimpleHeaderStrategy,
  MultiRowHeaderStrategy,
  calculateCellMatrix,
  getHeaderStrategy,
} from './header-strategy'

// Builder Pattern exports
export {
  HeaderCellBuilder,
  HeaderRowBuilder,
  TableHeaderBuilder,
} from './header-builder'

// Decorator Pattern exports
export {
  type HeaderRenderer,
  BaseHeaderRenderer,
  RowNumberHeaderDecorator,
  createHeaderRenderer,
} from './header-renderer'
