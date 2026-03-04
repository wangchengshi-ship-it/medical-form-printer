# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - 双表冗余：同一次入住创建 Admission + AdmissionUnit 两条记录
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: 使用 fast-check 生成随机入住请求（产康/通用场景 × 不同宝宝数），验证 `createWithMedicalCase` 后数据库中只存在 Admission 记录，不存在 AdmissionUnit 记录
  - 测试文件: `backend/src/modules/admission-unit/__tests__/admission-merge.fault.spec.ts`
  - Bug condition from design: `isBugCondition(input)` — 任何创建入住的请求都会同时创建 Admission 和 AdmissionUnit 两条冗余记录
  - 使用 fast-check `fc.record()` 生成随机入住参数（scenario、stayDurationTier、babyCount、bedId 等）
  - 调用 `createWithMedicalCase` 后断言：
    - `prisma.admission.count({ where: { medicalCaseId } })` 返回预期数量（产康=2，通用=1）
    - `prisma.admissionUnit.count({ where: { medicalCaseId } })` 返回 0（不存在 AdmissionUnit 记录）
    - 合并后的 Admission 记录包含 `currentBedId`、`stayDurationTier`、`babyCount` 等运营字段
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS（因为未修复代码会创建 AdmissionUnit 记录，且 Admission 不包含运营字段）
  - Document counterexamples found（例如 `createWithMedicalCase({scenario: 'POSTPARTUM', ...})` 创建了 1 条 AdmissionUnit + 2 条 Admission）
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - 业务流程行为不变
  - **IMPORTANT**: Follow observation-first methodology
  - 测试文件: `backend/src/modules/admission-unit/__tests__/admission-merge.preservation.spec.ts`
  - **Observation Phase** (在未修复代码上运行):
    - Observe: `createWithMedicalCase` 产康场景创建后，通过 medicalCase 可获取 PRIMARY + DEPENDENT 两个 Admission
    - Observe: 状态机 PENDING → QUOTED → DEPOSITED → ACTIVE → DISCHARGED 完整生命周期正常执行
    - Observe: `getRooms` 返回房间列表包含活跃入住信息（患者、宝宝、病案）
    - Observe: `FormRecord` 通过 `admissionId` 正确关联
    - Observe: 取消入住仅允许 PENDING/QUOTED/DEPOSITED 状态
  - **Property-Based Tests** (使用 fast-check):
    - Property 2a: _For all_ 产康入住请求，一个病案下始终包含 PRIMARY + DEPENDENT 角色的入住记录，通过 `role` 字段区分
    - Property 2b: _For all_ 合法状态转换序列（从 `getAllowedEvents` 生成），状态机转换结果与预期一致
    - Property 2c: _For all_ 可取消状态（PENDING/QUOTED/DEPOSITED），取消操作成功且释放床位；_For all_ 不可取消状态（ACTIVE/DISCHARGED），取消操作被拒绝
  - Verify tests PASS on UNFIXED code（确认基线行为）
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 3. Fix: 合并 Admission 与 AdmissionUnit 表

  - [x] 3.1 合并 Prisma Schema
    - 将 `AdmissionUnit` 的字段合并到 `Admission` 模型：`currentBedId`、`stayDurationTier`、`babyCount`、`scenario`、`departmentId`、`checkInTime`
    - 将 `Admission.status` 类型从 `AdmissionStatus` 改为 `AdmissionUnitStatus`（后续重命名为 `AdmissionStatus`）
    - 新增关联: `currentBed`、`babies`、`bedAssignments`、`quotes`、`deposits`、`settlement`
    - 更新 `BedAssignment`、`Quote`、`Deposit`、`Settlement`、`AdmissionUnitBaby` 的外键从 `admissionUnitId` 改为 `admissionId`
    - 更新 `BedItem.currentAdmissionUnits` 改为 `currentAdmissions`
    - 删除 `AdmissionUnit` 模型定义
    - 废弃旧 `AdmissionStatus` 枚举，统一使用 `AdmissionUnitStatus` 重命名为 `AdmissionStatus`
    - 更新 `Patient` 和 `MedicalCase` 模型：移除 `admissionUnits` 关联
    - _Bug_Condition: isBugCondition(input) — 同一次入住同时存在 Admission 和 AdmissionUnit 两条记录_
    - _Expected_Behavior: 一次入住只产生一条统一的 Admission 记录，包含医疗和运营维度所有字段_
    - _Preservation: 所有关联模型的外键正确指向合并后的 Admission_
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 更新 AdmissionUnitService
    - 简化 `createWithMedicalCase`: 移除创建 `AdmissionUnit` 的步骤，将运营字段（`currentBedId`、`stayDurationTier`、`babyCount`、`scenario`、`departmentId`）直接写入 PRIMARY Admission 创建语句
    - 更新所有方法中的 Prisma 查询: `tx.admissionUnit.xxx` → `tx.admission.xxx`
    - 更新 `generateQuote`、`payDeposit`、`checkIn`、`transfer`、`discharge`、`cancel` 方法中的查询和更新逻辑
    - 更新 `findOne`、`findAll` 方法的 include/where 条件
    - 将 `AdmissionUnitBaby` 关联中的 `admissionUnitId` 改为 `admissionId`
    - _Bug_Condition: createWithMedicalCase 同时创建 Admission + AdmissionUnit_
    - _Expected_Behavior: createWithMedicalCase 只创建 Admission 记录，包含所有运营字段_
    - _Preservation: 所有业务方法（报价、押金、入住、换房、出院、取消）行为不变_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.5, 3.6, 3.7_

  - [x] 3.3 更新 AdmissionService
    - 简化 `getRooms`: 从 `Room → BedItem → currentAdmissions`（原 `currentAdmissionUnits`）查询
    - 更新 `ADMISSION_UNIT_WITH_DETAILS_INCLUDE` 为 `ADMISSION_WITH_DETAILS_INCLUDE`
    - 更新 `RoomWithAdmissionUnitsPayload` 类型为 `RoomWithAdmissionsPayload`
    - 更新 `RoomResponse.admissionUnits` 为 `RoomResponse.admissions`（或保持字段名兼容）
    - 合并 `findActiveAdmissions` 和 `findOne` 查询逻辑，直接从 Admission 获取所有关联数据
    - _Bug_Condition: getRooms 需要通过 AdmissionUnit 间接查询_
    - _Expected_Behavior: getRooms 直接通过 Admission 查询，无需跨表 join_
    - _Preservation: getRooms 返回的数据结构和内容不变_
    - _Requirements: 2.2, 3.3_

  - [x] 3.4 更新状态机和 DTO
    - 更新 `admission-unit.machine.ts`: 将 `AdmissionUnitStatus` 引用改为新的 `AdmissionStatus`（枚举重命名后）
    - 更新 `AdmissionUnitMachineContext.admissionUnitId` 为 `admissionId`
    - 更新 DTO 文件中的 `admissionUnitId` 字段为 `admissionId`
    - 更新 Controller 中的路由参数和响应映射
    - _Preservation: 状态机转换规则和事件不变，仅更新类型引用_
    - _Requirements: 3.2, 3.8_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - 单一入住记录
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES（确认合并后 `createWithMedicalCase` 只创建 Admission 记录，不再创建 AdmissionUnit）
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - 业务流程行为不变
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS（确认合并后所有业务流程行为不变）
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - 运行完整测试套件: `bun run test`
  - 确认 fault condition 测试通过（Property 1）
  - 确认 preservation 测试通过（Property 2）
  - 确认现有单元测试和集成测试无回归
  - Ensure all tests pass, ask the user if questions arise.
