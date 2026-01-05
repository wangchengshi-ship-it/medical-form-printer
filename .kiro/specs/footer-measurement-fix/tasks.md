# Implementation Plan: Footer Measurement Fix

## Overview

本实现计划修复页脚测量问题，确保 `print-footer` 元素（包含页码）被正确测量，分页计算时为页脚区域预留空间。

## Tasks

- [x] 1. Add FOOTER selector to MEASURE_SELECTORS
  - Add `FOOTER: createDualSelector(['print-footer'])` to MEASURE_SELECTORS object
  - Place it after HEADER selector for consistency
  - _Requirements: 1.1, 1.2, 1.3_
  - ✅ Done: Added FOOTER selector after HEADER in measurer-types.ts

- [x] 2. Update measureFooterInto function
  - [x] 2.1 Modify function signature to accept pageContainer parameter
    - Change from `measureFooterInto(printBody, results)` to `measureFooterInto(pageContainer, printBody, results)`
    - _Requirements: 2.1_
  - [x] 2.2 Add print-footer element measurement
    - Query for print-footer using MEASURE_SELECTORS.FOOTER
    - Create MeasurableItem with id 'page-footer' and type 'footer'
    - _Requirements: 2.2, 2.3_
  - [x] 2.3 Handle missing print-footer gracefully
    - Only add item if element exists and has positive height
    - _Requirements: 2.4_

- [x] 3. Update measureAll function call
  - Pass pageContainer to measureFooterInto
  - Ensure measureFooter is called with correct parameters
  - _Requirements: 2.1_
  - ✅ Done: Updated measureAll to pass pageContainer to measureFooterInto

- [ ] 4. Checkpoint - Verify measurement changes
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Write unit tests for FOOTER selector
  - Test MEASURE_SELECTORS.FOOTER is defined
  - Test selector matches both .print-footer and .mpr-print-footer
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 6. Write property test for extractFooterHeight
  - **Property 3: extractFooterHeight returns sum of all footer item heights**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [ ] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive coverage
- The fix is minimal and focused on the measurement gap
- Existing `extractFooterHeight` function in SmartPaginationStrategy already sums all footer items, so no changes needed there
- The key change is ensuring `measureFooterInto` produces footer items for `print-footer` elements

