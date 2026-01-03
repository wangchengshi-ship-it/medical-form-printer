/**
 * @fileoverview Checkbox Grid Render Strategy
 * @module renderer/strategies/checkbox-grid-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { CheckboxGridConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderCheckboxGrid } from '../section-renderers/checkbox-grid'

/**
 * Checkbox Grid Render Strategy
 */
export class CheckboxGridStrategy implements SectionRenderStrategy {
  readonly type = 'checkbox-grid'

  render(config: CheckboxGridConfig, data: FormData, options?: RenderOptions): string {
    return renderCheckboxGrid(config, data, options)
  }
}
