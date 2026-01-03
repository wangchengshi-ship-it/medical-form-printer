/**
 * @fileoverview HTML builder module
 * @module renderer/builders
 * 
 * @description
 * Build HTML structures using the Builder pattern.
 * Provides a chainable API for constructing complex HTML elements.
 */

export {
  HtmlElementBuilder,
  div,
  span,
  table,
  thead,
  tbody,
  tr,
  th,
  td,
  p,
  header,
  footer,
  main,
  h1,
} from './html-element-builder'
export { PageBuilder } from './page-builder'
export type { PageConfig, HeaderConfig, FooterConfig } from './page-builder'
export { TableBuilder } from './table-builder'
export type { ColumnConfig, TableConfig } from './table-builder'
