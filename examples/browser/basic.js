/**
 * @fileoverview Browser example for medical-form-printer
 * @description Demonstrates how to render medical forms in a browser environment
 *
 * Key concepts covered:
 * 1. Defining a PrintSchema - the layout configuration for your form
 * 2. Providing FormData - the actual data to populate the form
 * 3. Using renderToIsolatedHtml() - renders form with embedded fonts and styles
 * 4. Adding watermarks - optional text overlay for draft/confidential documents
 */

import {
  renderToIsolatedHtml,
  defaultTheme,
} from 'medical-form-printer'

// ============================================================================
// STEP 1: Define the PrintSchema
// ============================================================================
// The PrintSchema defines the structure and layout of your medical form.
// It includes page settings, header, sections, and footer configuration.

const printSchema = {
  // Page configuration
  pageSize: '16K',           // Options: 'A4', 'A5', '16K'
  orientation: 'portrait',   // Options: 'portrait', 'landscape'

  // Header configuration - appears at the top of each page
  header: {
    hospital: 'Sample Hospital',
    department: 'Postpartum Care Center',
    title: 'Maternal Admission Assessment',
  },

  // Sections - the main content of the form
  sections: [
    // Section 1: Info Grid - displays key-value pairs in a grid layout
    {
      type: 'info-grid',
      config: {
        columns: 4,  // Number of columns in the grid
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
              { label: 'Age', field: 'age', type: 'number', suffix: 'years' },
              { label: 'Blood Type', field: 'bloodType', type: 'text' },
              { label: 'Delivery Date', field: 'deliveryDate', type: 'date' },
              { label: 'Delivery Method', field: 'deliveryMethod', type: 'text' },
            ],
          },
        ],
      },
    },

    // Section 2: Vital Signs Table
    {
      type: 'section-title',
      config: {
        text: 'Vital Signs',
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
              { label: 'Pulse', field: 'pulse', type: 'number', suffix: 'bpm' },
              { label: 'Respiration', field: 'respiration', type: 'number', suffix: '/min' },
              { label: 'Blood Pressure', field: 'bloodPressure', type: 'text' },
            ],
          },
        ],
      },
    },

    // Section 3: Checkbox Grid - for multiple choice selections
    {
      type: 'checkbox-grid',
      title: 'Allergy History',
      config: {
        field: 'allergies',  // Field name in formData (should be an array)
        columns: 4,
        options: [
          { value: 'none', label: 'None' },
          { value: 'penicillin', label: 'Penicillin' },
          { value: 'sulfa', label: 'Sulfonamides' },
          { value: 'other', label: 'Other', hasInput: true, inputField: 'allergyOther' },
        ],
      },
    },

    // Section 4: Free Text - for longer text content
    {
      type: 'section-title',
      config: {
        text: 'Assessment Notes',
        bold: true,
      },
    },
    {
      type: 'free-text',
      config: {
        field: 'assessment',
        minHeight: '80px',
      },
    },

    // Section 5: Signature Area
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

  // Footer configuration - appears at the bottom of each page
  footer: {
    showPageNumber: true,
    notes: 'This form is completed by the nurse within 24 hours of admission',
  },
}

// ============================================================================
// STEP 2: Prepare the Form Data
// ============================================================================
// FormData is a plain object where keys match the 'field' values in your schema.
// The renderer will look up values from this object to populate the form.

const formData = {
  // Basic information
  roomNumber: '301',
  hospitalNumber: '2024010001',
  admissionTime: '2024-01-15T10:30:00',
  name: 'Jane Doe',
  age: 28,
  bloodType: 'A+',
  deliveryDate: '2024-01-10',
  deliveryMethod: 'C-section',

  // Vital signs
  temperature: 36.5,
  pulse: 72,
  respiration: 18,
  bloodPressure: '120/80 mmHg',

  // Checkbox selections (array of selected values)
  allergies: ['none'],

  // Free text content
  assessment: `Patient in good general condition, alert and oriented.
Post C-section day 5, incision healing well with no redness or discharge.
Breasts full, milk production normal.
Lochia minimal, light red.`,

  // Signatures
  nurseSignature: 'Nurse Smith',
  headNurseSignature: 'Head Nurse Johnson',
}

// ============================================================================
// STEP 3: Render the Form
// ============================================================================
// renderToIsolatedHtml() generates a complete HTML document with:
// - Embedded fonts (no external font loading required)
// - Scoped CSS (won't conflict with your page styles)
// - Print-optimized layout

function renderForm(watermark = '') {
  // Render options
  const options = {
    // Optional: Add a watermark overlay
    watermark: watermark || undefined,

    // Optional: Customize the theme
    // theme: {
    //   colors: {
    //     primary: '#000000',
    //     border: '#cccccc',
    //   },
    //   fonts: {
    //     base: 'Arial, sans-serif',
    //   },
    // },
  }

  // Generate the HTML
  const html = renderToIsolatedHtml(printSchema, formData, options)

  return html
}

// ============================================================================
// STEP 4: Display and Print
// ============================================================================

// Get DOM elements
const previewFrame = document.getElementById('preview-frame')
const watermarkInput = document.getElementById('watermark-input')
const renderBtn = document.getElementById('render-btn')
const printBtn = document.getElementById('print-btn')

// Render the form initially
function updatePreview() {
  const watermark = watermarkInput.value.trim()
  const html = renderForm(watermark)

  // Display in iframe for complete style isolation
  previewFrame.srcdoc = html
}

// Event handlers
renderBtn.addEventListener('click', updatePreview)

printBtn.addEventListener('click', () => {
  // Print the iframe content
  previewFrame.contentWindow.print()
})

// Allow pressing Enter in the watermark input to render
watermarkInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    updatePreview()
  }
})

// Initial render
updatePreview()

// ============================================================================
// Additional Examples
// ============================================================================

// Example: Rendering a table with daily records
const tableSchema = {
  pageSize: '16K',
  orientation: 'landscape',
  header: {
    hospital: 'Sample Hospital',
    department: 'Postpartum Care Center',
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
              { label: 'Baby Name', field: 'babyName', type: 'text' },
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
        dataField: 'dailyRecords',  // Array field in formData
        showRowNumber: true,
        columns: [
          { header: 'Date', field: 'date', type: 'date', width: '80px' },
          { header: 'Days Old', field: 'daysOld', type: 'number', width: '60px' },
          { header: 'Weight (g)', field: 'weight', type: 'number', width: '70px' },
          { header: 'Temp (°C)', field: 'temperature', type: 'number', width: '70px' },
          { header: 'Feeding', field: 'feeding', type: 'text' },
          { header: 'Notes', field: 'notes', type: 'text' },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
  },
}

const tableData = {
  motherName: 'Jane Doe',
  roomNumber: '301',
  babyName: 'Baby Doe',
  birthDate: '2024-01-10',
  dailyRecords: [
    { date: '2024-01-15', daysOld: 5, weight: 3200, temperature: 36.8, feeding: 'Breastfeeding', notes: 'Good condition' },
    { date: '2024-01-16', daysOld: 6, weight: 3250, temperature: 36.7, feeding: 'Breastfeeding', notes: '' },
    { date: '2024-01-17', daysOld: 7, weight: 3300, temperature: 36.6, feeding: 'Mixed', notes: 'Umbilical cord fell off' },
  ],
}

// You can render this table example by calling:
// const tableHtml = renderToIsolatedHtml(tableSchema, tableData)

console.log('Medical Form Printer - Browser Example loaded successfully!')
console.log('Available exports:', { renderToIsolatedHtml, defaultTheme })
