/**
 * @fileoverview Smart pagination strategy Storybook stories
 * @module stories/pagination/SmartPagination
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-04
 * @modified 2026-01-04
 *
 * @description
 * Demonstrates smart pagination functionality: tables with 14+ rows
 * automatically paginate across multiple pages using the strategy interface.
 *
 * @requirements
 * - 5.1: Show table with 14+ rows auto-paginating
 * - 5.3: Use strategy interface for rendering
 * - 5.4: Display realistic medical form data
 */

import type { Meta, StoryObj } from '@storybook/html'
import {
  SmartPaginationStrategy,
  createDefaultPaginationContext,
} from '../../src/pagination/strategies'
import type { PrintSchemaWithPagination } from '../../src/pagination/strategies'
import type { FormData } from '../../src/types/print-schema'
import { PLACEHOLDER } from '../../src/test-utils/placeholder-data'

// ==================== Schema Definition ====================

/**
 * Newborn nursing record schema with table for smart pagination demo
 * @requirements 5.4 - Display realistic medical form data
 */
const createSchema = (options?: {
  repeatTableHeaders?: boolean
  minRowHeight?: number
}): PrintSchemaWithPagination => ({
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: PLACEHOLDER.hospital.name,
    department: PLACEHOLDER.hospital.department,
    title: 'Newborn Nursing Record',
  },
  sections: [
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: 'Room No.', field: 'roomNumber', type: 'text' },
              { label: 'Bed No.', field: 'bedNumber', type: 'text' },
              { label: 'Baby Name', field: 'babyName', type: 'text' },
              { label: 'Gender', field: 'gender', type: 'text' },
            ],
          },
          {
            cells: [
              { label: 'Birth Date', field: 'birthDate', type: 'date' },
              { label: 'Birth Weight', field: 'birthWeight', type: 'number', suffix: 'g' },
              { label: 'Mother Name', field: 'motherName', type: 'text' },
              { label: 'Hospital No.', field: 'hospitalNumber', type: 'text' },
            ],
          },
        ],
      },
    },
    {
      type: 'table',
      title: 'Daily Nursing Records',
      config: {
        columns: [
          { field: 'date', header: 'Date', width: '80px' },
          { field: 'time', header: 'Time', width: '60px' },
          { field: 'temperature', header: 'Temp (°C)', width: '70px' },
          { field: 'weight', header: 'Weight (g)', width: '80px' },
          { field: 'feeding', header: 'Feeding', width: '100px' },
          { field: 'urination', header: 'Urination', width: '70px' },
          { field: 'defecation', header: 'Defecation', width: '70px' },
          { field: 'nurse', header: 'Nurse', width: '80px' },
        ],
        dataField: 'nursingRecords',
      },
    },
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: 'Nurse Signature', field: 'nurseSignature', showDate: true },
          { label: 'Head Nurse Signature', field: 'headNurseSignature', showDate: true },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
  },
  pagination: {
    enabled: true,
    smartPagination: {
      enabled: true,
      minRowHeight: options?.minRowHeight ?? 8,
    },
    display: {
      repeatTableHeaders: options?.repeatTableHeaders ?? true,
      headerOnEachPage: true,
      footerOnEachPage: true,
      signatureOnEachPage: false,
    },
  },
})

// ==================== Sample Data Generation ====================

/**
 * Generate nursing record rows
 * @param count - Number of rows to generate
 * @returns Array of nursing record data
 */
const generateNursingRecords = (count: number): Array<{
  date: string
  time: string
  temperature: string
  weight: number
  feeding: string
  urination: string
  defecation: string
  nurse: string
}> => {
  const nurses = [PLACEHOLDER.staff.nurse, PLACEHOLDER.staff.nurseAlt, PLACEHOLDER.staff.nurseThird]
  const feedings = ['Breastfeeding', 'Formula', 'Breast + Formula']
  const statuses = ['Normal', 'Frequent', 'None']
  
  const records: Array<{
    date: string
    time: string
    temperature: string
    weight: number
    feeding: string
    urination: string
    defecation: string
    nurse: string
  }> = []
  const baseDate = new Date('2024-01-15')
  
  for (let i = 0; i < count; i++) {
    const dayOffset = Math.floor(i / 3)
    const timeSlot = i % 3
    const times = ['08:00', '14:00', '20:00']
    
    const date = new Date(baseDate)
    date.setDate(date.getDate() + dayOffset)
    
    records.push({
      date: date.toISOString().split('T')[0],
      time: times[timeSlot],
      temperature: (36.5 + Math.random() * 0.5).toFixed(1),
      weight: 3250 + dayOffset * 15 + Math.floor(Math.random() * 20),
      feeding: feedings[Math.floor(Math.random() * feedings.length)],
      urination: statuses[Math.floor(Math.random() * 2)],
      defecation: statuses[Math.floor(Math.random() * 2)],
      nurse: nurses[timeSlot],
    })
  }
  
  return records
}

/** Base form data */
const baseData: FormData = {
  roomNumber: PLACEHOLDER.form.roomNumber,
  bedNumber: PLACEHOLDER.form.bedNumber,
  babyName: PLACEHOLDER.patient.babyName,
  gender: 'Male',
  birthDate: '2024-01-10',
  birthWeight: 3250,
  motherName: PLACEHOLDER.patient.name,
  hospitalNumber: PLACEHOLDER.form.hospitalNumber,
  nurseSignature: PLACEHOLDER.staff.nurse,
  headNurseSignature: PLACEHOLDER.staff.headNurse,
}

// ==================== Renderer Functions ====================

/**
 * Create renderer using strategy interface
 * @requirements 5.3 - Use strategy interface for rendering
 */
const createStrategyRenderer = (
  rowCount: number,
  options?: {
    repeatTableHeaders?: boolean
    useContext?: boolean
  }
) => {
  return () => {
    const schema = createSchema({
      repeatTableHeaders: options?.repeatTableHeaders,
    })
    const data = {
      ...baseData,
      nursingRecords: generateNursingRecords(rowCount),
    }

    let html: string

    if (options?.useContext) {
      // Use PaginationContext for strategy selection
      const context = createDefaultPaginationContext()
      html = context.render(schema, data, { isolated: true })
    } else {
      // Use SmartPaginationStrategy directly
      const strategy = new SmartPaginationStrategy()
      html = strategy.render(schema, data, { isolated: true })
    }

    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '900px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#f5f5f5'
    iframe.srcdoc = html
    return iframe
  }
}

// ==================== Meta ====================

const meta: Meta = {
  title: 'Pagination/Smart Pagination',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Smart Pagination

Automatically paginates tables with many rows across multiple pages.

### Features
- **Auto Page Breaks**: Tables with 14+ rows automatically split across pages
- **Header Repetition**: Table headers repeat on each continuation page
- **Strategy Pattern**: Uses unified PaginationStrategy interface

### Usage
\`\`\`typescript
import { SmartPaginationStrategy, createDefaultPaginationContext } from 'medical-print-renderer'

// Direct strategy usage
const strategy = new SmartPaginationStrategy()
if (strategy.shouldApply(schema)) {
  const html = strategy.render(schema, data, { isolated: true })
}

// Or use context for automatic strategy selection
const context = createDefaultPaginationContext()
const html = context.render(schema, data, { isolated: true })
\`\`\`
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj

// ==================== Stories ====================

/**
 * Table with 14 rows - triggers pagination
 * @requirements 5.1 - Show table with 14+ rows auto-paginating
 */
export const With14Rows: Story = {
  name: '14 Rows (2 Pages)',
  render: createStrategyRenderer(14),
  parameters: {
    docs: {
      description: {
        story: 'A table with 14 nursing records automatically splits across 2 pages. Table headers repeat on the second page.',
      },
    },
  },
}

/**
 * Table with 21 rows - 3 pages
 */
export const With21Rows: Story = {
  name: '21 Rows (3 Pages)',
  render: createStrategyRenderer(21),
  parameters: {
    docs: {
      description: {
        story: 'A table with 21 nursing records splits across 3 pages, demonstrating multi-page pagination.',
      },
    },
  },
}

/**
 * Table with 5 rows - no pagination needed
 */
export const With5Rows: Story = {
  name: '5 Rows (Single Page)',
  render: createStrategyRenderer(5),
  parameters: {
    docs: {
      description: {
        story: 'A table with only 5 rows fits on a single page without pagination.',
      },
    },
  },
}

/**
 * Without header repetition
 */
export const WithoutHeaderRepetition: Story = {
  name: 'Without Header Repetition',
  render: createStrategyRenderer(14, { repeatTableHeaders: false }),
  parameters: {
    docs: {
      description: {
        story: 'Table headers do not repeat on continuation pages when repeatTableHeaders is disabled.',
      },
    },
  },
}

/**
 * Using PaginationContext
 */
export const UsingContext: Story = {
  name: 'Using PaginationContext',
  render: createStrategyRenderer(14, { useContext: true }),
  parameters: {
    docs: {
      description: {
        story: 'Uses PaginationContext for automatic strategy selection. The context selects SmartPaginationStrategy based on schema configuration.',
      },
    },
  },
}

/**
 * Large dataset - 30 rows
 */
export const LargeDataset: Story = {
  name: 'Large Dataset (30 Rows)',
  render: createStrategyRenderer(30),
  parameters: {
    docs: {
      description: {
        story: 'A large table with 30 nursing records demonstrates pagination with many pages.',
      },
    },
  },
}
