/**
 * @fileoverview Utils module exports
 * @module utils
 */

// Watermark utilities
export {
  clamp,
  normalizeOpacity,
  renderWatermarkHtml,
  extractWatermarkOptions,
} from './watermark'
export type { WatermarkOptions } from './watermark'

export {
  // HTML builder
  HtmlBuilder,
  h,
  fragment,
  when,
  each,
  // HTML escaping
  escapeHtml,
  escapeAttr,
  // Common tag shortcut methods
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
