/**
 * @fileoverview HTML 构建器模块
 * @module renderer/builders
 * 
 * @description
 * 使用 Builder 模式构建 HTML 结构。
 * 提供链式 API 构建复杂的 HTML 元素。
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
