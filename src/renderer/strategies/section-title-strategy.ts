/**
 * @fileoverview 区块标题渲染策略
 * @module renderer/strategies/section-title-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderSectionTitle, SectionTitleConfig } from '../section-renderers/section-title'

/**
 * 区块标题渲染策略
 */
export class SectionTitleStrategy implements SectionRenderStrategy {
  readonly type = 'section-title'

  render(config: SectionTitleConfig, _data: FormData, _options?: RenderOptions): string {
    return renderSectionTitle(config)
  }
}
