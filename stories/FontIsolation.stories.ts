/**
 * @fileoverview Font isolation Storybook examples
 * @module stories/FontIsolation
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * Storybook examples demonstrating font isolation features, including:
 * - Isolated rendering mode
 * - Font loading status display
 * - Isolation from external styles
 *
 * @requirements
 * - Requirements 4.1: Browser preview matches PDF generation output
 */

import type { Meta, StoryObj } from '@storybook/html'
import {
  renderToIsolatedHtml,
  renderToIsolatedFragment,
  isFontLoaded,
  waitForFonts,
  FONT_FAMILY,
  CSS_NAMESPACE,
  ISOLATION_ROOT_CLASS,
} from '../src'
import type { PrintSchema, FormData } from '../src/types/print-schema'
import { PLACEHOLDER } from '../src/test-utils/placeholder-data'

// ==================== Sample Data ====================

const sampleSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: PLACEHOLDER.hospital.name,
    department: PLACEHOLDER.hospital.department,
    title: 'Font Isolation Test Form',
  },
  sections: [
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: 'Room', field: 'roomNumber', type: 'text' },
              { label: 'Hospital No.', field: 'hospitalNumber', type: 'text' },
              { label: 'Admission Time', field: 'admissionTime', type: 'date' },
              { label: 'Name', field: 'name', type: 'text' },
            ],
          },
          {
            cells: [
              { label: 'Age', field: 'age', type: 'number' },
              { label: 'Blood Type', field: 'bloodType', type: 'text' },
              { label: 'Ethnicity', field: 'ethnicity', type: 'text' },
              { label: 'Birthplace', field: 'birthplace', type: 'text' },
            ],
          },
        ],
      },
    },
    {
      type: 'checkbox-grid',
      title: 'Allergy History',
      config: {
        field: 'allergies',
        columns: 4,
        options: [
          { value: 'none', label: 'None' },
          { value: 'penicillin', label: 'Penicillin' },
          { value: 'sulfa', label: 'Sulfonamides' },
          { value: 'other', label: 'Other', hasInput: true, inputField: 'allergyOther' },
        ],
      },
    },
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: 'Assessment Nurse', field: 'nurseSignature', showDate: true },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
    notes: 'This form is filled by nurses within 24 hours of admission',
  },
}

const sampleData: FormData = {
  roomNumber: '301',
  hospitalNumber: '2024010001',
  admissionTime: '2024-01-15T10:30:00',
  name: PLACEHOLDER.patient.name,
  age: 28,
  bloodType: 'A',
  ethnicity: 'Asian',
  birthplace: PLACEHOLDER.location.city,
  allergies: ['none'],
  nurseSignature: PLACEHOLDER.staff.nurse,
}

// ==================== Story Configuration ====================

const meta: Meta = {
  title: 'FontIsolation/Font Isolation',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Font Isolation Feature

This component demonstrates the font isolation features of the \`medical-form-printer\` library:

- **Forced Font Binding**: All text uses embedded Source Han Serif SC (${FONT_FAMILY})
- **CSS Isolation**: Uses \`.${ISOLATION_ROOT_CLASS}\` container for style isolation
- **Namespace**: All class names use \`${CSS_NAMESPACE}-\` prefix

### Usage

\`\`\`typescript
import { renderToIsolatedHtml, waitForFonts } from 'medical-form-printer'

// Wait for font to load
await waitForFonts({ timeout: 5000 })

// Render isolated HTML
const html = renderToIsolatedHtml(schema, data)
\`\`\`
        `,
      },
    },
  },
}

export default meta

type Story = StoryObj

// ==================== Helper Functions ====================

/**
 * Create font loading status indicator
 */
function createFontStatusIndicator(): HTMLDivElement {
  const indicator = document.createElement('div')
  indicator.style.cssText = `
    padding: 12px 16px;
    margin-bottom: 16px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  `

  const updateStatus = () => {
    const loaded = isFontLoaded()
    indicator.style.backgroundColor = loaded ? '#d4edda' : '#fff3cd'
    indicator.style.border = loaded ? '1px solid #c3e6cb' : '1px solid #ffeeba'
    indicator.style.color = loaded ? '#155724' : '#856404'
    indicator.innerHTML = `
      <span style="font-size: 18px;">${loaded ? '✓' : '⏳'}</span>
      <span>
        <strong>Font Status:</strong> ${loaded ? 'Loaded' : 'Loading...'}
        <br>
        <small>Font: ${FONT_FAMILY}</small>
      </span>
    `
  }

  updateStatus()

  // If font not loaded, wait for it and update status
  if (!isFontLoaded()) {
    waitForFonts({ timeout: 10000 })
      .then(() => updateStatus())
      .catch(() => {
        indicator.style.backgroundColor = '#f8d7da'
        indicator.style.border = '1px solid #f5c6cb'
        indicator.style.color = '#721c24'
        indicator.innerHTML = `
          <span style="font-size: 18px;">✗</span>
          <span>
            <strong>Font Status:</strong> Load Failed
            <br>
            <small>Please check network connection</small>
          </span>
        `
      })
  }

  return indicator
}

/**
 * Create isolated renderer (full HTML document)
 */
function createIsolatedRenderer(schema: PrintSchema, data: FormData) {
  return (args: { watermark?: string; showFontStatus?: boolean }) => {
    const container = document.createElement('div')

    // Font status indicator
    if (args.showFontStatus) {
      container.appendChild(createFontStatusIndicator())
    }

    // Render isolated HTML
    const html = renderToIsolatedHtml(schema, data, {
      watermark: args.watermark,
    })

    // Use iframe to display full HTML document
    const iframe = document.createElement('iframe')
    iframe.style.cssText = `
      width: 100%;
      height: 800px;
      border: 1px solid #ccc;
      background: #fff;
      border-radius: 4px;
    `
    iframe.srcdoc = html

    container.appendChild(iframe)
    return container
  }
}

/**
 * Create fragment renderer (embedded)
 */
function createFragmentRenderer(schema: PrintSchema, data: FormData) {
  return (args: { watermark?: string; showFontStatus?: boolean; externalStyles?: boolean }) => {
    const container = document.createElement('div')

    // Font status indicator
    if (args.showFontStatus) {
      container.appendChild(createFontStatusIndicator())
    }

    // External style interference test
    if (args.externalStyles) {
      const styleInfo = document.createElement('div')
      styleInfo.style.cssText = `
        padding: 12px 16px;
        margin-bottom: 16px;
        border-radius: 8px;
        background-color: #e7f3ff;
        border: 1px solid #b6d4fe;
        color: #084298;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
      `
      styleInfo.innerHTML = `
        <strong>⚠️ External Style Interference Test</strong>
        <br>
        <small>External CSS rules injected, but isolated container styles are unaffected</small>
      `
      container.appendChild(styleInfo)

      // Inject interference styles
      const externalStyle = document.createElement('style')
      externalStyle.textContent = `
        /* External style interference test */
        * { font-family: Comic Sans MS, cursive !important; }
        div { color: red !important; }
        table { border: 5px solid purple !important; }
        .print-page { background: yellow !important; }
      `
      container.appendChild(externalStyle)
    }

    // Render isolated HTML fragment
    const fragment = renderToIsolatedFragment(schema, data, {
      watermark: args.watermark,
    })

    // Create wrapper container
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: auto;
      max-height: 800px;
    `
    wrapper.innerHTML = fragment

    container.appendChild(wrapper)
    return container
  }
}

// ==================== Stories ====================

/**
 * Isolated Rendering - Full HTML Document
 * Uses iframe to display complete isolated HTML document
 */
export const IsolatedHtml: Story = {
  name: 'Isolated Rendering (Full Document)',
  render: createIsolatedRenderer(sampleSchema, sampleData),
  args: {
    watermark: '',
    showFontStatus: true,
  },
  argTypes: {
    watermark: {
      control: 'text',
      description: 'Watermark text',
    },
    showFontStatus: {
      control: 'boolean',
      description: 'Show font loading status',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Uses `renderToIsolatedHtml()` to generate complete HTML document, suitable for PDF generation or standalone preview.',
      },
    },
  },
}

/**
 * Isolated Rendering - HTML Fragment
 * Directly embedded isolated fragment
 */
export const IsolatedFragment: Story = {
  name: 'Isolated Rendering (HTML Fragment)',
  render: createFragmentRenderer(sampleSchema, sampleData),
  args: {
    watermark: '',
    showFontStatus: true,
    externalStyles: false,
  },
  argTypes: {
    watermark: {
      control: 'text',
      description: 'Watermark text',
    },
    showFontStatus: {
      control: 'boolean',
      description: 'Show font loading status',
    },
    externalStyles: {
      control: 'boolean',
      description: 'Enable external style interference test',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Uses `renderToIsolatedFragment()` to generate HTML fragment, suitable for embedding in existing pages.',
      },
    },
  },
}

/**
 * Style Isolation Test
 * Verifies external styles do not affect isolated container content
 */
export const StyleIsolationTest: Story = {
  name: 'Style Isolation Test',
  render: createFragmentRenderer(sampleSchema, sampleData),
  args: {
    watermark: '',
    showFontStatus: true,
    externalStyles: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
Enable external style interference test to verify CSS isolation effect.

Externally injected style rules:
- \`* { font-family: Comic Sans MS !important; }\`
- \`div { color: red !important; }\`
- \`table { border: 5px solid purple !important; }\`

Content inside the isolated container should not be affected by these rules.
        `,
      },
    },
  },
}

/**
 * Isolated Rendering with Watermark
 */
export const IsolatedWithWatermark: Story = {
  name: 'Isolated Rendering with Watermark',
  render: createIsolatedRenderer(sampleSchema, sampleData),
  args: {
    watermark: 'Internal Use Only',
    showFontStatus: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates isolated rendering with watermark effect.',
      },
    },
  },
}

/**
 * Font Loading API Demo
 */
export const FontLoadingApi: Story = {
  name: 'Font Loading API',
  render: () => {
    const container = document.createElement('div')
    container.style.cssText = `
      font-family: system-ui, -apple-system, sans-serif;
      padding: 20px;
    `

    container.innerHTML = `
      <h2 style="margin-top: 0;">Font Loading API Demo</h2>
      
      <div style="margin-bottom: 20px;">
        <h3>1. Synchronous Font Status Check</h3>
        <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;">
import { isFontLoaded } from 'medical-form-printer'

const loaded = isFontLoaded()
console.log('Font loaded:', loaded) // ${isFontLoaded()}
        </pre>
      </div>

      <div style="margin-bottom: 20px;">
        <h3>2. Async Wait for Font Loading</h3>
        <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;">
import { waitForFonts, FontLoadError } from 'medical-form-printer'

try {
  await waitForFonts({ timeout: 5000 })
  console.log('Font loaded successfully')
} catch (error) {
  if (error instanceof FontLoadError) {
    console.error('Font loading failed:', error.message)
  }
}
        </pre>
      </div>

      <div style="margin-bottom: 20px;">
        <h3>3. Font Configuration Constants</h3>
        <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;">
import { FONT_FAMILY, CSS_NAMESPACE, ISOLATION_ROOT_CLASS } from 'medical-form-printer'

FONT_FAMILY         // '${FONT_FAMILY}'
CSS_NAMESPACE       // '${CSS_NAMESPACE}'
ISOLATION_ROOT_CLASS // '${ISOLATION_ROOT_CLASS}'
        </pre>
      </div>

      <div id="font-status-demo"></div>
    `

    // Add live font status
    const statusDemo = container.querySelector('#font-status-demo')
    if (statusDemo) {
      statusDemo.appendChild(createFontStatusIndicator())
    }

    return container
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates font loading related API usage.',
      },
    },
  },
}
