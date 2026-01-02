/**
 * @fileoverview 勾选框网格渲染策略
 * @module renderer/strategies/checkbox-grid-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { CheckboxGridConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderCheckboxGrid } from '../section-renderers/checkbox-grid'

/**
 * 勾选框网格渲染策略
 */
export class CheckboxGridStrategy implements SectionRenderStrategy {
  readonly type = 'checkbox-grid'

  render(config: CheckboxGridConfig, data: FormData, options?: RenderOptions): string {
    return renderCheckboxGrid(config, data, options)
  }
}
