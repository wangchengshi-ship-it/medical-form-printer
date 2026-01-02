/**
 * @fileoverview PrintSchema 类型定义
 * @module types/print-schema
 * @description 定义打印布局配置的完整类型系统
 */

/** 页面尺寸 */
export type PageSize = 'A4' | 'A5'

/** 页面方向 */
export type PageOrientation = 'portrait' | 'landscape'

/** 区块类型 */
export type SectionType =
  | 'info-grid'
  | 'table'
  | 'checkbox-grid'
  | 'signature-area'
  | 'notes'
  | 'free-text'

/** 单元格数据类型 */
export type CellType = 'text' | 'checkbox' | 'date' | 'number' | 'signature'

/** 页眉配置 */
export interface PrintHeader {
  /** 医院名称 */
  hospital: string
  /** 科室名称 */
  department?: string
  /** 表单标题 */
  title: string
  /** 是否显示 Logo */
  showLogo?: boolean
  /** Logo URL */
  logoUrl?: string
}

/** 页脚配置 */
export interface PrintFooter {
  /** 是否显示页码 */
  showPageNumber?: boolean
  /** 备注文本 */
  notes?: string
}

/** 信息网格单元格 */
export interface InfoGridCell {
  /** 标签文本 */
  label: string
  /** 对应 formData 的字段名 */
  field: string
  /** 合并单元格数 */
  span?: number
  /** 数据类型 */
  type?: CellType
}

/** 信息网格行 */
export interface InfoGridRow {
  cells: InfoGridCell[]
}

/** 信息网格配置 */
export interface InfoGridConfig {
  /** 列数 */
  columns: number
  /** 行配置 */
  rows: InfoGridRow[]
}

/** 表格列配置 */
export interface TableColumn {
  /** 列标题 */
  header: string
  /** 对应 formData 的字段名 */
  field: string
  /** 列宽 */
  width?: string
  /** 数据类型 */
  type?: CellType
  /** 选项（select 类型） */
  options?: string[]
}

/** 表格配置 */
export interface TableConfig {
  /** 列配置 */
  columns: TableColumn[]
  /** formData 中的数组字段名 */
  dataField: string
  /** 是否显示行号 */
  showRowNumber?: boolean
}

/** 勾选框选项 */
export interface CheckboxOption {
  /** 选项值 */
  value: string
  /** 显示标签 */
  label: string
  /** 是否有附加输入框 */
  hasInput?: boolean
  /** 附加输入框字段名 */
  inputField?: string
}

/** 勾选框网格配置 */
export interface CheckboxGridConfig {
  /** 对应 formData 的字段名 */
  field: string
  /** 选项列表 */
  options: CheckboxOption[]
  /** 列数 */
  columns: number
}

/** 签名字段配置 */
export interface SignatureField {
  /** 标签文本 */
  label: string
  /** 对应 formData 的字段名 */
  field: string
  /** 是否显示日期 */
  showDate?: boolean
}

/** 签名区域配置 */
export interface SignatureConfig {
  fields: SignatureField[]
}

/** 备注配置 */
export interface NotesConfig {
  /** 静态文本内容 */
  content: string
  /** 是否显示边框 */
  showBorder?: boolean
}

/** 自由文本配置 */
export interface FreeTextConfig {
  /** 对应 formData 的字段名 */
  field: string
  /** 最小高度 */
  minHeight?: string
}

/** 区块配置联合类型 */
export type SectionConfig =
  | InfoGridConfig
  | TableConfig
  | CheckboxGridConfig
  | SignatureConfig
  | NotesConfig
  | FreeTextConfig

/** 打印区块 */
export interface PrintSection {
  /** 区块类型 */
  type: SectionType
  /** 区块标题 */
  title?: string
  /** 区块配置 */
  config: SectionConfig
}

/** 打印布局配置 */
export interface PrintSchema {
  /** 页面尺寸 */
  pageSize: PageSize
  /** 页面方向 */
  orientation: PageOrientation
  /** 页眉配置 */
  header: PrintHeader
  /** 区块列表 */
  sections: PrintSection[]
  /** 页脚配置 */
  footer?: PrintFooter
}

/** 表单数据类型 */
export type FormData = Record<string, unknown>
