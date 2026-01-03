import type { Meta, StoryObj } from '@storybook/html'
import { renderTable } from '../../src/renderer/section-renderers/table'
import { generateIsolatedCss, ISOLATION_ROOT_CLASS, CSS_NAMESPACE } from '../../src/styles'
import type { TableConfig } from '../../src/types/print-schema'

// 命名空间前缀
const ns = CSS_NAMESPACE

// 包装函数：添加隔离样式（使用内嵌思源宋体）
const wrapWithStyles = (html: string): HTMLElement => {
  const css = generateIsolatedCss()
  
  const container = document.createElement('div')
  container.innerHTML = `
    <div class="${ISOLATION_ROOT_CLASS}">
      <style>${css}</style>
      <div class="${ns}-print-page ${ns}-a4 ${ns}-portrait" style="padding: 20px;">
        ${html}
      </div>
    </div>
  `
  return container
}

const meta: Meta = {
  title: 'PrintRenderer/Sections/Table',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 基础表格
export const Basic: Story = {
  name: '基础表格',
  render: () => {
    const config: TableConfig = {
      dataField: 'records',
      columns: [
        { header: '日期', field: 'date', type: 'date', width: '100px' },
        { header: '体温(℃)', field: 'temperature', type: 'number', width: '80px' },
        { header: '血压', field: 'bloodPressure', type: 'text', width: '100px' },
        { header: '备注', field: 'notes', type: 'text' },
      ],
    }
    
    const data = {
      records: [
        { date: '2024-01-15', temperature: 36.5, bloodPressure: '120/80', notes: '状态良好' },
        { date: '2024-01-16', temperature: 36.8, bloodPressure: '118/78', notes: '' },
        { date: '2024-01-17', temperature: 36.6, bloodPressure: '122/82', notes: '待复查' },
      ],
    }
    
    const html = renderTable(config, data)
    return wrapWithStyles(html)
  },
}

// 带行号
export const WithRowNumber: Story = {
  name: '带行号',
  render: () => {
    const config: TableConfig = {
      dataField: 'records',
      showRowNumber: true,
      columns: [
        { header: '日期', field: 'date', type: 'date', width: '100px' },
        { header: '体温(℃)', field: 'temperature', type: 'number', width: '80px' },
        { header: '已检查', field: 'checked', type: 'checkbox', width: '60px' },
        { header: '备注', field: 'notes', type: 'text' },
      ],
    }
    
    const data = {
      records: [
        { date: '2024-01-15', temperature: 36.5, checked: true, notes: '状态良好' },
        { date: '2024-01-16', temperature: 36.8, checked: true, notes: '' },
        { date: '2024-01-17', temperature: 36.6, checked: false, notes: '待复查' },
      ],
    }
    
    const html = renderTable(config, data)
    return wrapWithStyles(html)
  },
}

// 护理记录表
export const NursingRecord: Story = {
  name: '护理记录表',
  render: () => {
    const config: TableConfig = {
      dataField: 'nursingRecords',
      showRowNumber: true,
      columns: [
        { header: '时间', field: 'time', type: 'text', width: '80px' },
        { header: '护理内容', field: 'content', type: 'text' },
        { header: '护士签名', field: 'nurse', type: 'signature', width: '80px' },
      ],
    }
    
    const data = {
      nursingRecords: [
        { time: '08:00', content: '晨间护理，测量生命体征', nurse: '李护士' },
        { time: '10:00', content: '协助母乳喂养指导', nurse: '王护士' },
        { time: '14:00', content: '产后康复操指导', nurse: '李护士' },
        { time: '18:00', content: '晚间护理，观察恶露情况', nurse: '张护士' },
      ],
    }
    
    const html = renderTable(config, data)
    return wrapWithStyles(html)
  },
}

// 空数据
export const EmptyData: Story = {
  name: '空数据',
  render: () => {
    const config: TableConfig = {
      dataField: 'records',
      columns: [
        { header: '日期', field: 'date', type: 'date' },
        { header: '内容', field: 'content', type: 'text' },
      ],
    }
    
    const data = {
      records: [],
    }
    
    const html = renderTable(config, data)
    return wrapWithStyles(html)
  },
}
