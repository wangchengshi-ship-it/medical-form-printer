/**
 * @fileoverview 表格构建器
 * @module renderer/builders/table-builder
 * 
 * @description
 * 使用 Builder 模式构建 HTML 表格结构。
 * 支持表头、表体、行号、列宽等配置。
 */

import { escapeHtml } from '../../utils'

/** 列配置 */
export interface ColumnConfig {
  /** 列标题 */
  header: string
  /** 数据字段 */
  field: string
  /** 列宽 */
  width?: string
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 格式化函数 */
  formatter?: (value: unknown, row: Record<string, unknown>, index: number) => string
}

/** 表格配置 */
export interface TableConfig {
  /** 是否显示行号 */
  showRowNumber?: boolean
  /** 行号列标题 */
  rowNumberHeader?: string
  /** 表格类名 */
  className?: string
  /** 是否显示边框 */
  bordered?: boolean
}

/**
 * 表格构建器
 * 构建 HTML 表格结构
 */
export class TableBuilder {
  private columns: ColumnConfig[] = []
  private rows: Record<string, unknown>[] = []
  private config: TableConfig = {}
  private headerRows: string[][] = []
  private footerRows: string[][] = []

  /**
   * 创建表格构建器
   * @param config - 表格配置
   */
  constructor(config?: TableConfig) {
    if (config) {
      this.config = config
    }
  }

  /**
   * 设置配置
   * @param config - 表格配置
   */
  setConfig(config: TableConfig): this {
    this.config = { ...this.config, ...config }
    return this
  }

  /**
   * 添加列
   * @param column - 列配置
   */
  addColumn(column: ColumnConfig): this {
    this.columns.push(column)
    return this
  }

  /**
   * 批量添加列
   * @param columns - 列配置数组
   */
  addColumns(columns: ColumnConfig[]): this {
    this.columns.push(...columns)
    return this
  }

  /**
   * 设置数据行
   * @param rows - 数据行数组
   */
  setRows(rows: Record<string, unknown>[]): this {
    this.rows = rows
    return this
  }

  /**
   * 添加数据行
   * @param row - 数据行
   */
  addRow(row: Record<string, unknown>): this {
    this.rows.push(row)
    return this
  }

  /**
   * 添加自定义表头行
   * @param cells - 单元格内容数组
   */
  addHeaderRow(cells: string[]): this {
    this.headerRows.push(cells)
    return this
  }

  /**
   * 添加自定义表尾行
   * @param cells - 单元格内容数组
   */
  addFooterRow(cells: string[]): this {
    this.footerRows.push(cells)
    return this
  }

  /**
   * 构建表头 HTML
   */
  private buildHeader(): string {
    const headerCells: string[] = []

    // 行号列
    if (this.config.showRowNumber) {
      const header = this.config.rowNumberHeader || '序号'
      headerCells.push(`<th>${escapeHtml(header)}</th>`)
    }

    // 数据列
    for (const col of this.columns) {
      const widthStyle = col.width ? ` style="width: ${col.width}"` : ''
      headerCells.push(`<th${widthStyle}>${escapeHtml(col.header)}</th>`)
    }

    const rows: string[] = []

    // 自定义表头行
    for (const cells of this.headerRows) {
      const cellsHtml = cells.map(cell => `<th>${escapeHtml(cell)}</th>`).join('\n')
      rows.push(`<tr>\n${cellsHtml}\n</tr>`)
    }

    // 默认表头行
    if (headerCells.length > 0) {
      rows.push(`<tr>\n${headerCells.join('\n')}\n</tr>`)
    }

    return `<thead>\n${rows.join('\n')}\n</thead>`
  }

  /**
   * 构建表体 HTML
   */
  private buildBody(): string {
    const bodyRows: string[] = []

    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i]
      const cells: string[] = []

      // 行号
      if (this.config.showRowNumber) {
        cells.push(`<td>${i + 1}</td>`)
      }

      // 数据单元格
      for (const col of this.columns) {
        const value = row[col.field]
        let displayValue: string

        if (col.formatter) {
          displayValue = col.formatter(value, row, i)
        } else if (value === undefined || value === null || value === '') {
          displayValue = ''
        } else {
          displayValue = escapeHtml(String(value))
        }

        const alignStyle = col.align ? ` style="text-align: ${col.align}"` : ''
        cells.push(`<td${alignStyle}>${displayValue}</td>`)
      }

      bodyRows.push(`<tr>\n${cells.join('\n')}\n</tr>`)
    }

    return `<tbody>\n${bodyRows.join('\n')}\n</tbody>`
  }

  /**
   * 构建表尾 HTML
   */
  private buildFooter(): string {
    if (this.footerRows.length === 0) return ''

    const rows: string[] = []

    for (const cells of this.footerRows) {
      const cellsHtml = cells.map(cell => `<td>${escapeHtml(cell)}</td>`).join('\n')
      rows.push(`<tr>\n${cellsHtml}\n</tr>`)
    }

    return `<tfoot>\n${rows.join('\n')}\n</tfoot>`
  }

  /**
   * 构建表格 HTML
   * @returns 表格 HTML 字符串
   */
  build(): string {
    const className = this.config.className || 'data-table'
    const header = this.buildHeader()
    const body = this.buildBody()
    const footer = this.buildFooter()

    return `<div class="print-section ${className}">
<table>
${header}
${body}
${footer}
</table>
</div>`
  }

  /**
   * 仅构建表格元素（不含包装 div）
   * @returns 表格 HTML 字符串
   */
  buildTable(): string {
    const header = this.buildHeader()
    const body = this.buildBody()
    const footer = this.buildFooter()

    return `<table>
${header}
${body}
${footer}
</table>`
  }
}
