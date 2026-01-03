/**
 * @fileoverview Data Table Render Strategy
 * @module renderer/strategies/table-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { TableConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderTable } from '../section-renderers/table'

/**
 * Data Table Render Strategy
 */
export class TableStrategy implements SectionRenderStrategy {
  readonly type = 'table'

  render(config: TableConfig, data: FormData, options?: RenderOptions): string {
    return renderTable(config, data, options)
  }
}
