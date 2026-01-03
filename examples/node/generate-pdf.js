/**
 * @fileoverview Node.js example for medical-form-printer
 * @description Demonstrates how to generate PDF files from medical forms in Node.js
 *
 * Key concepts covered:
 * 1. Using renderToPdf() - generates PDF buffer from schema and data
 * 2. Using mergePdfs() - combines multiple forms into a single PDF
 * 3. Saving PDF files to disk
 * 4. Batch processing multiple forms
 *
 * Prerequisites:
 * - Node.js >= 18.0.0
 * - puppeteer (peer dependency for PDF generation)
 *
 * Usage:
 *   npm install
 *   npm run generate          # Generate single PDF
 *   npm run generate:batch    # Generate batch PDFs
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Import from medical-form-printer/node for PDF generation
// Note: The /node subpath includes renderToPdf and mergePdfs
import { renderToPdf, mergePdfs } from 'medical-form-printer/node'

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Output directory for generated PDFs
const OUTPUT_DIR = join(__dirname, 'output')

// ============================================================================
// STEP 1: Define Print Schemas
// ============================================================================
// PrintSchema defines the structure and layout of your medical form.

/**
 * Maternal Admission Assessment form schema
 */
const maternalAdmissionSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: 'Sample Hospital',
    department: 'Postpartum Care Center',
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
              { label: 'Age', field: 'age', type: 'number', suffix: 'years' },
              { label: 'Blood Type', field: 'bloodType', type: 'text' },
              { label: 'Delivery Date', field: 'deliveryDate', type: 'date' },
              { label: 'Delivery Method', field: 'deliveryMethod', type: 'text' },
            ],
          },
        ],
      },
    },
    {
      type: 'section-title',
      config: { text: 'Vital Signs', bold: true },
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
      type: 'section-title',
      config: { text: 'Assessment Notes', bold: true },
    },
    {
      type: 'free-text',
      config: { field: 'assessment', minHeight: '80px' },
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

/**
 * Newborn Nursing Record form schema (landscape orientation with table)
 */
const newbornNursingSchema = {
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
        dataField: 'dailyRecords',
        showRowNumber: true,
        columns: [
          { header: 'Date', field: 'date', type: 'date', width: '80px' },
          { header: 'Days Old', field: 'daysOld', type: 'number', width: '60px' },
          { header: 'Weight (g)', field: 'weight', type: 'number', width: '70px' },
          { header: 'Temp (°C)', field: 'temperature', type: 'number', width: '70px' },
          { header: 'Feeding', field: 'feeding', type: 'text', width: '100px' },
          { header: 'Notes', field: 'notes', type: 'text' },
        ],
      },
    },
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: 'Nurse', field: 'nurseSignature', showDate: true },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
  },
}

// ============================================================================
// STEP 2: Prepare Form Data
// ============================================================================

/**
 * Sample maternal admission data
 */
const maternalData = {
  roomNumber: '301',
  hospitalNumber: '2024010001',
  admissionTime: '2024-01-15T10:30:00',
  name: 'Jane Doe',
  age: 28,
  bloodType: 'A+',
  deliveryDate: '2024-01-10',
  deliveryMethod: 'C-section',
  temperature: 36.5,
  pulse: 72,
  respiration: 18,
  bloodPressure: '120/80 mmHg',
  allergies: ['none'],
  assessment: `Patient in good general condition, alert and oriented.
Post C-section day 5, incision healing well with no redness or discharge.
Breasts full, milk production normal.
Lochia minimal, light red.`,
  nurseSignature: 'Nurse Smith',
  headNurseSignature: 'Head Nurse Johnson',
}

/**
 * Sample newborn nursing data
 */
const newbornData = {
  motherName: 'Jane Doe',
  roomNumber: '301',
  babyName: 'Baby Doe',
  birthDate: '2024-01-10',
  dailyRecords: [
    { date: '2024-01-15', daysOld: 5, weight: 3200, temperature: 36.8, feeding: 'Breastfeeding', notes: 'Good condition' },
    { date: '2024-01-16', daysOld: 6, weight: 3250, temperature: 36.7, feeding: 'Breastfeeding', notes: '' },
    { date: '2024-01-17', daysOld: 7, weight: 3300, temperature: 36.6, feeding: 'Mixed', notes: 'Umbilical cord fell off' },
    { date: '2024-01-18', daysOld: 8, weight: 3350, temperature: 36.7, feeding: 'Breastfeeding', notes: '' },
    { date: '2024-01-19', daysOld: 9, weight: 3400, temperature: 36.8, feeding: 'Breastfeeding', notes: 'Weight gain good' },
  ],
  nurseSignature: 'Nurse Smith',
}

// ============================================================================
// STEP 3: PDF Generation Functions
// ============================================================================

/**
 * Ensure output directory exists
 */
async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
    console.log(`Created output directory: ${OUTPUT_DIR}`)
  }
}

/**
 * Generate a single PDF file
 *
 * @param {object} schema - PrintSchema configuration
 * @param {object} data - Form data
 * @param {string} filename - Output filename
 * @param {object} options - PDF generation options
 */
async function generateSinglePdf(schema, data, filename, options = {}) {
  console.log(`Generating ${filename}...`)

  try {
    // renderToPdf returns a Buffer containing the PDF data
    const pdfBuffer = await renderToPdf(schema, data, options)

    // Save to file
    const outputPath = join(OUTPUT_DIR, filename)
    await writeFile(outputPath, pdfBuffer)

    console.log(`  ✓ Saved to ${outputPath} (${pdfBuffer.length} bytes)`)
    return pdfBuffer
  } catch (error) {
    console.error(`  ✗ Failed to generate ${filename}:`, error.message)
    throw error
  }
}

/**
 * Generate merged PDF from multiple forms
 *
 * @param {Array<{schema: object, data: object}>} documents - Array of documents to merge
 * @param {string} filename - Output filename
 * @param {object} options - Merge options
 */
async function generateMergedPdf(documents, filename, options = {}) {
  console.log(`Generating merged PDF: ${filename}...`)

  try {
    // mergePdfs combines multiple forms into a single PDF
    const pdfBuffer = await mergePdfs(documents, options)

    // Save to file
    const outputPath = join(OUTPUT_DIR, filename)
    await writeFile(outputPath, pdfBuffer)

    console.log(`  ✓ Saved to ${outputPath} (${pdfBuffer.length} bytes)`)
    console.log(`  ✓ Merged ${documents.length} documents`)
    return pdfBuffer
  } catch (error) {
    console.error(`  ✗ Failed to generate ${filename}:`, error.message)
    throw error
  }
}

// ============================================================================
// STEP 4: Main Execution
// ============================================================================

async function main() {
  const args = process.argv.slice(2)
  const isBatch = args.includes('--batch')

  console.log('Medical Form Printer - Node.js PDF Generation Example')
  console.log('=====================================================\n')

  await ensureOutputDir()

  if (isBatch) {
    // Batch mode: generate multiple PDFs and merge them
    console.log('Running in batch mode...\n')

    // Generate individual PDFs
    await generateSinglePdf(
      maternalAdmissionSchema,
      maternalData,
      'maternal-admission.pdf'
    )

    await generateSinglePdf(
      newbornNursingSchema,
      newbornData,
      'newborn-nursing.pdf'
    )

    // Generate PDF with watermark
    await generateSinglePdf(
      maternalAdmissionSchema,
      maternalData,
      'maternal-admission-draft.pdf',
      { watermark: 'DRAFT' }
    )

    // Merge multiple forms into one PDF
    await generateMergedPdf(
      [
        { schema: maternalAdmissionSchema, data: maternalData },
        { schema: newbornNursingSchema, data: newbornData },
      ],
      'patient-complete-record.pdf'
    )

    console.log('\n✓ Batch generation complete!')
  } else {
    // Single mode: generate one PDF
    console.log('Running in single mode...\n')

    await generateSinglePdf(
      maternalAdmissionSchema,
      maternalData,
      'maternal-admission.pdf'
    )

    console.log('\n✓ Generation complete!')
    console.log('\nTip: Run with --batch flag to generate multiple PDFs:')
    console.log('  npm run generate:batch')
  }
}

// Run the main function
main().catch((error) => {
  console.error('\nFatal error:', error)
  process.exit(1)
})
