# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - FormRecord 使用 admissionId 关联 Admission 而非 medicalCaseId 关联 MedicalCase
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: 使用 fast-check 生成随机 medicalCaseId + templateId + formType 组合
  - 测试文件：`backend/src/modules/form-record/__tests__/form-record-medical-case.fault.spec.ts`
  - 验证 `FormRecordService.create()` 使用 `medicalCaseId` 参数创建记录并关联到 MedicalCase（当前代码使用 admissionId，测试将失败）
  - 验证 `CreateFormRecordDto` 接受 `medicalCaseId` 字段（当前代码使用 admissionId，测试将失败）
  - 验证 upsert 的唯一约束使用 `medicalCaseId_templateId_formType`（当前使用 admissionId，测试将失败）
  - 验证 `findByMedicalCaseId()` 方法存在并按 `medicalCaseId` 查询（当前方法名为 findByAdmissionId，测试将失败）
  - 验证 `findByCaseNumber()` 方法存在并按 `MedicalCase.caseNumber` 查询（当前方法名为 findByAdmissionNumber，测试将失败）
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - 非关联相关行为保持不变（CRUD、签名、每日记录条目追加、状态验证）
  - **IMPORTANT**: Follow observation-first methodology
  - 测试文件：`backend/src/modules/form-record/__tests__/form-record-preservation.spec.ts`
  - 使用 @suites/unit 的 TestBed.solitary 创建 FormRecordService 测试实例
  - 使用 fast-check 生成随机输入验证以下保留行为：
  - Observe: SINGLE_FORM 类型的 upsert 逻辑（已存在则更新，否则创建）在未修复代码上正常工作
  - Observe: DAILY_LOG 类型的条目创建和追加逻辑在未修复代码上正常工作
  - Observe: 已签名或已归档的 FormRecord 拒绝修改并抛出 BadRequestException
  - Observe: 按 templateId、status、formType、patientId 等条件过滤和分页正常工作
  - Observe: DailyLogEntry 追加时验证表单类型为 DAILY_LOG 且状态未签名/归档
  - Write property-based test: for all non-bug-condition inputs（表单数据 CRUD、签名、条目追加），行为与当前一致
  - Verify test passes on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Fix FormRecord 外键从 admissionId 改为 medicalCaseId

  - [x] 3.1 更新 Prisma Schema
    - 修改 `backend/prisma/schema.prisma` 中 FormRecord 模型
    - 将 `admissionId String` 改为 `medicalCaseId String`
    - 将 `admission Admission @relation(...)` 改为 `medicalCase MedicalCase @relation(...)`
    - 将 `@@unique([admissionId, templateId, formType])` 改为 `@@unique([medicalCaseId, templateId, formType])`
    - 将 `@@index([admissionId])` 改为 `@@index([medicalCaseId])`
    - 在 MedicalCase 模型添加 `formRecords FormRecord[]` 反向关联
    - 从 Admission 模型移除 `formRecords FormRecord[]` 反向关联
    - 运行 `bun run prisma:push` 同步数据库，`bun run prisma:generate` 生成客户端
    - _Bug_Condition: isBugCondition(input) where input.foreignKey = "admissionId" AND input.relatedModel = "Admission"_
    - _Expected_Behavior: FormRecord.foreignKey = "medicalCaseId" AND FormRecord.relatedModel = "MedicalCase"_
    - _Preservation: Schema 变更不影响其他模型的关联关系_
    - _Requirements: 2.1, 2.2_

  - [x] 3.2 更新 DTO（CreateFormRecordDto、FormRecordQueryDto）
    - 修改 `backend/src/modules/form-record/dto/create-form-record.dto.ts`：将 `admissionId` 改为 `medicalCaseId`
    - 修改 `backend/src/modules/form-record/dto/form-record-query.dto.ts`：将 `admissionId` 改为 `medicalCaseId`，将 `admissionNumber` 改为 `caseNumber`
    - _Bug_Condition: DTO 使用 admissionId 字段名_
    - _Expected_Behavior: DTO 使用 medicalCaseId 字段名_
    - _Preservation: DTO 的其他字段（templateId、formType、status、patientId 等）不变_
    - _Requirements: 2.4_

  - [x] 3.3 更新 FormRecordService
    - 修改 `backend/src/modules/form-record/form-record.service.ts`
    - `create()` 方法：验证 MedicalCase 存在性（替代 Admission），upsert 使用 `medicalCaseId`
    - `findByAdmissionId()` → `findByMedicalCaseId()`：按 `medicalCaseId` 查询
    - `findByAdmissionNumber()` → `findByCaseNumber()`：按 `MedicalCase.caseNumber` 查询
    - `findAll()` 方法：过滤条件从 `admission` 改为 `medicalCase`，科室过滤从 `admission.departmentId` 改为 `medicalCase.departmentId`
    - `findOne()` 方法：include 中将 `admission` 改为 `medicalCase`
    - `validateAdmissionAccess()` → `validateMedicalCaseAccess()`：直接查询 MedicalCase.departmentId
    - _Bug_Condition: Service 通过 admissionId 查询和关联 FormRecord_
    - _Expected_Behavior: Service 通过 medicalCaseId 查询和关联 FormRecord_
    - _Preservation: SINGLE_FORM upsert 逻辑、DAILY_LOG 条目追加、签名拒绝修改、分页过滤等行为不变_
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.4 更新 FormRecordController
    - 修改 `backend/src/modules/form-record/form-record.controller.ts`
    - `GET /form-records/admission/:admissionId` → `GET /form-records/medical-case/:medicalCaseId`
    - `GET /form-records/admission-number/:admissionNumber` → `GET /form-records/case-number/:caseNumber`
    - 更新方法名、参数名和 Swagger 文档
    - _Bug_Condition: Controller 端点使用 admission 相关路径和参数_
    - _Expected_Behavior: Controller 端点使用 medicalCase 相关路径和参数_
    - _Preservation: 其他端点（findAll、findOne、create、update、sign、appendEntry）不变_
    - _Requirements: 2.3, 2.4_

  - [x] 3.5 更新 Response Adapter
    - 修改 `backend/src/modules/form-record/adapters/response.adapter.ts`
    - `FormRecordListItemDto`：将 `admissionId` 改为 `medicalCaseId`，将 `admission` 改为 `medicalCase`
    - 新增 `MedicalCaseDto` 接口（id、caseNumber、scenario、departmentId、status）
    - `adapt()` 和 `adaptListItem()` 方法输出 `medicalCaseId` 和 `medicalCase`
    - _Bug_Condition: Response 包含 admissionId 字段_
    - _Expected_Behavior: Response 包含 medicalCaseId 字段_
    - _Preservation: Response 的其他字段（formData、signatures、dailyLogEntries 等）不变_
    - _Requirements: 2.4_

  - [x] 3.6 更新 DataSource Strategy 接口和实现
    - 修改 `backend/src/modules/form-record/strategies/data-source.strategy.ts`：`DataSourceContext` 中 `admissionId` 改为 `medicalCaseId`
    - 修改 `backend/src/modules/form-record/strategies/inherit.strategy.ts`：查询条件从 `admissionId` 改为 `medicalCaseId`
    - 修改 `backend/src/modules/form-record/data-source-resolver.service.ts`：`FormRecordWithRelations` 中 `admissionId` 改为 `medicalCaseId`，baseContext 使用 `medicalCaseId`
    - 修改 `backend/src/modules/form-record/strategies/admission.strategy.ts`：通过 `medicalCase.admissions[0]`（PRIMARY admission）获取房号、床号等数据
    - _Bug_Condition: DataSourceContext 使用 admissionId_
    - _Expected_Behavior: DataSourceContext 使用 medicalCaseId_
    - _Preservation: 数据源解析逻辑（继承策略、admission 策略）的输出结果不变_
    - _Requirements: 2.1, 2.3_

  - [x] 3.7 更新现有单元测试
    - 修改 `backend/src/modules/form-record/form-record.service.spec.ts`：所有 mock 数据和断言从 `admissionId` 改为 `medicalCaseId`
    - 修改 `backend/src/modules/form-record/strategies/data-source.strategy.spec.ts`：DataSourceContext mock 从 `admissionId` 改为 `medicalCaseId`
    - 确保所有现有测试通过
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.8 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - FormRecord 使用 medicalCaseId 关联 MedicalCase
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.9 Verify preservation tests still pass
    - **Property 2: Preservation** - 非关联相关行为保持不变
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - 运行 `bun run test` 确保所有测试通过
  - 确认 bug condition exploration test (task 1) 通过
  - 确认 preservation property tests (task 2) 通过
  - 确认现有单元测试 (task 3.7) 通过
  - Ensure all tests pass, ask the user if questions arise.
