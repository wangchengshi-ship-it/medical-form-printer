/**
 * @fileoverview Medical checkbox row rendering strategy
 * @module renderer/strategies/medical-checkbox-row-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { MedicalCheckboxRowConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderMedicalCheckboxRow } from '../section-renderers/medical-checkbox-row'

/**
 * Medical checkbox row rendering strategy
 */
export class MedicalCheckboxRowStrategy implements SectionRenderStrategy {
  readonly type = 'medical-checkbox-row'

  render(config: MedicalCheckboxRowConfig, data: FormData, options?: RenderOptions): string {
    return renderMedicalCheckboxRow(config, data, options)
  }
}
