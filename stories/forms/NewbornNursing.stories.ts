import type { Meta, StoryObj } from '@storybook/html'
import { renderToIsolatedHtml } from '../../src/renderer'
import type { PrintSchema, FormData } from '../../src/types/print-schema'
import {
  PLACEHOLDER,
  SAMPLE_NEWBORN_DATA,
} from '../../src/test-utils/placeholder-data'

// Newborn Nursing Record Schema
const newbornNursingSchema: PrintSchema = {
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
      title: 'Nursing Records',
      config: {
        columns: [
          { field: 'date', header: 'Date', width: '80px' },
          { field: 'time', header: 'Time', width: '60px' },
          { field: 'temperature', header: 'Temp (°C)', width: '70px' },
          { field: 'weight', header: 'Weight (g)', width: '70px' },
          { field: 'feeding', header: 'Feeding', width: '100px' },
          { field: 'urination', header: 'Urination', width: '50px' },
          { field: 'defecation', header: 'Defecation', width: '50px' },
          { field: 'skinCondition', header: 'Skin', width: '100px' },
          { field: 'umbilicalCord', header: 'Umbilical', width: '100px' },
          { field: 'nurse', header: 'Nurse', width: '80px' },
        ],
        dataField: 'nursingRecords',
      },
    },
    {
      type: 'checkbox-grid',
      title: 'Special Conditions',
      config: {
        field: 'specialConditions',
        columns: 4,
        options: [
          { value: 'none', label: 'None' },
          { value: 'jaundice', label: 'Jaundice' },
          { value: 'rash', label: 'Rash' },
          { value: 'fever', label: 'Fever' },
          { value: 'vomiting', label: 'Vomiting' },
          { value: 'diarrhea', label: 'Diarrhea' },
          { value: 'other', label: 'Other', hasInput: true, inputField: 'specialConditionsOther' },
        ],
      },
    },
    {
      type: 'notes',
      config: {
        content: 'Nursing Notes:',
        showBorder: false,
      },
    },
    {
      type: 'free-text',
      config: {
        field: 'nursingNotes',
        minHeight: '60px',
      },
    },
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: 'Primary Nurse', field: 'nurseSignature', showDate: true },
          { label: 'Head Nurse', field: 'headNurseSignature', showDate: true },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
    notes: 'This form is completed by the nurse daily',
  },
}

// Sample data using placeholder constants
const sampleData: FormData = SAMPLE_NEWBORN_DATA

const meta: Meta = {
  title: 'PrintRenderer/Forms/NewbornNursing',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// Create renderer function (using isolated mode with embedded font)
const createRenderer = (data: FormData, watermark?: string) => {
  return () => {
    const html = renderToIsolatedHtml(newbornNursingSchema, data, { watermark })

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

// With special conditions
export const WithSpecialConditions: Story = {
  name: 'With Special Conditions',
  render: createRenderer({
    ...sampleData,
    specialConditions: ['jaundice', 'other'],
    specialConditionsOther: 'Mild diaper rash',
    nursingNotes:
      'Newborn showing mild jaundice, doctor notified. Mild diaper rash observed, enhanced care provided.',
  }),
}

// Multiple records
export const MultipleRecords: Story = {
  name: 'Multiple Records',
  render: createRenderer({
    ...sampleData,
    nursingRecords: [
      ...(sampleData.nursingRecords as object[]),
      {
        date: '2024-01-16',
        time: '08:00',
        temperature: 36.6,
        weight: 3320,
        feeding: 'Breastfeeding',
        urination: 'Normal',
        defecation: 'Normal',
        skinCondition: 'Good',
        umbilicalCord: 'Dry',
        nurse: PLACEHOLDER.staff.nurse,
      },
      {
        date: '2024-01-16',
        time: '14:00',
        temperature: 36.7,
        weight: 3325,
        feeding: 'Breastfeeding',
        urination: 'Normal',
        defecation: 'Normal',
        skinCondition: 'Good',
        umbilicalCord: 'Dry',
        nurse: PLACEHOLDER.staff.nurseAlt,
      },
    ],
  }),
}
