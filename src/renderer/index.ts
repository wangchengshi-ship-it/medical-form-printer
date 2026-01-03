/**
 * @fileoverview Renderer module exports
 * @module renderer
 */

export { renderToHtml } from './html-renderer'
export { renderToIsolatedHtml, renderToIsolatedFragment } from './isolated-html-renderer'
export type { IsolatedRenderOptions } from './isolated-html-renderer'
export {
  registerSectionRenderer,
  getSectionRenderer,
  renderSection,
} from './section-renderers'
export type { SectionRenderer } from './section-renderers'

// Strategy pattern
export {
  StrategyContext,
  createDefaultStrategyContext,
  InfoGridStrategy,
  TableStrategy,
  CheckboxGridStrategy,
  SignatureAreaStrategy,
  NotesStrategy,
  FreeTextStrategy,
  SectionTitleStrategy,
  MedicalCheckboxRowStrategy,
  InlineRowStrategy,
  ContainerStrategy,
} from './strategies'
export type { SectionRenderStrategy } from './strategies'

// Factory pattern
export {
  SectionRendererFactory,
  getDefaultSectionRendererFactory,
  FormatterFactory,
  getDefaultFormatterFactory,
} from './factory'
export type { RendererCreator, Formatter, FormatterConfig } from './factory'

// Builder pattern
export {
  HtmlElementBuilder,
  PageBuilder,
  TableBuilder,
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
} from './builders'
export type { PageConfig, HeaderConfig, FooterConfig, ColumnConfig, TableConfig } from './builders'

// Composite pattern
export {
  LeafSection,
  ContainerSection,
  SectionTreeTraverser,
  createSectionComponent,
  createSectionTree,
  renderSectionTree,
} from './composite'
export type { SectionComponent } from './composite'

// Template Method pattern
export {
  AbstractPageRenderer,
  SinglePageRenderer,
  PaginatedPageRenderer,
  createSinglePageRenderer,
  createPaginatedPageRenderer,
} from './templates'
export type { PageRenderContext } from './templates'

// Visitor pattern
export {
  FormatVisitor,
  ValidationVisitor,
  MeasureVisitor,
  FormDataTraverser,
  createFormatVisitor,
  createValidationVisitor,
  createMeasureVisitor,
  createFormDataTraverser,
} from './visitors'
export type {
  FormDataVisitor,
  FieldInfo,
  ValidationResult,
  MeasureResult,
} from './visitors'
