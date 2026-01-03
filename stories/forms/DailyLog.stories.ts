import type { Meta, StoryObj } from '@storybook/html'
import { renderToIsolatedHtml } from '../../src/renderer'
import type { PrintSchema, FormData } from '../../src/types/print-schema'
import {
  PLACEHOLDER,
  SAMPLE_DAILY_LOG_DATA,
} from '../../src/test-utils/placeholder-data'

// Daily Nursing Log Schema
const dailyLogSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: PLACEHOLDER.hospital.name,
    department: PLACEHOLDER.hospital.department,
    title: 'Maternal Daily Nursing Record',
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
              { label: 'Name', field: 'name', type: 'text' },
              { label: 'Hospital No.', field: 'hospitalNumber', type: 'text' },
            ],
          },
          {
            cells: [
              { label: 'Postpartum Days', field: 'postpartumDays', type: 'number' },
              { label: 'Delivery Method', field: 'deliveryMethod', type: 'text' },
              { label: 'Record Date', field: 'recordDate', type: 'date' },
              { label: '', field: '', type: 'text' },
            ],
          },
        ],
      },
    },
    {
      type: 'table',
      title: 'Vital Signs Record',
      config: {
        columns: [
          { field: 'time', header: 'Time', width: '80px' },
          { field: 'temperature', header: 'Temp (°C)', width: '80px' },
          { field: 'pulse', header: 'Pulse (/min)', width: '90px' },
          { field: 'respiration', header: 'Resp (/min)', width: '90px' },
          { field: 'bloodPressure', header: 'BP (mmHg)', width: '100px' },
          { field: 'nurse', header: 'Nurse', width: '80px' },
        ],
        dataField: 'vitalSigns',
      },
    },
    {
      type: 'checkbox-grid',
      title: 'Lochia Status',
      config: {
        field: 'lochia',
        columns: 4,
        options: [
          { value: 'red', label: 'Bloody' },
          { value: 'serous', label: 'Serous' },
          { value: 'white', label: 'White' },
          { value: 'normal', label: 'Normal amount' },
          { value: 'less', label: 'Minimal' },
          { value: 'more', label: 'Heavy' },
          { value: 'odor', label: 'Odorous' },
          { value: 'noOdor', label: 'No odor' },
        ],
      },
    },
    {
      type: 'checkbox-grid',
      title: 'Breast Condition',
      config: {
        field: 'breast',
        columns: 4,
        options: [
          { value: 'soft', label: 'Soft' },
          { value: 'engorged', label: 'Engorged' },
          { value: 'hard', label: 'Lumps' },
          { value: 'cracked', label: 'Cracked' },
          { value: 'normal', label: 'Normal milk' },
          { value: 'less', label: 'Low milk' },
          { value: 'more', label: 'High milk' },
          { value: 'blocked', label: 'Blocked ducts' },
        ],
      },
    },
    {
      type: 'checkbox-grid',
      title: 'Incision/Wound Status',
      config: {
        field: 'wound',
        columns: 4,
        options: [
          { value: 'healing', label: 'Healing well' },
          { value: 'redness', label: 'Redness' },
          { value: 'discharge', label: 'Discharge' },
          { value: 'pain', label: 'Pain' },
          { value: 'infection', label: 'Infection' },
          { value: 'other', label: 'Other', hasInput: true, inputField: 'woundOther' },
        ],
      },
    },
    {
      type: 'notes',
      config: {
        content: 'Nursing Interventions and Outcomes:',
        showBorder: false,
      },
    },
    {
      type: 'free-text',
      config: {
        field: 'nursingMeasures',
        minHeight: '80px',
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
const sampleData: FormData = SAMPLE_DAILY_LOG_DATA

const meta: Meta = {
  title: 'PrintRenderer/Forms/DailyLog',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// Create renderer function (using isolated mode with embedded font)
const createRenderer = (data: FormData, watermark?: string) => {
  return () => {
    const html = renderToIsolatedHtml(dailyLogSchema, data, { watermark })

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

// Postpartum day 1
export const PostpartumDay1: Story = {
  name: 'Postpartum Day 1',
  render: createRenderer({
    ...sampleData,
    postpartumDays: 1,
    lochia: ['red', 'more', 'noOdor'],
    breast: ['engorged', 'less'],
    wound: ['healing', 'pain'],
    nursingMeasures:
      '1. Post-op day 1, closely monitoring vital signs\n2. Encouraged early ambulation\n3. Incision pain managed with analgesics\n4. Breast engorgement, guided massage for milk flow',
  }),
}

// With abnormal conditions
export const WithAbnormal: Story = {
  name: 'With Abnormal Conditions',
  render: createRenderer({
    ...sampleData,
    lochia: ['red', 'more', 'odor'],
    breast: ['hard', 'blocked'],
    wound: ['redness', 'discharge'],
    woundOther: 'Requires enhanced dressing changes',
    nursingMeasures:
      '1. Heavy lochia with odor, physician notified\n2. Breast lumps, applied warm compress and massage\n3. Incision redness with discharge, enhanced wound care\n4. Closely monitoring temperature',
  }),
}
