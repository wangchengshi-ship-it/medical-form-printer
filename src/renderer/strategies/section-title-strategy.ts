/**
 * @fileoverview Section Title Render Strategy
 * @module renderer/strategies/section-title-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderSectionTitle, SectionTitleConfig } from '../section-renderers/section-title'

/**
 * Section Title Render Strategy
 */
export class SectionTitleStrategy implements SectionRenderStrategy {
  readonly type = 'section-title'

  render(config: SectionTitleConfig, data: FormData, options?: RenderOptions): string {
    return renderSectionTitle(config, data, options)
  }
}
