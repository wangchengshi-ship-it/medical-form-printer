/**
 * @fileoverview 渲染器模块导出
 * @module renderer
 */

export { renderToHtml } from './html-renderer'
export {
  registerSectionRenderer,
  getSectionRenderer,
  renderSection,
} from './section-renderers'
export type { SectionRenderer } from './section-renderers'
