# Admission 与 AdmissionUnit 合并 Bugfix Design

## Overview

`Admission` 和 `AdmissionUnit` 两张表描述同一概念"患者入住"，但被拆分为"医疗维度"和"运营维度"两个模型。本次修复将两表合并为统一的 `Admission` 模型，消除数据冗余、跨表 join 和多表同步不一致风险。

合并策略：保留 `Admission` 表名，将 `AdmissionUnit` 的运营字段（`currentBedId`、`stayDurationTier`、`babyCount`、`scenario`、`departmentId` 等）和关联关系（`BedAssignment`、`Quote`、`Deposit`、`Settlement`、`AdmissionUnitBaby`）迁移到 `Admission`。废弃 `AdmissionUnit` 模型和 `AdmissionStatus` 枚举，统一使用 `AdmissionUnitStatus`（重命名为 `AdmissionStatus`）的完整生命周期。

## Glossary

- **Bug_Condition (C)**: 同一次入住同时存在 Admission 和 AdmissionUnit 两条记录，共享 `medicalCaseId`、`patientId`、`createdBy` 等字段
- **Property (P)**: 一次入住只产生一条统一的 Admission 记录，包含医疗维度和运营维度的所有字段和关联
- **Preservation**: 合并后所有现有业务流程（状态机生命周期、房间查询、表单记录关联、换房、出院结算、取消入住、分页筛选）行为不变
- **Admission（合并后）**: 统一入住记录，包含原 Admission 的 `role`、`formRecords` 和原 AdmissionUnit 的 `currentBedId`、`stayDurationTier`、`babyCount`、`quotes`、`deposits`、`settlement`、`bedAssignments`、`babies` 等
- **AdmissionUnitService**: `backend/src/modules/admission-unit/admission-unit.service.ts` 中管理入住单元生命周期的服务
- **AdmissionService**: `backend/src/modules/admission/admission.service.ts` 中提供入住记录查询的服务
- **AdmissionUnitStatus**: 入住完整生命周期枚举 `PENDING → QUOTED → DEPOSITED → ACTIVE → DISCHARGED / CANCELLED`

## Bug Details

### Fault Condition

当系统创建一次新入住时，`AdmissionUnitService.createWithMedicalCase` 在同一事务中同时创建 `Admission`（医疗维度）和 `AdmissionUnit`（运营维度）两条记录。两者共享 `medicalCaseId`、`patientId` 等字段，但关联关系被分散：`FormRecord` 关联 `Admission`，而 `BedAssignment`、`Quote`、`Deposit`、`Settlement` 关联 `AdmissionUnit`。查询完整入住信息需要跨表 join，更新共享字段存在不一致风险。

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type CreateAdmissionRequest
  OUTPUT: boolean

  // 任何创建入住的请求都会触发 bug：同时创建两条冗余记录
  RETURN EXISTS admission IN Admission WHERE admission.medicalCaseId = input.medicalCaseId
         AND EXISTS admissionUnit IN AdmissionUnit WHERE admissionUnit.medicalCaseId = input.medicalCaseId
         AND admission.patientId = admissionUnit.patientId
END FUNCTION
```

### Examples

- 产康场景创建入住：系统创建 1 条 MedicalCase + 2 条 Admission（产妇 PRIMARY + 宝宝 DEPENDENT）+ 1 条 AdmissionUnit，前端需要同时持有 `admissionId`（表单操作）和 `admissionUnitId`（计费操作）
- 查询房间列表：`AdmissionService.getRooms` 通过 `Room → BedItem → currentAdmissionUnits` 查询，但表单记录在 `Admission` 上，需要额外通过 `medicalCase.admissions` 关联
- 出院操作：`AdmissionUnitService.discharge` 更新 `AdmissionUnit.status = DISCHARGED`，但还需要同步更新对应 `Admission.status = DISCHARGED` 和 `Admission.dischargeTime`，存在不一致风险
- 通用场景创建入住：同样创建 1 条 Admission + 1 条 AdmissionUnit，即使没有宝宝也存在双表冗余

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- 产康场景下一个病案包含多个入住记录（产妇 PRIMARY + 宝宝 DEPENDENT），通过 `role` 字段区分
- 入住完整生命周期 `PENDING → QUOTED → DEPOSITED → ACTIVE → DISCHARGED`，XState 状态机逻辑不变
- 房间列表查询返回每个房间的活跃入住信息，包含患者、宝宝、病案等关联数据
- `FormRecord.admissionId` 外键关系保持不变
- 换房操作正确结束旧 BedAssignment、释放旧床位、创建新 BedAssignment、占用新床位
- 出院结算正确计算实际费用、生成结算单、释放床位
- 取消入住仅允许 PENDING/QUOTED/DEPOSITED 状态，正确释放已预留床位
- 分页筛选支持按状态、场景、科室、患者查询

**Scope:**
所有不涉及数据模型层的业务逻辑应完全不受影响。合并是纯粹的数据模型重构，API 端点路径、请求/响应 DTO 结构、状态机事件和转换规则、权限控制等均保持不变。

## Hypothesized Root Cause

基于代码分析，根本原因是早期架构设计将"入住"概念拆分为两个维度：

1. **过度分离的领域模型**: `Admission` 被设计为"医疗维度"（关联 `FormRecord`），`AdmissionUnit` 被设计为"运营维度"（关联 `BedAssignment`、`Quote`、`Deposit`、`Settlement`）。实际上两者描述的是同一个业务实体。

2. **字段冗余**: 两表共享 `medicalCaseId`、`patientId`、`dischargeTime`、`status`（虽然枚举不同）、`createdBy` 等字段，违反了数据库范式。

3. **状态枚举分裂**: `AdmissionStatus`（ACTIVE/DISCHARGED/TRANSFERRED）和 `AdmissionUnitStatus`（PENDING/QUOTED/DEPOSITED/ACTIVE/DISCHARGED/CANCELLED）描述同一实体的生命周期，但粒度不同，导致状态同步困难。

4. **关联关系分散**: `FormRecord → Admission` 和 `BedAssignment/Quote/Deposit/Settlement → AdmissionUnit`，查询完整入住信息必须跨两张表。

## Correctness Properties

Property 1: Fault Condition - 单一入住记录

_For any_ 创建入住请求，合并后的系统 SHALL 只创建一条统一的 `Admission` 记录（不再创建 `AdmissionUnit`），该记录包含医疗维度字段（`role`）和运营维度字段（`currentBedId`、`stayDurationTier`、`babyCount`、`scenario`、`departmentId`），且所有关联关系（`formRecords`、`bedAssignments`、`quotes`、`deposits`、`settlement`、`babies`）均指向该单一记录。

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - 业务流程行为不变

_For any_ 不涉及数据模型内部结构的业务操作（状态转换、房间查询、表单记录关联、换房、出院结算、取消入住、分页筛选），合并后的系统 SHALL 产生与合并前完全相同的业务结果，保持所有 API 端点的请求/响应契约不变。

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

## Fix Implementation

### Changes Required

假设根因分析正确：

**File**: `backend/prisma/schema.prisma`

**Specific Changes**:

1. **合并 Admission 模型**: 将 `AdmissionUnit` 的字段合并到 `Admission`
   - 新增字段: `currentBedId`、`stayDurationTier`、`babyCount`、`scenario`、`departmentId`、`checkInTime`
   - 将 `status` 类型从 `AdmissionStatus` 改为 `AdmissionUnitStatus`（后续重命名）
   - 将 `admissionTime` 语义对齐为创建时间（保留）
   - 新增关联: `currentBed`、`babies`、`bedAssignments`、`quotes`、`deposits`、`settlement`

2. **废弃 AdmissionUnit 模型**: 删除 `AdmissionUnit` 模型定义

3. **废弃 AdmissionStatus 枚举**: 删除旧的 `AdmissionStatus`（ACTIVE/DISCHARGED/TRANSFERRED），统一使用 `AdmissionUnitStatus` 并重命名为 `AdmissionStatus`

4. **更新关联模型外键**: 将 `BedAssignment`、`Quote`、`Deposit`、`Settlement`、`AdmissionUnitBaby` 的 `admissionUnitId` 改为 `admissionId`

5. **更新 Patient 模型**: 移除 `admissionUnits` 关联，保留 `admissions`

6. **更新 MedicalCase 模型**: 移除 `admissionUnits` 关联，保留 `admissions`

7. **更新 BedItem 模型**: 将 `currentAdmissionUnits` 改为 `currentAdmissions`

---

**File**: `backend/src/modules/admission-unit/admission-unit.service.ts`

**Specific Changes**:

1. **简化 createWithMedicalCase**: 移除创建 `AdmissionUnit` 的步骤，将运营字段直接写入 `Admission` 创建语句。产妇 PRIMARY 的 Admission 包含 `currentBedId`、`stayDurationTier` 等运营字段；宝宝 DEPENDENT 的 Admission 不包含运营字段（仅关联 medicalCase）

2. **更新所有方法中的 Prisma 查询**: 将 `tx.admissionUnit.xxx` 改为 `tx.admission.xxx`，更新 include/where 条件中的字段名

3. **更新 AdmissionUnitBaby 关联**: 将 `admissionUnitId` 改为 `admissionId`

---

**File**: `backend/src/modules/admission/admission.service.ts`

**Specific Changes**:

1. **简化 getRooms**: 从 `Room → BedItem → currentAdmissions`（原 `currentAdmissionUnits`）查询，不再需要通过 `medicalCase.admissions` 间接获取

2. **合并查询逻辑**: `findActiveAdmissions` 和 `findOne` 直接从 `Admission` 获取所有关联数据

---

**File**: `backend/src/modules/admission-unit/machines/admission-unit.machine.ts`

**Specific Changes**:

1. **重命名**: 文件和类型名从 `admissionUnit` 改为 `admission`（可选，可在后续重构中完成）
2. **状态枚举引用**: 从 `AdmissionUnitStatus` 改为新的 `AdmissionStatus`

---

**File**: `backend/src/modules/admission-unit/dto/*.ts`

**Specific Changes**:

1. **更新响应 DTO**: 将 `admissionUnitId` 字段改为 `admissionId`
2. **更新查询 DTO**: 字段名对齐

---

**File**: 前端相关文件

**Specific Changes**:

1. **统一 ID 引用**: 将所有 `admissionUnitId` 替换为 `admissionId`
2. **简化数据获取**: 不再需要同时请求两个实体

## Testing Strategy

### Validation Approach

测试策略分两阶段：首先在未修复代码上验证 bug 存在（探索性测试），然后验证修复后行为正确且现有功能不受影响。

### Exploratory Fault Condition Checking

**Goal**: 在未修复代码上验证双表冗余问题确实存在，确认根因分析。

**Test Plan**: 编写测试调用 `createWithMedicalCase`，验证同一次入住确实创建了 Admission 和 AdmissionUnit 两条记录。在未修复代码上运行以观察冗余行为。

**Test Cases**:
1. **双表创建验证**: 调用 `createWithMedicalCase` 后，验证 `admission` 表和 `admissionUnit` 表各有对应记录（将在未修复代码上通过，证明冗余存在）
2. **跨表查询验证**: 查询完整入住信息需要分别查询两张表（将在未修复代码上通过，证明 join 必要性）
3. **状态不一致验证**: 模拟只更新 `AdmissionUnit.status` 而不更新 `Admission.status` 的场景（将在未修复代码上通过，证明不一致风险）

**Expected Counterexamples**:
- `createWithMedicalCase` 返回的 `admissionIds` 和 `admissionUnitId` 是不同表的 ID
- 通过 `admissionId` 无法获取 `BedAssignment`、`Quote` 等运营数据

### Fix Checking

**Goal**: 验证合并后，所有入住操作只涉及单一 `Admission` 表。

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := createWithMedicalCase_fixed(input)
  ASSERT result.admissionId EXISTS IN admissions table
  ASSERT NOT EXISTS admissionUnit WHERE medicalCaseId = result.medicalCaseId
  ASSERT admission.currentBedId IS NOT NULL
  ASSERT admission.stayDurationTier = input.stayDurationTier
  ASSERT FormRecord CAN BE CREATED WITH admission.id
  ASSERT Quote CAN BE CREATED WITH admission.id
END FOR
```

### Preservation Checking

**Goal**: 验证合并后所有现有业务流程行为不变。

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT createAndGoThroughLifecycle_original(input) = createAndGoThroughLifecycle_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing（fast-check）推荐用于 preservation checking，因为：
- 自动生成多种入住场景（产康/通用、不同宝宝数、不同状态转换路径）
- 捕获手动测试可能遗漏的边界情况
- 强保证所有非 bug 输入的行为不变

**Test Plan**: 先在未修复代码上观察各业务流程的行为，然后编写 property-based 测试验证修复后行为一致。

**Test Cases**:
1. **状态机生命周期 Preservation**: 验证 PENDING → QUOTED → DEPOSITED → ACTIVE → DISCHARGED 完整流程在合并后行为一致
2. **房间查询 Preservation**: 验证 `getRooms` 返回的数据结构和内容在合并后不变
3. **表单记录关联 Preservation**: 验证 `FormRecord.admissionId` 外键在合并后仍然正确工作
4. **换房操作 Preservation**: 验证换房后 BedAssignment 记录和床位状态在合并后不变
5. **取消入住 Preservation**: 验证 PENDING/QUOTED/DEPOSITED 状态取消后床位释放行为不变

### Unit Tests

- 测试合并后 `createWithMedicalCase` 只创建 Admission 记录，不创建 AdmissionUnit
- 测试合并后 Admission 包含所有运营字段（currentBedId、stayDurationTier、babyCount）
- 测试合并后所有关联关系（BedAssignment、Quote、Deposit、Settlement）指向 Admission
- 测试产康场景下 PRIMARY/DEPENDENT 角色区分正确
- 测试通用场景下无宝宝的入住创建正确

### Property-Based Tests

- 生成随机入住场景（产康/通用 × 不同宝宝数 × 不同床位），验证合并后单一记录包含所有数据
- 生成随机状态转换序列，验证 XState 状态机在合并后的 Admission 上行为一致
- 生成随机查询参数（状态、场景、科室、患者），验证分页筛选结果结构不变

### Integration Tests

- 测试完整入住流程：创建 → 报价 → 缴押金 → 入住 → 换房 → 出院结算
- 测试创建入住后立即创建表单记录，验证 admissionId 关联正确
- 测试取消入住后床位状态恢复为 AVAILABLE
