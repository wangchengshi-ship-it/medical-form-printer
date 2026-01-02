/**
 * @fileoverview 内联样式映射
 * @module styles/inline-styles
 * 
 * @description
 * 定义可直接注入到 HTML 元素 style 属性的内联样式。
 * 用于生成不依赖外部 CSS 文件的自包含 HTML。
 */

import type { Theme } from '../types/theme'
import { defaultTheme } from './default-theme'

/** 样式对象类型 */
export type StyleObject = Record<string, string | number>

/** 内联样式映射类型 */
export interface InlineStyleMap {
  // 页面级
  printPage: StyleObject
  printPageLandscape: StyleObject
  printPageA5: StyleObject
  printPageA5Landscape: StyleObject
  printPage16K: StyleObject
  printPage16KLandscape: StyleObject
  
  // 页眉
  printHeader: StyleObject
  hospitalName: StyleObject
  departmentName: StyleObject
  formTitle: StyleObject
  
  // 区块通用
  printSection: StyleObject
  sectionTitle: StyleObject
  
  // 信息网格
  infoGridTable: StyleObject
  infoGridTd: StyleObject
  infoGridLabelCell: StyleObject
  infoGridValueCell: StyleObject
  
  // 数据表格
  dataTableTable: StyleObject
  dataTableTh: StyleObject
  dataTableTd: StyleObject
  
  // 勾选框网格
  checkboxGrid: StyleObject
  checkboxGridFlex: StyleObject
  checkboxItem: StyleObject
  checkboxSymbol: StyleObject
  
  // 签名区域
  signatureArea: StyleObject
  signatureItem: StyleObject
  signatureLine: StyleObject
  
  // 备注区域
  notesSection: StyleObject
  notesSectionBordered: StyleObject
  
  // 自由文本
  freeText: StyleObject
  
  // 页脚
  printFooter: StyleObject
  
  // 水印
  watermark: StyleObject
}

/**
 * 将样式对象转换为 CSS 字符串
 * @param styles - 样式对象
 * @returns CSS 字符串（用于 style 属性）
 */
export function styleToString(styles: StyleObject): string {
  return Object.entries(styles)
    .map(([key, value]) => {
      // 将 camelCase 转换为 kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${cssKey}: ${value}`
    })
    .join('; ')
}

/**
 * 合并多个样式对象
 * @param styles - 样式对象数组
 * @returns 合并后的样式对象
 */
export function mergeStyles(...styles: (StyleObject | undefined | null)[]): StyleObject {
  return styles.reduce<StyleObject>((acc, style) => {
    if (style) {
      return { ...acc, ...style }
    }
    return acc
  }, {})
}

/**
 * 根据主题生成内联样式映射
 * @param theme - 主题配置
 * @returns 内联样式映射
 */
export function createInlineStyles(theme: Theme = defaultTheme): InlineStyleMap {
  return {
    // 页面级
    printPage: {
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSize.body,
      lineHeight: '1.5',
      color: theme.colors.text,
      background: theme.colors.background,
      padding: theme.spacing.pageMargin,
      width: '210mm',
      minHeight: '297mm',
      boxSizing: 'border-box',
      margin: '0',
    },
    printPageLandscape: {
      width: '297mm',
      minHeight: '210mm',
    },
    printPageA5: {
      width: '148mm',
      minHeight: '210mm',
    },
    printPageA5Landscape: {
      width: '210mm',
      minHeight: '148mm',
    },
    printPage16K: {
      width: '195mm',
      minHeight: '270mm',
    },
    printPage16KLandscape: {
      width: '270mm',
      minHeight: '195mm',
    },
    
    // 页眉
    printHeader: {
      textAlign: 'center',
      marginBottom: '10mm',
    },
    hospitalName: {
      fontFamily: theme.fonts.heading,
      fontSize: theme.fontSize.hospitalName,
      fontWeight: 'bold',
    },
    departmentName: {
      fontSize: theme.fontSize.sectionTitle,
      marginTop: '2mm',
    },
    formTitle: {
      fontFamily: theme.fonts.heading,
      fontSize: theme.fontSize.formTitle,
      fontWeight: 'bold',
      marginTop: '5mm',
    },
    
    // 区块通用
    printSection: {
      marginBottom: theme.spacing.sectionGap,
    },
    sectionTitle: {
      fontFamily: theme.fonts.heading,
      fontSize: theme.fontSize.sectionTitle,
      fontWeight: 'bold',
      marginBottom: '2mm',
    },
    
    // 信息网格
    infoGridTable: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    infoGridTd: {
      border: `${theme.borderWidth} solid ${theme.colors.border}`,
      padding: theme.spacing.cellPadding,
      verticalAlign: 'middle',
    },
    infoGridLabelCell: {
      background: theme.colors.labelBackground,
      whiteSpace: 'nowrap',
      fontWeight: 'normal',
    },
    infoGridValueCell: {
      minWidth: '30mm',
    },
    
    // 数据表格
    dataTableTable: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    dataTableTh: {
      border: `${theme.borderWidth} solid ${theme.colors.border}`,
      padding: theme.spacing.cellPadding,
      textAlign: 'center',
      background: theme.colors.labelBackground,
      fontWeight: 'normal',
    },
    dataTableTd: {
      border: `${theme.borderWidth} solid ${theme.colors.border}`,
      padding: theme.spacing.cellPadding,
      textAlign: 'center',
    },
    
    // 勾选框网格
    checkboxGrid: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    checkboxGridFlex: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    checkboxItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '2mm',
      padding: '1mm 3mm',
    },
    checkboxSymbol: {
      fontFamily: '"Segoe UI Symbol", "Apple Symbols", sans-serif',
    },
    
    // 签名区域
    signatureArea: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '20mm',
      marginTop: '10mm',
    },
    signatureItem: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '2mm',
    },
    signatureLine: {
      display: 'inline-block',
      minWidth: '30mm',
      borderBottom: `${theme.borderWidth} solid ${theme.colors.border}`,
    },
    
    // 备注区域
    notesSection: {
      padding: theme.spacing.cellPadding,
      fontSize: theme.fontSize.small,
      color: theme.colors.textSecondary,
    },
    notesSectionBordered: {
      border: `${theme.borderWidth} solid ${theme.colors.border}`,
    },
    
    // 自由文本
    freeText: {
      border: `${theme.borderWidth} solid ${theme.colors.border}`,
      padding: theme.spacing.cellPadding,
      minHeight: '20mm',
      whiteSpace: 'pre-wrap',
    },
    
    // 页脚
    printFooter: {
      marginTop: '10mm',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: theme.fontSize.small,
      color: theme.colors.textSecondary,
    },
    
    // 水印
    watermark: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(-45deg)',
      fontSize: '48pt',
      color: 'rgba(0, 0, 0, 0.1)',
      pointerEvents: 'none',
      zIndex: '1000',
      whiteSpace: 'nowrap',
    },
  }
}

/**
 * 获取页面尺寸的内联样式
 * @param pageSize - 页面尺寸 ('A4' | 'A5' | '16K')
 * @param orientation - 页面方向 ('portrait' | 'landscape')
 * @param styles - 内联样式映射
 * @returns 合并后的页面样式
 */
export function getPageStyles(
  pageSize: string,
  orientation: string,
  styles: InlineStyleMap
): StyleObject {
  let pageStyles = { ...styles.printPage }
  
  const size = pageSize.toLowerCase()
  const isLandscape = orientation === 'landscape'
  
  if (size === 'a5') {
    pageStyles = mergeStyles(pageStyles, styles.printPageA5)
    if (isLandscape) {
      pageStyles = mergeStyles(pageStyles, styles.printPageA5Landscape)
    }
  } else if (size === '16k') {
    pageStyles = mergeStyles(pageStyles, styles.printPage16K)
    if (isLandscape) {
      pageStyles = mergeStyles(pageStyles, styles.printPage16KLandscape)
    }
  } else {
    // A4 default
    if (isLandscape) {
      pageStyles = mergeStyles(pageStyles, styles.printPageLandscape)
    }
  }
  
  return pageStyles
}

/** 默认内联样式映射（使用默认主题） */
export const defaultInlineStyles = createInlineStyles(defaultTheme)
