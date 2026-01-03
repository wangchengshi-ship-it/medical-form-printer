# Examples

This directory contains working examples demonstrating how to use the `medical-form-printer` library.

## Browser Example

The browser example shows how to render medical forms as printable HTML in a web browser.

### Files

- `browser/index.html` - HTML page with form preview
- `browser/basic.js` - JavaScript code demonstrating the API

### Running the Example

1. Build the library first:
   ```bash
   cd ../
   npm run build
   ```

2. Serve the examples directory with a local server:
   ```bash
   npx serve examples
   ```

3. Open `http://localhost:3000/browser/` in your browser

### Key Concepts

- **PrintSchema** - Defines the form layout (page size, header, sections, footer)
- **FormData** - Plain object with field values
- **renderToIsolatedHtml()** - Generates complete HTML with embedded fonts and styles
- **Watermarks** - Optional text overlay for draft/confidential documents

## Node.js Example

The Node.js example shows how to generate PDF files from medical forms.

### Files

- `node/package.json` - Dependencies and scripts
- `node/generate-pdf.js` - PDF generation code

### Running the Example

1. Install dependencies:
   ```bash
   cd node
   npm install
   ```

2. Generate a single PDF:
   ```bash
   npm run generate
   ```

3. Generate multiple PDFs (batch mode):
   ```bash
   npm run generate:batch
   ```

Generated PDFs will be saved to `node/output/`.

### Key Concepts

- **renderToPdf()** - Generates PDF buffer from schema and data
- **mergePdfs()** - Combines multiple forms into a single PDF
- **Puppeteer** - Required peer dependency for PDF generation

## Section Types

Both examples demonstrate these section types:

| Type | Description |
|------|-------------|
| `info-grid` | Key-value pairs in a grid layout |
| `table` | Tabular data with columns |
| `checkbox-grid` | Multiple choice selections |
| `free-text` | Long text content |
| `signature-area` | Signature fields with dates |
| `section-title` | Section headers |

## Learn More

- [API Documentation](../docs/api/)
- [Storybook](https://wangchengshi-ship-it.github.io/medical-form-printer/)
- [README](../README.md)
