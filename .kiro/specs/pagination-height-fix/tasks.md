# Implementation Plan: Pagination Height Fix

## Overview

修复分页高度计算问题，确保 header 和 footer 高度被正确传递给分页算法。

## Tasks

- [x] 1. Add helper methods to SmartPaginationStrategy
  - [x] 1.1 Add `extractHeaderHeight` method
    - Find item with type 'header' and return its height
    - Return 0 if no header item found
    - _Requirements: 1.1, 1.2, 1.4_
  - [x] 1.2 Add `extractFooterHeight` method
    - Sum heights of items with type 'footer' or 'signature'
    - Return 0 if no footer/signature items found
    - _Requirements: 2.1, 2.2, 2.4_
  - [x] 1.3 Add `filterContentItems` method
    - Filter to only include 'section', 'table-header', 'table-row' types
    - Exclude 'header', 'footer', 'signature' types
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2. Update render method
  - [x] 2.1 Modify `render` method to use new helper methods
    - Extract header height from measured items
    - Extract footer height from measured items
    - Filter content items before passing to calculatePageBreaks
    - Pass headerHeight and footerHeight to calculatePageBreaks
    - _Requirements: 1.3, 2.3, 3.1, 3.2_

- [ ] 3. Checkpoint - Verify fix works
  - Run existing tests to verify no regressions
  - Test with NewbornNursing MultipleRecords story
  - Ensure content no longer overflows

- [ ] 4. Write property tests
  - [ ] 4.1 Write property test for header height extraction
    - **Property 1: Header Height Extraction**
    - **Validates: Requirements 1.2, 1.4**
  - [ ] 4.2 Write property test for footer height calculation
    - **Property 2: Footer Height Calculation**
    - **Validates: Requirements 2.2, 2.4**
  - [ ] 4.3 Write property test for content item filtering
    - **Property 3: Content Item Filtering**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
  - [ ] 4.4 Write property test for available height invariant
    - **Property 5: Available Height Invariant**
    - **Validates: Requirements 3.1, 3.2**

- [ ] 5. Final checkpoint - Ensure all tests pass
  - Run all tests including new property tests
  - Verify Storybook stories render correctly without overflow
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Only `smart-pagination-strategy.ts` needs to be modified
