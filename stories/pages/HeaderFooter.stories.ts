/**
 * @fileoverview Header and Footer Storybook stories
 * @module stories/pages/HeaderFooter
 * @version 1.1.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-05
 *
 * @description
 * Demonstrates header and footer configurations for print pages.
 * Includes examples of page number display, notes, and pagination with footer.
 *
 * @requirements
 * - Header: hospital name, department, title, optional logo
 * - Footer: page number, notes section
 * - Footer measurement: correct height calculation for pagination
 */

import type { Meta, StoryObj } from '@storybook/html'
import { renderToIsolatedHtml } from '../../src/renderer'
import type { PrintSchema } from '../../src/types/print-schema'
import { PLACEHOLDER } from '../../src/test-utils/placeholder-data'

const baseSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: PLACEHOLDER.hospital.name,
    department: PLACEHOLDER.hospital.department,
    title: 'Test Form',
  },
  sections: [
    {
      type: 'notes',
      config: {
        content: 'This is the form content area',
        showBorder: true,
      },
    },
  ],
  footer: {
    showPageNumber: true,
    notes: 'Footer notes information',
  },
}

const meta: Meta = {
  title: 'PrintRenderer/Pages/HeaderFooter',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Header and Footer

Configure page headers and footers for print documents.

### Page Structure

\`\`\`
┌─────────────────────────────────────┐
│           Header                    │
│   Hospital, Department, Title       │
├─────────────────────────────────────┤
│           Body                      │
│   info-grid, table, notes, etc.     │
├─────────────────────────────────────┤
│           Footer                    │
│   - Signature Area (optional)       │
│   - Page Number + Notes             │
└─────────────────────────────────────┘
\`\`\`

### Header Options
- **hospital**: Hospital name (required)
- **department**: Department name (optional)
- **title**: Form title (required)
- **showLogo**: Show logo placeholder (optional)
- **logoUrl**: Logo image URL (optional)

### Footer Options
Footer consists of two parts:
1. **Signature Area** - Optional signature fields (\`signature-area\` section)
2. **Page Number & Notes** - Configured via \`schema.footer\`:
   - **showPageNumber**: Display page numbers (e.g., "Page 1 of 2")
   - **notes**: Footer notes text

### Pagination Behavior
- **signatureOnEachPage: true** - Signature appears on every page
- **signatureOnEachPage: false** - Signature only on the last page
- Footer (page number + notes) always appears on each page when enabled
        `,
      },
    },
  },
}

export default meta

type Story = StoryObj

// 创建渲染函数（使用隔离模式，强制使用内嵌思源宋体）
const createRenderer = (schema: PrintSchema) => {
  return () => {
    const html = renderToIsolatedHtml(schema, {})
    
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '600px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    iframe.srcdoc = html
    
    return iframe
  }
}

// 完整页眉页脚
export const FullHeaderFooter: Story = {
  name: 'Full Header & Footer',
  render: createRenderer(baseSchema),
  parameters: {
    docs: {
      description: {
        story: 'Complete header with hospital, department, and title. Footer with page number and notes.',
      },
    },
  },
}

// 仅医院名称
export const HospitalOnly: Story = {
  name: 'Hospital Only',
  render: () => {
    const schema: PrintSchema = {
      ...baseSchema,
      header: {
        hospital: PLACEHOLDER.hospital.name,
        title: 'Test Form',
      },
    }
    return createRenderer(schema)()
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with only hospital name and title (no department).',
      },
    },
  },
}

// 带 Logo
export const WithLogo: Story = {
  name: 'With Logo (Placeholder)',
  render: () => {
    const schema: PrintSchema = {
      ...baseSchema,
      header: {
        ...baseSchema.header,
        showLogo: true,
        logoUrl: 'https://via.placeholder.com/100x50?text=Logo',
      },
    }
    return createRenderer(schema)()
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with logo placeholder image.',
      },
    },
  },
}

// 无页脚
export const NoFooter: Story = {
  name: 'No Footer',
  render: () => {
    const schema: PrintSchema = {
      ...baseSchema,
      footer: undefined,
    }
    return createRenderer(schema)()
  },
  parameters: {
    docs: {
      description: {
        story: 'Page without footer section.',
      },
    },
  },
}

// 仅页码
export const PageNumberOnly: Story = {
  name: 'Page Number Only',
  render: () => {
    const schema: PrintSchema = {
      ...baseSchema,
      footer: {
        showPageNumber: true,
      },
    }
    return createRenderer(schema)()
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer with only page number display.',
      },
    },
  },
}

// 仅备注
export const NotesOnly: Story = {
  name: 'Notes Only',
  render: () => {
    const schema: PrintSchema = {
      ...baseSchema,
      footer: {
        showPageNumber: false,
        notes: 'This form is for internal use only. Do not distribute.',
      },
    }
    return createRenderer(schema)()
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer with only notes text (no page number).',
      },
    },
  },
}

// 带签名区域
export const WithSignature: Story = {
  name: 'With Signature Area',
  render: () => {
    const schema: PrintSchema = {
      ...baseSchema,
      sections: [
        {
          type: 'info-grid',
          config: {
            columns: 4,
            rows: [
              {
                cells: [
                  { label: 'Patient Name', field: 'patientName', type: 'text' },
                  { label: 'Room No.', field: 'roomNumber', type: 'text' },
                  { label: 'Bed No.', field: 'bedNumber', type: 'text' },
                  { label: 'Date', field: 'date', type: 'date' },
                ],
              },
            ],
          },
        },
        {
          type: 'notes',
          config: {
            content: 'Patient assessment notes and observations go here.',
            showBorder: true,
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
        notes: 'This form must be signed by both nurse and head nurse.',
      },
    }
    const data = {
      patientName: PLACEHOLDER.patient.name,
      roomNumber: PLACEHOLDER.form.roomNumber,
      bedNumber: PLACEHOLDER.form.bedNumber,
      date: '2026-01-05',
      nurseSignature: PLACEHOLDER.staff.nurse,
      headNurseSignature: PLACEHOLDER.staff.headNurse,
    }
    const html = renderToIsolatedHtml(schema, data)
    
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '600px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    iframe.srcdoc = html
    
    return iframe
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete form with header, content, signature area, and footer with page number.',
      },
    },
  },
}

// 完整表单示例
export const CompleteForm: Story = {
  name: 'Complete Form Example',
  render: () => {
    const schema: PrintSchema = {
      pageSize: '16K',
      orientation: 'portrait',
      header: {
        hospital: PLACEHOLDER.hospital.name,
        department: PLACEHOLDER.hospital.department,
        title: 'Patient Assessment Form',
      },
      sections: [
        {
          type: 'info-grid',
          config: {
            columns: 4,
            rows: [
              {
                cells: [
                  { label: 'Patient Name', field: 'patientName', type: 'text' },
                  { label: 'Gender', field: 'gender', type: 'text' },
                  { label: 'Age', field: 'age', type: 'number', suffix: 'years' },
                  { label: 'Hospital No.', field: 'hospitalNumber', type: 'text' },
                ],
              },
              {
                cells: [
                  { label: 'Room No.', field: 'roomNumber', type: 'text' },
                  { label: 'Bed No.', field: 'bedNumber', type: 'text' },
                  { label: 'Admission Date', field: 'admissionDate', type: 'date' },
                  { label: 'Attending Doctor', field: 'doctor', type: 'text' },
                ],
              },
            ],
          },
        },
        {
          type: 'notes',
          title: 'Assessment Notes',
          config: {
            content: 'Patient is in stable condition. Vital signs are within normal range. Continue current treatment plan.',
            showBorder: true,
          },
        },
        {
          type: 'signature-area',
          config: {
            fields: [
              { label: 'Nurse', field: 'nurseSignature', showDate: true },
              { label: 'Head Nurse', field: 'headNurseSignature', showDate: true },
              { label: 'Doctor', field: 'doctorSignature', showDate: true },
            ],
          },
        },
      ],
      footer: {
        showPageNumber: true,
        notes: 'Confidential medical record. Handle with care.',
      },
    }
    const data = {
      patientName: PLACEHOLDER.patient.name,
      gender: 'Female',
      age: 28,
      hospitalNumber: PLACEHOLDER.form.hospitalNumber,
      roomNumber: PLACEHOLDER.form.roomNumber,
      bedNumber: PLACEHOLDER.form.bedNumber,
      admissionDate: '2026-01-03',
      doctor: PLACEHOLDER.staff.doctor,
      nurseSignature: PLACEHOLDER.staff.nurse,
      headNurseSignature: PLACEHOLDER.staff.headNurse,
      doctorSignature: PLACEHOLDER.staff.doctor,
    }
    const html = renderToIsolatedHtml(schema, data)
    
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '700px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    iframe.srcdoc = html
    
    return iframe
  },
  parameters: {
    docs: {
      description: {
        story: 'A complete medical form demonstrating all page elements: header with hospital info, patient info grid, notes section, signature area with multiple signers, and footer with page number and notes.',
      },
    },
  },
}
