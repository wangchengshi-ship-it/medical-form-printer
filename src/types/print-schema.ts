/**
 * @fileoverview PrintSchema 类型定义
 * @module types/print-schema
 * @description 定义打印布局配置的完整类型系统
 * @modif 2024-04-07
 */

/** 页面尺寸 */
export type PageSize = 'A4' | 'A5' | '16K'

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
  | 'section-title'
  | 'medical-checkbox-row'
  | 'inline-row'
  | 'container'

/** 单元格数据类型 */
export type CellType = 
  | 'text' 
  | 'checkbox' 
  | 'date' 
  | 'number' 
  | 'signature'
  | 'checkbox-inline'
  | 'compound'
  | 'textarea'
  | 'checkbox-text'

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
  /** 后缀（如 '℃', 'kg'） */
  suffix?: string
  /** 自定义宽度 */
  width?: string
  /** checkbox-inline 选项（如 ['无', '有']） */
  inlineOptions?: string[]
  /** compound 模板格式（如 '{systolic}/{diastolic}mmHg'） */
  compoundFormat?: string
  /** compound 字段映射（如 { systolic: 'bp_systolic', diastolic: 'bp_diastolic' }） */
  compoundFields?: Record<string, string>
  /** textarea 最小高度 */
  minHeight?: string
  /** checkbox-text 勾选框字段名 */
  checkboxField?: string
  /** checkbox-text 文本字段名 */
  textField?: string
  /** checkbox-text 显示文本 */
  text?: string
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

/** 勾选框项（items 模式） */
export interface CheckboxItem {
  /** 项类型：checkbox 或 text-input */
  type?: 'checkbox' | 'text-input'
  /** 选项值（checkbox 类型） */
  value?: string
  /** 显示标签 */
  label: string
  /** 是否有附加输入框（checkbox 类型） */
  hasInput?: boolean
  /** 附加输入框字段名 */
  inputField?: string
}

/** 勾选框网格配置 */
export interface CheckboxGridConfig {
  /** 对应 formData 的字段名 */
  field: string
  /** 选项列表（options 模式） */
  options?: CheckboxOption[]
  /** 项列表（items 模式，支持更多类型） */
  items?: CheckboxItem[]
  /** 列数 */
  columns?: number
  /** 布局方式 */
  layout?: 'grid' | 'flex'
  /** 前缀标签 */
  prefixLabel?: string
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

/** 区块标题配置 */
export interface SectionTitleConfig {
  /** 标题文本 */
  text: string
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 字体大小 */
  fontSize?: string
  /** 是否加粗 */
  bold?: boolean
}

/** 医疗勾选选项配置 */
export interface MedicalCheckboxOption {
  /** 选项值 */
  value: string
  /** 显示标签 */
  label: string
}

/** 额外输入项配置 */
export interface ExtraInput {
  /** 输入框标签 */
  label?: string
  /** 对应 formData 的字段名 */
  field: string
  /** 后缀文本 */
  suffix?: string
}

/** 医疗勾选行配置 */
export interface MedicalCheckboxRowConfig {
  /** 前缀标签（如"排便情况："） */
  prefixLabel?: string
  /** 对应 formData 的字段名（用于选项勾选） */
  field?: string
  /** 选项列表（□有/□无） */
  options?: MedicalCheckboxOption[]
  /** 输入框模板格式（如 "{input}次/日"），{input} 会被替换为输入框 */
  inputFormat?: string
  /** 输入框对应的字段名（用于 inputFormat） */
  inputField?: string
  /** 简单输入框标签（如 "疾病名称"） */
  inputLabel?: string
  /** 简单输入框字段名（用于 inputLabel） */
  inputLabelField?: string
  /** 额外输入项列表 */
  extraInputs?: ExtraInput[]
}

/** 行内分列子元素 */
export interface InlineRowChild {
  /** 区块类型 */
  type: SectionType
  /** 区块配置 */
  config: SectionConfig
}

/** 行内分列配置 */
export interface InlineRowConfig {
  /** 子元素列表 */
  children: InlineRowChild[]
  /** 列比例配置（如 [1, 2, 1] 表示 1:2:1） */
  columns?: number[]
  /** 间距 */
  gap?: string
}

/** 容器子元素 */
export interface ContainerChild {
  /** 区块类型 */
  type: SectionType
  /** 区块配置 */
  config: SectionConfig
}

/** 容器配置 */
export interface ContainerConfig {
  /** 子区块列表 */
  children: ContainerChild[]
  /** 布局方向 */
  direction?: 'row' | 'column'
  /** 边框配置 */
  border?: boolean | string
  /** 内边距 */
  padding?: string
  /** 间距 */
  gap?: string
}

/** 区块配置联合类型 */
export type SectionConfig =
  | InfoGridConfig
  | TableConfig
  | CheckboxGridConfig
  | SignatureConfig
  | NotesConfig
  | FreeTextConfig
  | SectionTitleConfig
  | MedicalCheckboxRowConfig
  | InlineRowConfig
  | ContainerConfig

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
