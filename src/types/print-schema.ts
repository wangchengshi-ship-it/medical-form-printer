/**
 * @fileoverview PrintSchema type definitions
 * @module types/print-schema
 * @version 2.0.0
 * @author Kiro
 * @created 2024-04-07
 * @modified 2026-01-04
 * 
 * @description
 * Defines complete type system for print layout configuration.
 * Includes page settings, section types, cell types, and all
 * configuration interfaces for the medical form print renderer.
 * 
 * @usedBy
 * - renderer/html-renderer - Main HTML rendering
 * - renderer/section-renderers/* - Section-specific renderers
 * - renderer/isolated-html-renderer - Isolated CSS rendering
 */

/** Page size */
export type PageSize = 'A4' | 'A5' | '16K'

/** Page orientation */
export type PageOrientation = 'portrait' | 'landscape'

/** Section type */
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

/** Cell data type */
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

/** Header configuration */
export interface PrintHeader {
  /** Hospital name */
  hospital: string
  /** Department name */
  department?: string
  /** Form title */
  title: string
  /** Whether to show logo */
  showLogo?: boolean
  /** Logo URL */
  logoUrl?: string
}

/** Footer configuration */
export interface PrintFooter {
  /** Whether to show page number */
  showPageNumber?: boolean
  /** Notes text */
  notes?: string
}

/** Info grid cell */
export interface InfoGridCell {
  /** Label text */
  label: string
  /** Field name in formData */
  field: string
  /** Cell span */
  span?: number
  /** Data type */
  type?: CellType
  /** Suffix (e.g., '℃', 'kg') */
  suffix?: string
  /** Custom width */
  width?: string
  /** checkbox-inline options (e.g., ['No', 'Yes']) */
  inlineOptions?: string[]
  /** compound template format (e.g., '{systolic}/{diastolic}mmHg') */
  compoundFormat?: string
  /** compound field mapping (e.g., { systolic: 'bp_systolic', diastolic: 'bp_diastolic' }) */
  compoundFields?: Record<string, string>
  /** textarea minimum height */
  minHeight?: string
  /** checkbox-text checkbox field name */
  checkboxField?: string
  /** checkbox-text text field name */
  textField?: string
  /** checkbox-text display text */
  text?: string
}

/** Info grid row */
export interface InfoGridRow {
  cells: InfoGridCell[]
}

/** Info grid configuration */
export interface InfoGridConfig {
  /** Number of columns */
  columns: number
  /** Row configuration */
  rows: InfoGridRow[]
}

/** Table column configuration */
export interface TableColumn {
  /** Column header */
  header: string
  /** Field name in formData */
  field: string
  /** Column width */
  width?: string
  /** Data type */
  type?: CellType
  /** Options (for select type) */
  options?: string[]
}

/** Table configuration */
export interface TableConfig {
  /** Column configuration */
  columns: TableColumn[]
  /** Array field name in formData */
  dataField: string
  /** Whether to show row numbers */
  showRowNumber?: boolean
}

/** Checkbox option */
export interface CheckboxOption {
  /** Option value */
  value: string
  /** Display label */
  label: string
  /** Whether has additional input */
  hasInput?: boolean
  /** Additional input field name */
  inputField?: string
}

/** Checkbox item (items mode) */
export interface CheckboxItem {
  /** Item type: checkbox or text-input */
  type?: 'checkbox' | 'text-input'
  /** Option value (for checkbox type) */
  value?: unknown
  /** Display label */
  label: string
  /** Field name in formData (for per-item field binding) */
  field?: string
  /** Prefix label (displayed before the checkbox) */
  prefixLabel?: string
  /** Whether has additional input (for checkbox type) */
  hasInput?: boolean
  /** Additional input field name */
  inputField?: string
}

/** Checkbox grid configuration */
export interface CheckboxGridConfig {
  /** Field name in formData (optional when using items mode with per-item fields) */
  field?: string
  /** Option list (options mode) */
  options?: CheckboxOption[]
  /** Item list (items mode, supports more types) */
  items?: CheckboxItem[]
  /** Number of columns */
  columns?: number
  /** Layout mode */
  layout?: 'grid' | 'flex'
  /** Prefix label */
  prefixLabel?: string
}

/** Signature field configuration */
export interface SignatureField {
  /** Label text */
  label: string
  /** Field name in formData */
  field: string
  /** Whether to show date */
  showDate?: boolean
}

/** Signature area configuration */
export interface SignatureConfig {
  fields: SignatureField[]
}

/** Notes configuration */
export interface NotesConfig {
  /** Static text content */
  content: string
  /** Whether to show border */
  showBorder?: boolean
}

/** Free text configuration */
export interface FreeTextConfig {
  /** Field name in formData */
  field: string
  /** Minimum height */
  minHeight?: string
}

/** Section title configuration */
export interface SectionTitleConfig {
  /** Title text */
  text: string
  /** Alignment */
  align?: 'left' | 'center' | 'right'
  /** Font size */
  fontSize?: string
  /** Whether bold */
  bold?: boolean
}

/** Medical checkbox option configuration */
export interface MedicalCheckboxOption {
  /** Option value */
  value: string
  /** Display label */
  label: string
}

/** Extra input item configuration */
export interface ExtraInput {
  /** Input label */
  label?: string
  /** Field name in formData */
  field: string
  /** Suffix text */
  suffix?: string
}

/** Medical checkbox row configuration */
export interface MedicalCheckboxRowConfig {
  /** Prefix label (e.g., "Bowel movement:") */
  prefixLabel?: string
  /** Field name in formData (for checkbox selection) */
  field?: string
  /** Option list (□Yes/□No) */
  options?: MedicalCheckboxOption[]
  /** Input format template (e.g., "{input} times/day"), {input} will be replaced with input field */
  inputFormat?: string
  /** Input field name (for inputFormat) */
  inputField?: string
  /** Simple input label (e.g., "Disease name") */
  inputLabel?: string
  /** Simple input field name (for inputLabel) */
  inputLabelField?: string
  /** Extra input items list */
  extraInputs?: ExtraInput[]
}

/** Inline row child element */
export interface InlineRowChild {
  /** Section type */
  type: SectionType
  /** Section configuration */
  config: SectionConfig
}

/** Inline row configuration */
export interface InlineRowConfig {
  /** Child element list */
  children: InlineRowChild[]
  /** Column ratio configuration (e.g., [1, 2, 1] means 1:2:1) */
  columns?: number[]
  /** Gap */
  gap?: string
}

/** Container child element */
export interface ContainerChild {
  /** Section type */
  type: SectionType
  /** Section configuration */
  config: SectionConfig
}

/** Container configuration */
export interface ContainerConfig {
  /** Child section list */
  children: ContainerChild[]
  /** Layout direction */
  direction?: 'row' | 'column'
  /** Border configuration */
  border?: boolean | string
  /** Padding */
  padding?: string
  /** Gap */
  gap?: string
}

/** Section configuration union type */
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

/** Print section */
export interface PrintSection {
  /** Section type */
  type: SectionType
  /** Section title */
  title?: string
  /** Section configuration */
  config: SectionConfig
}

/** Print layout configuration */
export interface PrintSchema {
  /** Page size */
  pageSize: PageSize
  /** Page orientation */
  orientation: PageOrientation
  /** Header configuration */
  header: PrintHeader
  /** Section list */
  sections: PrintSection[]
  /** Footer configuration */
  footer?: PrintFooter
}

/** Form data type */
export type FormData = Record<string, unknown>
