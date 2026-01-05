# Implementation Plan: Smart Pagination Fix

## Overview

修复 Smart Pagination 功能，使用 GoF 策略模式将测量逻辑从分页逻辑中解耦，实现真实的 DOM 测量。

## Tasks

- [x] 1. Create MeasurementStrategy interface
  - [x] 1.1 Create `strategies/smart/measurement-strategy.ts` with interface definition
    - Define `MeasurementStrategy` interface with `measure` method
    - Define `MeasurementConfig` type
    - Add JSDoc documentation
    - _Requirements: 1.1, 1.2_

- [x] 2. Implement DomMeasurementStrategy
  - [x] 2.1 Create `strategies/smart/dom-measurement-strategy.ts`
    - Implement `MeasurementStrategy` interface
    - Render content to hidden container using `renderToIsolatedHtml`
    - Use `createContentMeasurer` for actual DOM measurement
    - Implement cleanup logic
    - Throw error in non-browser environment
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 2.2 Write property test for item count matching data
    - **Property 2: Item Count Matches Data**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [x] 3. Update SmartPaginationStrategy
  - [x] 3.1 Modify `strategies/smart/smart-pagination-strategy.ts`
    - Add `measurementStrategy` private field
    - Update constructor to accept optional `MeasurementStrategy`
    - Default to `DomMeasurementStrategy` when not provided
    - Update `render` method to use measurement strategy
    - _Requirements: 1.3, 4.1, 4.2, 4.3, 4.4_
  - [x] 3.2 Mark `estimateItems` method as deprecated
    - Add `@deprecated` JSDoc annotation
    - Include deprecation reason and alternative
    - Include version number (v1.4.0)
    - Keep method functional but unused internally
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 3.3 Write property test for custom strategy override
    - **Property 3: Custom Strategy Override**
    - **Validates: Requirements 1.3**

- [x] 4. Update exports
  - [x] 4.1 Update `strategies/smart/index.ts`
    - Export `MeasurementStrategy` interface
    - Export `MeasurementConfig` type
    - Export `DomMeasurementStrategy` class
    - _Requirements: 1.1_

- [x] 5. Checkpoint - Ensure all tests pass
  - Run existing tests to verify no regressions
  - Ensure all imports resolve correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Write property tests
  - [x] 6.1 Write property test for interface compliance
    - **Property 1: MeasurementStrategy Interface Compliance**
    - **Validates: Requirements 1.1, 1.2**
  - [x] 6.2 Write property test for multi-page rendering
    - **Property 4: Multi-Page Rendering**
    - **Validates: Requirements 4.4**

- [x] 7. Update Storybook stories
  - [x] 7.1 Verify `SmartPagination.stories.ts` works with new implementation
    - Test with 14+ rows to verify pagination
    - Ensure multiple pages are rendered
    - _Requirements: 4.4_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Run all tests including new property tests
  - Verify Storybook stories render correctly with pagination
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Existing algorithm files (`page-break-calculator.ts`) should NOT be modified
