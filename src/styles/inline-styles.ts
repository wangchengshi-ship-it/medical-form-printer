/**
 * @fileoverview Inline style mapping
 * @module styles/inline-styles
 * 
 * @description
 * Defines inline styles that can be directly injected into HTML element style attributes.
 * Used to generate self-contained HTML that doesn't depend on external CSS files.
 */

import type { Theme } from '../types/theme'
import { defaultTheme } from './default-theme'

/** Style object type */
export type StyleObject = Record<string, string | number>

/** Inline style map type */
export interface InlineStyleMap {
  // Page level
  printPage: StyleObject
  printPageLandscape: StyleObject
  printPageA5: StyleObject
  printPageA5Landscape: StyleObject
  printPage16K: StyleObject
  printPage16KLandscape: StyleObject
  
  // Header
  printHeader: StyleObject
  hospitalName: StyleObject
  departmentName: StyleObject
  formTitle: StyleObject
  
  // Section common
  printSection: StyleObject
  sectionTitle: StyleObject
  
  // Info grid
  infoGridTable: StyleObject
  infoGridTd: StyleObject
  infoGridLabelCell: StyleObject
  infoGridValueCell: StyleObject
  
  // Data table
  dataTableTable: StyleObject
  dataTableTh: StyleObject
  dataTableTd: StyleObject
  
  // Checkbox grid
  checkboxGrid: StyleObject
  checkboxGridFlex: StyleObject
  checkboxItem: StyleObject
  checkboxSymbol: StyleObject
  
  // Signature area
  signatureArea: StyleObject
  signatureItem: StyleObject
  signatureLine: StyleObject
  
  // Notes section
  notesSection: StyleObject
  notesSectionBordered: StyleObject
  
  // Free text
  freeText: StyleObject
  
  // Footer
  printFooter: StyleObject
  
  // Watermark
  watermark: StyleObject
}

/**
 * Convert style object to CSS string
 * @param styles - Style object
 * @returns CSS string (for style attribute)
 */
export function styleToString(styles: StyleObject): string {
  return Object.entries(styles)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${cssKey}: ${value}`
    })
    .join('; ')
}

/**
 * Merge multiple style objects
 * @param styles - Array of style objects
 * @returns Merged style object
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
 * Generate inline style map based on theme
 * @param theme - Theme configuration
 * @returns Inline style map
 */
export function createInlineStyles(theme: Theme = defaultTheme): InlineStyleMap {
  return {
    // Page level
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
      width: '185mm',
      minHeight: '260mm',
    },
    printPage16KLandscape: {
      width: '260mm',
      minHeight: '185mm',
    },
    
    // Header
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
    
    // Section common
    printSection: {
      marginBottom: theme.spacing.sectionGap,
    },
    sectionTitle: {
      fontFamily: theme.fonts.heading,
      fontSize: theme.fontSize.sectionTitle,
      fontWeight: 'bold',
      marginBottom: '2mm',
    },
    
    // Info grid
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
    
    // Data table
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
    
    // Checkbox grid
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
    
    // Signature area
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
    
    // Notes section
    notesSection: {
      padding: theme.spacing.cellPadding,
      fontSize: theme.fontSize.small,
      color: theme.colors.textSecondary,
    },
    notesSectionBordered: {
      border: `${theme.borderWidth} solid ${theme.colors.border}`,
    },
    
    // Free text
    freeText: {
      border: `${theme.borderWidth} solid ${theme.colors.border}`,
      padding: theme.spacing.cellPadding,
      minHeight: '20mm',
      whiteSpace: 'pre-wrap',
    },
    
    // Footer
    printFooter: {
      marginTop: '10mm',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: theme.fontSize.small,
      color: theme.colors.textSecondary,
    },
    
    // Watermark
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
 * Get inline styles for page size
 * @param pageSize - Page size ('A4' | 'A5' | '16K')
 * @param orientation - Page orientation ('portrait' | 'landscape')
 * @param styles - Inline style map
 * @returns Merged page styles
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

/** Default inline style map (using default theme) */
export const defaultInlineStyles = createInlineStyles(defaultTheme)
