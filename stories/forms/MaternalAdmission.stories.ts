import type { Meta, StoryObj } from '@storybook/html'
import { renderToIsolatedHtml } from '../../src/renderer'
import type { PrintSchema, FormData } from '../../src/types/print-schema'
import {
  PLACEHOLDER,
  SAMPLE_MATERNAL_DATA,
} from '../../src/test-utils/placeholder-data'

// Maternal Admission Assessment Schema
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
          {
            cells: [
              { label: 'Pulse', field: 'pulse', type: 'number' },
              { label: 'Respiration', field: 'respiration', type: 'number' },
              { label: 'Blood Pressure', field: 'bloodPressure', type: 'text' },
              { label: 'Weight', field: 'weight', type: 'number' },
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
      type: 'checkbox-grid',
      title: 'Medical History',
      config: {
        field: 'medicalHistory',
        columns: 4,
        options: [
          { value: 'none', label: 'None' },
          { value: 'hypertension', label: 'Hypertension' },
          { value: 'diabetes', label: 'Diabetes' },
          { value: 'heart', label: 'Heart Disease' },
          { value: 'hepatitis', label: 'Hepatitis' },
          { value: 'tuberculosis', label: 'Tuberculosis' },
          { value: 'other', label: 'Other', hasInput: true, inputField: 'medicalHistoryOther' },
        ],
      },
    },
    {
      type: 'notes',
      config: {
        content: 'Admission Assessment:',
        showBorder: false,
      },
    },
    {
      type: 'free-text',
      config: {
        field: 'assessment',
        minHeight: '80px',
      },
    },
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: 'Assessment Nurse', field: 'nurseSignature', showDate: true },
          { label: 'Head Nurse', field: 'headNurseSignature', showDate: true },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
    notes: 'This form is completed by the nurse within 24 hours of admission',
  },
}

// Sample data using placeholder constants
const sampleData: FormData = {
  ...SAMPLE_MATERNAL_DATA,
  ethnicity: 'Not specified',
}

const meta: Meta = {
  title: 'PrintRenderer/Forms/MaternalAdmission',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// Create renderer function (using isolated mode with embedded font)
const createRenderer = (data: FormData, watermark?: string) => {
  return () => {
    const html = renderToIsolatedHtml(maternalAdmissionSchema, data, { watermark })

    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '800px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    iframe.srcdoc = html

    return iframe
  }
}

// Full data
export const FullData: Story = {
  name: 'Full Data',
  render: createRenderer(sampleData),
}

// Empty data
export const EmptyData: Story = {
  name: 'Empty Data',
  render: createRenderer({}),
}

// With watermark
export const WithWatermark: Story = {
  name: 'With Watermark',
  render: createRenderer(sampleData, PLACEHOLDER.watermark.internal),
}

// With allergies
export const WithAllergies: Story = {
  name: 'With Allergies',
  render: createRenderer({
    ...sampleData,
    allergies: ['penicillin', 'other'],
    allergyOther: 'Seafood',
  }),
}

// With medical history
export const WithMedicalHistory: Story = {
  name: 'With Medical History',
  render: createRenderer({
    ...sampleData,
    medicalHistory: ['hypertension', 'diabetes'],
  }),
}
