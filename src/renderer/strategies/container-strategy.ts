/**
 * @fileoverview 容器渲染策略
 * @module renderer/strategies/container-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { ContainerConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderContainer } from '../section-renderers/container'

/**
 * 容器渲染策略
 */
export class ContainerStrategy implements SectionRenderStrategy {
  readonly type = 'container'

  render(config: ContainerConfig, data: FormData, options?: RenderOptions): string {
    return renderContainer(config, data, options)
  }
}
