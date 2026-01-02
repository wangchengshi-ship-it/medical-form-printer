import type { Meta, StoryObj } from '@storybook/html'
import { renderSignatureArea } from '../../src/renderer/section-renderers/signature-area'
import { generateCss, mergeTheme } from '../../src/styles'
import type { SignatureConfig } from '../../src/types/print-schema'

// 包装函数：添加样式
const wrapWithStyles = (html: string): HTMLElement => {
  const theme = mergeTheme()
  const css = generateCss(theme)
  
  const container = document.createElement('div')
  container.innerHTML = `
    <style>${css}</style>
    <div class="print-page a4 portrait" style="padding: 20px;">
      ${html}
    </div>
  `
  return container
}

const meta: Meta = {
  title: 'PrintRenderer/Sections/SignatureArea',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 基础签名区域
export const Basic: Story = {
  name: '基础签名区域',
  render: () => {
    const config: SignatureConfig = {
      fields: [
        { label: '主治医师', field: 'doctorSignature', showDate: true },
        { label: '护士长', field: 'headNurseSignature', showDate: true },
        { label: '患者/家属', field: 'patientSignature', showDate: false },
      ],
    }
    
    const data = {
      doctorSignature: '王医生',
      doctorSignatureDate: '2024-01-15',
      headNurseSignature: '李护士长',
      headNurseSignatureDate: '2024-01-15',
      patientSignature: '张三',
    }
    
    const html = renderSignatureArea(config, data)
    return wrapWithStyles(html)
  },
}

// 单个签名
export const SingleSignature: Story = {
  name: '单个签名',
  render: () => {
    const config: SignatureConfig = {
      fields: [
        { label: '护士签名', field: 'nurseSignature', showDate: true },
      ],
    }
    
    const data = {
      nurseSignature: '李护士',
      nurseSignatureDate: '2024-01-15',
    }
    
    const html = renderSignatureArea(config, data)
    return wrapWithStyles(html)
  },
}

// 无日期签名
export const WithoutDate: Story = {
  name: '无日期签名',
  render: () => {
    const config: SignatureConfig = {
      fields: [
        { label: '记录人', field: 'recorder', showDate: false },
        { label: '审核人', field: 'reviewer', showDate: false },
      ],
    }
    
    const data = {
      recorder: '张护士',
      reviewer: '王主任',
    }
    
    const html = renderSignatureArea(config, data)
    return wrapWithStyles(html)
  },
}

// 空签名
export const EmptySignature: Story = {
  name: '空签名',
  render: () => {
    const config: SignatureConfig = {
      fields: [
        { label: '主治医师', field: 'doctorSignature', showDate: true },
        { label: '护士长', field: 'headNurseSignature', showDate: true },
      ],
    }
    
    const data = {}
    
    const html = renderSignatureArea(config, data)
    return wrapWithStyles(html)
  },
}
