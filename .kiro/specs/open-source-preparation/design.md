# Design Document: Open Source Preparation

## Overview

This document outlines the design for preparing the `medical-print-renderer` library for open source release as `medical-form-printer`. The preparation involves four main areas:

1. **Package Configuration** - npm publishing setup
2. **Documentation** - English README, API docs, examples
3. **Code Sanitization** - Remove sensitive data, translate Chinese content
4. **Infrastructure** - CI/CD, contribution guidelines, legal files

## Architecture

The open source preparation follows a layered approach:

```
┌─────────────────────────────────────────────────────────────┐
│                    Public Release                            │
├─────────────────────────────────────────────────────────────┤
│  Documentation Layer                                         │
│  ├── README.md (English)                                    │
│  ├── README.zh-CN.md (Chinese)                              │
│  ├── API Reference (JSDoc + TypeScript)                     │
│  └── Examples (browser + Node.js)                           │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                        │
│  ├── GitHub Actions (CI/CD)                                 │
│  ├── Issue/PR Templates                                     │
│  └── Legal Files (LICENSE, CODE_OF_CONDUCT)                 │
├─────────────────────────────────────────────────────────────┤
│  Code Layer                                                  │
│  ├── Source Code (sanitized, English comments)              │
│  ├── Tests (generic data)                                   │
│  └── Storybook Stories (placeholder data)                   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Package Configuration

**File: `package.json`**

```json
{
  "name": "medical-form-printer",
  "version": "0.1.0",
  "description": "A medical form print renderer - render structured form data to printable HTML/PDF",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/wangchengshi-ship-it/medical-form-printer.git"
  },
  "homepage": "https://github.com/wangchengshi-ship-it/medical-form-printer#readme",
  "bugs": {
    "url": "https://github.com/wangchengshi-ship-it/medical-form-printer/issues"
  },
  "keywords": [
    "medical",
    "form",
    "print",
    "pdf",
    "renderer",
    "healthcare",
    "emr",
    "html-to-pdf"
  ]
}
```

### 2. Documentation Structure

```
medical-form-printer/
├── README.md              # English (primary)
├── README.zh-CN.md        # Chinese
├── docs/
│   ├── api/               # API reference (generated from JSDoc)
│   └── guides/            # Usage guides
├── examples/
│   ├── browser/           # Browser usage examples
│   │   ├── index.html
│   │   └── basic.js
│   └── node/              # Node.js examples
│       ├── package.json
│       └── generate-pdf.js
└── CHANGELOG.md
```

### 3. Data Sanitization Mapping

| Original (Sensitive) | Replacement (Generic) |
|---------------------|----------------------|
| Sample Hospital | Sample Hospital |
| Postpartum Care Center | Postpartum Care Center |
| 张三 | Jane Doe |
| 李护士 | Nurse Smith |
| 王护士长 | Head Nurse Johnson |
| 张宝宝 | Baby Doe |
| 天津市中心妇产科医院 | City Medical Center |
| 天津 | Sample City |
| 汉族 | - (remove or use generic) |

### 4. CI/CD Workflow

**File: `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

**File: `.github/workflows/publish.yml`**

```yaml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
          registry-url: https://registry.npmjs.org
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Data Models

### Placeholder Data Constants

Create a centralized file for placeholder data used in examples and tests:

**File: `src/test-utils/placeholder-data.ts`**

```typescript
/**
 * Placeholder data for examples and tests.
 * Use these constants instead of real data.
 */
export const PLACEHOLDER = {
  hospital: {
    name: 'Sample Hospital',
    department: 'Postpartum Care Center',
  },
  patient: {
    name: 'Jane Doe',
    babyName: 'Baby Doe',
  },
  staff: {
    nurse: 'Nurse Smith',
    headNurse: 'Head Nurse Johnson',
    doctor: 'Dr. Williams',
  },
  location: {
    city: 'Sample City',
    address: '123 Medical Drive',
  },
} as const
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Package.json Validity

*For any* valid release build, the package.json SHALL contain all required npm publishing fields (name, version, description, repository, homepage, bugs, keywords, license) with non-empty values, and the version SHALL match semantic versioning format (X.Y.Z).

**Validates: Requirements 1.1, 1.2, 1.5**

### Property 2: No Old Package Name References

*For any* source file, test file, or documentation file in the repository, there SHALL be zero occurrences of the old package name `@medical/print-renderer`.

**Validates: Requirements 1.6**

### Property 3: No Chinese Characters in Source Code

*For any* TypeScript source file in the `src/` directory, there SHALL be zero Chinese characters (Unicode range \u4e00-\u9fa5) in comments, string literals, or identifiers.

**Validates: Requirements 2.8, 2.9, 4.6, 4.7**

### Property 4: No Sensitive Hospital Data

*For any* file in the repository (source, tests, stories, documentation), there SHALL be zero occurrences of sensitive hospital names including but not limited to: "Sample Hospital", "中医二附属", "天津市中心妇产科医院".

**Validates: Requirements 4.4, 4.5, 4.11, 4.12**

### Property 5: No Sensitive Personal Data

*For any* file in the repository, there SHALL be zero occurrences of real Chinese personal names used as patient or staff identifiers. Specifically, names like "张三", "李护士", "王护士长", "张宝宝" SHALL be replaced with generic English placeholders.

**Validates: Requirements 4.4, 4.5, 4.11, 4.12**

### Property 6: JSDoc Coverage for Public Exports

*For any* function, class, or type exported from `src/index.ts`, there SHALL be a corresponding JSDoc comment with at least a description and @param/@returns annotations where applicable.

**Validates: Requirements 3.1, 3.2, 3.3**

## Error Handling

### Validation Script Errors

The validation scripts should provide clear error messages:

```typescript
// Example validation output
interface ValidationResult {
  passed: boolean
  errors: Array<{
    file: string
    line?: number
    message: string
    severity: 'error' | 'warning'
  }>
}
```

### CI Failure Handling

- CI should fail fast on first error
- Error messages should include file path and line number
- Suggestions for fixes should be provided where possible

## Testing Strategy

### Dual Testing Approach

1. **Unit Tests** - Verify specific examples and edge cases
2. **Property Tests** - Verify universal properties across all inputs

### Property-Based Testing Configuration

- **Library**: fast-check (already in devDependencies)
- **Minimum iterations**: 100 per property test
- **Tag format**: `Feature: open-source-preparation, Property N: {property_text}`

### Test Files Structure

```
test/
├── open-source/
│   ├── package-validation.test.ts    # Property 1
│   ├── no-old-references.test.ts     # Property 2
│   ├── no-chinese-source.test.ts     # Property 3
│   ├── no-sensitive-hospital.test.ts # Property 4
│   ├── no-sensitive-personal.test.ts # Property 5
│   └── jsdoc-coverage.test.ts        # Property 6
```

### Validation Scripts

Create npm scripts for manual validation:

```json
{
  "scripts": {
    "validate:package": "node scripts/validate-package.js",
    "validate:sensitive": "node scripts/check-sensitive-data.js",
    "validate:chinese": "node scripts/check-chinese-chars.js",
    "validate:all": "npm run validate:package && npm run validate:sensitive && npm run validate:chinese"
  }
}
```

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `README.md` | English documentation (replace existing) |
| `README.zh-CN.md` | Chinese documentation |
| `CONTRIBUTING.md` | Contribution guidelines |
| `CODE_OF_CONDUCT.md` | Community code of conduct |
| `LICENSE` | MIT license file |
| `.github/workflows/ci.yml` | CI workflow |
| `.github/workflows/publish.yml` | npm publish workflow |
| `.github/ISSUE_TEMPLATE/bug_report.md` | Bug report template |
| `.github/ISSUE_TEMPLATE/feature_request.md` | Feature request template |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR template |
| `examples/browser/index.html` | Browser example |
| `examples/node/generate-pdf.js` | Node.js example |

### Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Update name, add repository/homepage/bugs fields |
| `stories/*.ts` | Replace sensitive data with placeholders |
| `test/*.ts` | Replace sensitive data with placeholders |
| `src/**/*.ts` | Translate Chinese comments to English |
| `CHANGELOG.md` | Update format to Keep a Changelog |
