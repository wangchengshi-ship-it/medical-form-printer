/**
 * @fileoverview 数据表格渲染策略
 * @module renderer/strategies/table-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { TableConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderTable } from '../section-renderers/table'

/**
 * 数据表格渲染策略
 */
export class TableStrategy implements SectionRenderStrategy {
  readonly type = 'table'

  render(config: TableConfig, data: FormData, options?: RenderOptions): string {
    return renderTable(config, data, options)
  }
}
