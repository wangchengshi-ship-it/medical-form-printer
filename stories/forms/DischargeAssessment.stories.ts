import type { Meta, StoryObj } from '@storybook/html'
import { renderToIsolatedHtml } from '../../src/renderer'
import type { PrintSchema, FormData } from '../../src/types/print-schema'
import {
  PLACEHOLDER,
  SAMPLE_DISCHARGE_DATA,
} from '../../src/test-utils/placeholder-data'

// Discharge Assessment Schema
const dischargeAssessmentSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: PLACEHOLDER.hospital.name,
    department: PLACEHOLDER.hospital.department,
    title: 'Maternal Discharge Assessment',
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
              { label: 'Name', field: 'name', type: 'text' },
              { label: 'Age', field: 'age', type: 'number' },
            ],
          },
          {
            cells: [
              { label: 'Admission Date', field: 'admissionDate', type: 'date' },
              { label: 'Discharge Date', field: 'dischargeDate', type: 'date' },
              { label: 'Length of Stay', field: 'stayDays', type: 'number' },
              { label: 'Delivery Method', field: 'deliveryMethod', type: 'text' },
            ],
          },
        ],
      },
    },
    {
      type: 'section-title',
      config: {
        text: 'General Condition at Discharge',
        align: 'left',
        fontSize: 'medium',
        bold: true,
      },
    },
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: 'Temperature', field: 'temperature', type: 'number', suffix: '°C' },
              { label: 'Pulse', field: 'pulse', type: 'number', suffix: '/min' },
              { label: 'Respiration', field: 'respiration', type: 'number', suffix: '/min' },
              { label: 'Blood Pressure', field: 'bloodPressure', type: 'text' },
            ],
          },
          {
            cells: [
              { label: 'Weight', field: 'weight', type: 'number', suffix: 'kg' },
              { label: 'Uterus Recovery', field: 'uterusRecovery', type: 'text' },
              { label: 'Lochia Status', field: 'lochiaStatus', type: 'text' },
              { label: 'Wound Healing', field: 'woundHealing', type: 'text' },
            ],
          },
        ],
      },
    },
    {
      type: 'checkbox-grid',
      title: 'Breast Condition',
      config: {
        field: 'breastCondition',
        columns: 4,
        options: [
          { value: 'soft', label: 'Soft' },
          { value: 'engorged', label: 'Engorged' },
          { value: 'normal', label: 'Normal milk production' },
          { value: 'less', label: 'Low milk production' },
        ],
      },
    },
    {
      type: 'checkbox-grid',
      title: 'Feeding Method',
      config: {
        field: 'feedingMethod',
        columns: 4,
        options: [
          { value: 'breastfeeding', label: 'Exclusive breastfeeding' },
          { value: 'mixed', label: 'Mixed feeding' },
          { value: 'formula', label: 'Formula feeding' },
        ],
      },
    },
    {
      type: 'notes',
      config: {
        content: 'Discharge Instructions:',
        showBorder: false,
      },
    },
    {
      type: 'free-text',
      config: {
        field: 'dischargeGuidance',
        minHeight: '100px',
      },
    },
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: 'Assessment Nurse', field: 'nurseSignature', showDate: true },
          { label: 'Head Nurse', field: 'headNurseSignature', showDate: true },
          { label: 'Patient Signature', field: 'patientSignature', showDate: true },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
    notes: 'This form is completed by the nurse on the day of discharge',
  },
}

// Sample data using placeholder constants
const sampleData: FormData = SAMPLE_DISCHARGE_DATA

const meta: Meta = {
  title: 'PrintRenderer/Forms/DischargeAssessment',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// Create renderer function (using isolated mode with embedded font)
const createRenderer = (data: FormData, watermark?: string) => {
  return () => {
    const html = renderToIsolatedHtml(dischargeAssessmentSchema, data, { watermark })

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

// Mixed feeding
export const MixedFeeding: Story = {
  name: 'Mixed Feeding',
  render: createRenderer({
    ...sampleData,
    feedingMethod: ['mixed'],
    breastCondition: ['engorged', 'less'],
  }),
}
