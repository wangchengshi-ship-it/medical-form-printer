# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - 按 scenario 过滤房间
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases: user with multiple departments (POSTPARTUM + GENERAL), calling getRooms with scenario parameter
  - Test that getRooms(user, scenario='POSTPARTUM') returns ONLY POSTPARTUM rooms (from Fault Condition in design)
  - Test that getRooms(user, scenario='GENERAL') returns ONLY GENERAL rooms
  - The test assertions should match the Expected Behavior Properties from design: all returned rooms must have matching scenario
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: rooms with wrong scenario are returned
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - 不传 scenario 时的行为
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (no scenario parameter)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - When scenario is null/undefined, return all rooms from user's departments
    - SSO users (no departmentIds) skip department filtering
    - Users with no departments return empty array
    - Unassigned admissions are appended as virtual room "未分配"
    - Empty rooms (no active admissions) are returned with empty admissions array
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Fix for 房间科室过滤 bug

  - [x] 3.1 Add scenario field to Room model in Prisma schema
    - Add `scenario Scenario @default(POSTPARTUM)` field to Room model
    - Add index `@@index([scenario, departmentId])` for query optimization
    - Run `bun run prisma:push` to sync schema to database
    - Run `bun run prisma:generate` to regenerate Prisma client
    - _Bug_Condition: isBugCondition(input) where input.scenario IS NOT NULL AND user has multiple departments with different scenarios_
    - _Expected_Behavior: Only return rooms matching the specified scenario_
    - _Preservation: When scenario is null, return all rooms from user's departments_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Update AdmissionService.getRooms() to filter by scenario
    - Modify roomWhere condition to add `...(scenario && { scenario })` filter
    - Remove misleading code comments about scenario filtering being removed
    - Add new comment explaining scenario filtering through Room.scenario field
    - _Bug_Condition: isBugCondition(input) where input.scenario IS NOT NULL_
    - _Expected_Behavior: expectedBehavior(result) - all returned rooms have matching scenario_
    - _Preservation: Preservation Requirements from design - no scenario parameter returns all rooms_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.3 Update Room DTO to include scenario field
    - Add scenario field to CreateRoomDto (required, z.nativeEnum(Scenario))
    - Add scenario field to UpdateRoomDto (optional, z.nativeEnum(Scenario))
    - Add scenario field to Room response schema
    - Update Swagger documentation
    - _Requirements: 2.1, 2.2_

  - [x] 3.4 Migrate existing room data
    - Create data migration script to set scenario for existing rooms
    - Default all rooms to POSTPARTUM scenario
    - Manually update GENERAL department rooms to GENERAL scenario (if identifiable)
    - Verify all rooms have valid scenario values
    - _Requirements: 2.1, 2.2_

  - [x] 3.5 Update seed data (if exists)
    - Add scenario field to room seed data in prisma/seed.ts
    - Set POSTPARTUM for 产康科室 rooms
    - Set GENERAL for 通用科室 rooms
    - _Requirements: 2.1, 2.2_

  - [x] 3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - 按 scenario 过滤房间
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: Expected Behavior Properties from design - 2.1, 2.2, 2.3_

  - [x] 3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - 不传 scenario 时的行为
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run full test suite: `bun run test`
  - Verify all unit tests pass
  - Verify all integration tests pass
  - Verify API documentation is updated correctly
  - Ask the user if questions arise
