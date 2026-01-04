import type { Meta, StoryObj } from '@storybook/html'
import { renderToIsolatedHtml } from '../src/renderer'
import type { PrintSchema, FormData } from '../src/types/print-schema'
import { PLACEHOLDER, SAMPLE_MATERNAL_DATA } from '../src/test-utils/placeholder-data'

// Maternal Admission Assessment sample schema
const maternalAdmissionSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: PLACEHOLDER.hospital.name,
    department: PLACEHOLDER.hospital.department,
    title: 'Maternal Admission Assessment',
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
          {
            cells: [
              { label: 'Delivery Hospital', field: 'deliveryHospital', type: 'text' },
              { label: 'Delivery Date', field: 'deliveryDate', type: 'date' },
              { label: 'Delivery Method', field: 'deliveryMethod', type: 'text' },
              { label: 'Temperature', field: 'temperature', type: 'number' },
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
        fields: [{ label: 'Assessment Nurse', field: 'nurseSignature', showDate: true }],
      },
    },
  ],
  footer: {
    showPageNumber: true,
    notes: 'This form is completed by the nurse within 24 hours of admission',
  },
}

// Scaled down version (95% size)
const maternalAdmissionSchemaScaled: PrintSchema = {
  ...maternalAdmissionSchema,
  baseUnit: 0.95,
}

const maternalAdmissionData: FormData = {
  ...SAMPLE_MATERNAL_DATA,
  ethnicity: 'Not specified',
}

// Newborn Nursing Record sample schema
const newbornNursingSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'landscape',
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
              { label: 'Mother Name', field: 'motherName', type: 'text' },
              { label: 'Room No.', field: 'roomNumber', type: 'text' },
              { label: 'Gender', field: 'gender', type: 'text' },
              { label: 'Birth Date', field: 'birthDate', type: 'date' },
            ],
          },
        ],
      },
    },
    {
      type: 'table',
      title: 'Daily Nursing Records',
      config: {
        dataField: 'dailyRecords',
        showRowNumber: true,
        columns: [
          { header: 'Date', field: 'date', type: 'date', width: '80px' },
          { header: 'Days Old', field: 'daysOld', type: 'number', width: '60px' },
          { header: 'Weight (g)', field: 'weight', type: 'number', width: '70px' },
          { header: 'Temp (°C)', field: 'temperature', type: 'number', width: '70px' },
          { header: 'Umbilical', field: 'umbilicalCare', type: 'checkbox', width: '50px' },
          { header: 'Bath', field: 'bath', type: 'checkbox', width: '50px' },
          { header: 'Swimming', field: 'swimming', type: 'checkbox', width: '50px' },
          { header: 'Massage', field: 'massage', type: 'checkbox', width: '50px' },
          { header: 'Notes', field: 'notes', type: 'text' },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
  },
}

const newbornNursingData: FormData = {
  motherName: PLACEHOLDER.patient.name,
  roomNumber: PLACEHOLDER.form.roomNumber,
  gender: 'Male',
  birthDate: '2024-01-10',
  dailyRecords: [
    {
      date: '2024-01-15',
      daysOld: 5,
      weight: 3200,
      temperature: 36.8,
      umbilicalCare: true,
      bath: true,
      swimming: false,
      massage: true,
      notes: 'Good condition',
    },
    {
      date: '2024-01-16',
      daysOld: 6,
      weight: 3250,
      temperature: 36.7,
      umbilicalCare: true,
      bath: true,
      swimming: true,
      massage: true,
      notes: '',
    },
    {
      date: '2024-01-17',
      daysOld: 7,
      weight: 3300,
      temperature: 36.6,
      umbilicalCare: true,
      bath: true,
      swimming: true,
      massage: true,
      notes: 'Umbilical cord fell off',
    },
  ],
}

// Story configuration
const meta: Meta = {
  title: 'PrintRenderer/Form Rendering',
  tags: ['autodocs'],
  argTypes: {
    watermark: {
      control: 'text',
      description: 'Watermark text',
    },
  },
}

export default meta

type Story = StoryObj

// Create renderer function (using isolated mode with embedded font)
const createRenderer = (schema: PrintSchema, data: FormData) => {
  return (args: { watermark?: string }) => {
    // Use isolated renderer for consistent font rendering
    const html = renderToIsolatedHtml(schema, data, {
      watermark: args.watermark,
    })

    // Create container
    const container = document.createElement('div')
    container.style.width = '100%'
    container.style.height = '800px'
    container.style.overflow = 'auto'
    container.style.background = '#f5f5f5'
    container.style.padding = '20px'
    container.style.boxSizing = 'border-box'

    // Use iframe for complete style isolation
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    iframe.srcdoc = html

    container.appendChild(iframe)
    return container
  }
}

// Maternal Admission Assessment
export const MaternalAdmission: Story = {
  render: createRenderer(maternalAdmissionSchema, maternalAdmissionData),
  args: {
    watermark: '',
  },
}

// Maternal Admission Assessment (with watermark)
export const MaternalAdmissionWithWatermark: Story = {
  render: createRenderer(maternalAdmissionSchema, maternalAdmissionData),
  args: {
    watermark: PLACEHOLDER.watermark.internal,
  },
}

// Newborn Nursing Record
export const NewbornNursing: Story = {
  render: createRenderer(newbornNursingSchema, newbornNursingData),
  args: {
    watermark: '',
  },
}

// Empty form
export const EmptyForm: Story = {
  render: createRenderer(maternalAdmissionSchema, {}),
  args: {
    watermark: '',
  },
}

// Scaled down form (95% size) - useful for dense content
export const ScaledDownForm: Story = {
  render: createRenderer(maternalAdmissionSchemaScaled, maternalAdmissionData),
  args: {
    watermark: '',
  },
}

// Scaled up form (110% size)
export const ScaledUpForm: Story = {
  render: createRenderer({ ...maternalAdmissionSchema, baseUnit: 1.1 }, maternalAdmissionData),
  args: {
    watermark: '',
  },
}
