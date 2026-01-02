/**
 * @fileoverview 信息网格渲染策略
 * @module renderer/strategies/info-grid-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { InfoGridConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderInfoGrid } from '../section-renderers/info-grid'

/**
 * 信息网格渲染策略
 */
export class InfoGridStrategy implements SectionRenderStrategy {
  readonly type = 'info-grid'

  render(config: InfoGridConfig, data: FormData, options?: RenderOptions): string {
    return renderInfoGrid(config, data, options)
  }
}
