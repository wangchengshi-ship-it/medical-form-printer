/**
 * @fileoverview 工具模块导出
 * @module utils
 */

// 水印工具
export {
  clamp,
  normalizeOpacity,
  renderWatermarkHtml,
  extractWatermarkOptions,
} from './watermark'
export type { WatermarkOptions } from './watermark'

export {
  // HTML 构建器
  HtmlBuilder,
  h,
  fragment,
  when,
  each,
  // HTML 转义
  escapeHtml,
  escapeAttr,
  // 常用标签快捷方法
  div,
  span,
  table,
  thead,
  tbody,
  tr,
  th,
  td,
  p,
  img,
  a,
  ul,
  li,
  header,
  footer,
  main,
  section,
  article,
  nav,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  br,
  hr,
} from './html-builder'
