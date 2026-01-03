/**
 * @fileoverview Signature Area Render Strategy
 * @module renderer/strategies/signature-area-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { SignatureConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderSignatureArea } from '../section-renderers/signature-area'

/**
 * Signature Area Render Strategy
 */
export class SignatureAreaStrategy implements SectionRenderStrategy {
  readonly type = 'signature-area'

  render(config: SignatureConfig, data: FormData, options?: RenderOptions): string {
    return renderSignatureArea(config, data, options)
  }
}
