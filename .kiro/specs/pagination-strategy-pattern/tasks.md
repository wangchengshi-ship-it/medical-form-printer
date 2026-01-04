# Implementation Plan: Pagination Strategy Pattern

## Overview

将现有分页功能重构为统一的策略模式架构，创建 `PaginationStrategy` 接口和两个策略适配器，同时保持现有算法不变。

## Tasks

- [x] 1. Move overflow-pagination.ts to strategy directory
  - Use git mv to preserve history
  - Move `src/pagination/overflow-pagination.ts` to `src/pagination/strategies/overflow/`
  - _Requirements: 3.2_

- [x] 2. Create strategy interface and context
  - [x] 2.1 Create `strategies/pagination-strategy.ts` with interface and types
    - Define `PaginationStrategy` interface with `name`, `shouldApply`, `render`
    - Define `PrintSchemaWithPagination` type
    - Define `PaginationRenderOptions` type
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.2 Implement `PaginationContext` class in same file
    - Constructor accepts array of strategies
    - Implement `getApplicableStrategies(schema)` method
    - Implement `render(schema, data, options)` method with fallback
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ]* 2.3 Write property test for context strategy selection
    - **Property 4: Context Strategy Selection Consistency**
    - **Validates: Requirements 4.3**

- [ ] 3. Create SmartPaginationStrategy adapter
  - [ ] 3.1 Create `strategies/smart/smart-pagination-strategy.ts`
    - Implement `PaginationStrategy` interface
    - `shouldApply` checks `pagination.smartPagination.enabled === true`
    - `render` delegates to existing `calculatePageBreaks` and `renderPaginatedHtml`
    - _Requirements: 2.1, 2.3, 2.4, 2.5_
  - [ ]* 3.2 Write property test for smart pagination applicability
    - **Property 2: Smart Pagination Strategy Applicability**
    - **Validates: Requirements 2.5**

- [ ] 4. Create OverflowPaginationStrategy adapter
  - [ ] 4.1 Create `strategies/overflow/overflow-pagination-strategy.ts`
    - Implement `PaginationStrategy` interface
    - `shouldApply` checks `pagination.overflow.fields` has items
    - `render` delegates to existing `renderPaginatedHtml` with overflow config
    - _Requirements: 3.1, 3.3, 3.4, 3.5_
  - [ ]* 4.2 Write property test for overflow pagination applicability
    - **Property 3: Overflow Pagination Strategy Applicability**
    - **Validates: Requirements 3.5**

- [ ] 5. Create index.ts export files
  - [ ] 5.1 Create `strategies/smart/index.ts`
    - Export `SmartPaginationStrategy`
    - Re-export from `page-break-calculator.ts`
    - _Requirements: 2.1, 2.2_
  - [ ] 5.2 Create `strategies/overflow/index.ts`
    - Export `OverflowPaginationStrategy`
    - Re-export from `overflow-handler.ts` and `overflow-pagination.ts`
    - _Requirements: 3.1, 3.2_
  - [ ] 5.3 Create `strategies/index.ts`
    - Export all strategies and context
    - Export `createDefaultPaginationContext` factory
    - _Requirements: 1.1, 4.1_

- [ ] 6. Update import paths
  - [ ] 6.1 Update `paginated-renderer.ts` imports
    - Change imports to use new strategy directory paths
    - _Requirements: 1.5_
  - [ ] 6.2 Update `src/pagination/index.ts` exports
    - Add exports for strategy interface and context
    - Update re-exports for moved files
    - _Requirements: 1.5_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Run existing tests to verify no regressions
  - Ensure all imports resolve correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 8. Write interface compliance property test
  - **Property 1: Strategy Interface Compliance**
  - Test both strategies return correct types
  - **Validates: Requirements 1.2, 1.3, 1.4**

- [ ] 9. Create Storybook stories
  - [ ] 9.1 Create `stories/pagination/SmartPagination.stories.ts`
    - Show table with 14+ rows auto-paginating
    - Use strategy interface for rendering
    - _Requirements: 5.1, 5.3, 5.4_
  - [ ] 9.2 Update `stories/pagination/OverflowPagination.stories.ts`
    - Update to use strategy interface
    - Keep existing story content
    - _Requirements: 5.2, 5.3_

- [ ] 10. Final checkpoint - Ensure all tests pass
  - Run all tests including new property tests
  - Verify Storybook stories render correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Existing algorithm files (`page-break-calculator.ts`, `overflow-handler.ts`) should NOT be modified
