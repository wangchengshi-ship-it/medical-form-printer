/**
 * @fileoverview Overflow field pagination Storybook stories
 * @module stories/pagination/OverflowPagination
 * @version 2.0.0
 * @author Kiro
 * @created 2026-01-04
 * @modified 2026-01-04
 *
 * @description
 * Demonstrates overflow field pagination functionality: when the baby nursing points
 * field content is too long, it automatically paginates using the strategy interface.
 *
 * @requirements
 * - 5.2: Update existing OverflowPagination.stories.ts to use strategy interface
 * - 5.3: Use unified strategy interface for rendering
 */

import type { Meta, StoryObj } from '@storybook/html'
import {
  OverflowPaginationStrategy,
  createDefaultPaginationContext,
  type PrintSchemaWithPagination,
} from '../../src/pagination/strategies'
import {
  DEFAULT_OVERFLOW_TEXT,
  ENGLISH_OVERFLOW_TEXT,
} from '../../src/pagination/types'
import type { FormData } from '../../src/types/print-schema'
import { PLACEHOLDER } from '../../src/test-utils/placeholder-data'

// ==================== Schema Definition ====================

/**
 * Newborn nursing record schema (with only nursing points as overflow field)
 */
const createSchema = (options?: {
  firstLineChars?: number
  showSignatureOnEachPage?: boolean
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
      type: 'info-grid',
      title: 'Nursing Points',
      config: {
        columns: 1,
        rows: [
          {
            cells: [
              {
                label: 'Baby Nursing Points (continue on next page if needed)',
                field: 'nursingPoints',
                type: 'textarea',
              },
            ],
          },
        ],
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
    overflow: {
      fields: ['nursingPoints'],
      firstLineChars: options?.firstLineChars ?? 60,
    },
    display: {
      signatureOnEachPage: options?.showSignatureOnEachPage ?? false,
    },
  },
})

// ==================== Sample Data ====================

/** Short content (single line, no overflow) */
const shortContent = '1. Breastfeeding guidance, feed on demand'

/**
 * Long content (multiple lines, will overflow to continuation page)
 * First page shows only line 1 + "(continued on next page)" marker
 * Continuation page shows lines 2-8
 */
const longContent = `1. Breastfeeding guidance, feed on demand, each feeding session about 15-20 minutes
2. Umbilical care: Keep dry, disinfect daily with 75% alcohol, observe for redness or discharge
3. Jaundice monitoring: Observe skin color daily, report immediately if yellowing extends to limbs
4. Bathing: Daily warm water bath (37-38°C), ensure skin folds are dried properly
5. Diaper care: Change diapers frequently, apply diaper cream to prevent rash
6. Sleep position: Supine position, avoid soft pillows, maintain room temperature 24-26°C
7. Feeding schedule: Feed every 2-3 hours, observe hunger cues
8. Weight monitoring: Weigh daily, may decrease 5-7% in first week then gradually increase`

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
 * @requirements 5.2, 5.3 - Use strategy interface for rendering
 */
const createStrategyRenderer = (
  nursingPoints: string,
  config?: {
    firstLineChars?: number
    showSignatureOnEachPage?: boolean
    overflowText?: typeof DEFAULT_OVERFLOW_TEXT
    useContext?: boolean
  }
) => {
  return () => {
    const schema = createSchema({
      firstLineChars: config?.firstLineChars,
      showSignatureOnEachPage: config?.showSignatureOnEachPage,
    })
    const data = { ...baseData, nursingPoints }

    let html: string

    if (config?.useContext) {
      // Use PaginationContext for strategy selection
      const context = createDefaultPaginationContext()
      html = context.render(schema, data, {
        isolated: true,
        textConfig: config?.overflowText,
      })
    } else {
      // Use OverflowPaginationStrategy directly
      const strategy = new OverflowPaginationStrategy()
      html = strategy.render(schema, data, {
        isolated: true,
        textConfig: config?.overflowText,
      })
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
  title: 'Pagination/Overflow Field Pagination',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Overflow Field Pagination

When the "Baby Nursing Points" field content has multiple lines, it automatically paginates.

### Pagination Logic
- **First Page**: Shows only the first line + red "(continued on next page)" marker
- **Continuation Page**: Shows the second line and all subsequent content

### Strategy Pattern Usage
\`\`\`typescript
import { OverflowPaginationStrategy, createDefaultPaginationContext } from 'medical-print-renderer'

// Direct strategy usage
const strategy = new OverflowPaginationStrategy()
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

/** Basic Overflow - Nursing points with 8 lines of content */
export const BasicOverflow: Story = {
  name: 'Basic Overflow (8 lines)',
  render: createStrategyRenderer(longContent),
  parameters: {
    docs: {
      description: {
        story: 'Nursing points has 8 lines of content. First page shows only line 1 + "(continued on next page)", continuation page shows lines 2-8.',
      },
    },
  },
}

/** No Overflow - Only one line */
export const NoOverflow: Story = {
  name: 'No Overflow (1 line)',
  render: createStrategyRenderer(shortContent),
  parameters: {
    docs: {
      description: {
        story: 'Nursing points has only 1 line, no overflow, no "(continued on next page)" marker shown.',
      },
    },
  },
}

/** Signature on each page */
export const WithSignatureOnEachPage: Story = {
  name: 'Signature on Each Page',
  render: createStrategyRenderer(longContent, { showSignatureOnEachPage: true }),
  parameters: {
    docs: {
      description: {
        story: 'With showSignatureOnEachPage enabled, continuation pages also show the signature area.',
      },
    },
  },
}

/** English text markers */
export const EnglishText: Story = {
  name: 'English Text Markers',
  render: createStrategyRenderer(longContent, { overflowText: ENGLISH_OVERFLOW_TEXT }),
  parameters: {
    docs: {
      description: {
        story: 'Uses English markers: "(continued on next page)" and "(continued)".',
      },
    },
  },
}

/** Using PaginationContext */
export const UsingContext: Story = {
  name: 'Using PaginationContext',
  render: createStrategyRenderer(longContent, { useContext: true }),
  parameters: {
    docs: {
      description: {
        story: 'Uses PaginationContext for automatic strategy selection. The context selects OverflowPaginationStrategy based on schema configuration.',
      },
    },
  },
}
