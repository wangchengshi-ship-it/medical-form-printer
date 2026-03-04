# FormRecord 关联 MedicalCase 修复设计

## Overview

FormRecord（表单记录/病案页）当前通过 `admissionId` 外键关联到 `Admission` 表，但在业务领域中，病案页属于 MedicalCase（病案），而非 Admission（入住记录）。本修复将 FormRecord 的外键从 `admissionId` 改为 `medicalCaseId`，同时更新唯一约束、DTO、Service、Controller 及数据源解析策略，使数据模型与业务语义一致。

修复范围涉及：Prisma Schema、FormRecord Service、Controller、DTO、Response Adapter、DataSource Strategy 接口及实现。

## Glossary

- **Bug_Condition (C)**: FormRecord 通过 `admissionId` 外键关联到 Admission 表，而非通过 `medicalCaseId` 关联到 MedicalCase 表
- **Property (P)**: FormRecord 通过 `medicalCaseId` 外键关联到 MedicalCase 表，唯一约束基于 `[medicalCaseId, templateId, formType]`
- **Preservation**: 表单数据 CRUD、签名、每日记录条目追加、权限检查逻辑等非关联相关的行为在修复前后完全一致
- **FormRecord**: `backend/prisma/schema.prisma` 中的表单记录模型，存储病案页数据
- **MedicalCase**: `backend/prisma/schema.prisma` 中的病案模型，包含 `caseNumber`（档案号）和 `departmentId`（科室 ID）
- **Admission**: `backend/prisma/schema.prisma` 中的入住记录模型，一个 MedicalCase 下可有多个 Admission（PRIMARY + DEPENDENT）
- **DataSourceContext**: `backend/src/modules/form-record/strategies/data-source.strategy.ts` 中定义的数据源解析上下文，当前使用 `admissionId` 查询关联数据

## Bug Details

### Fault Condition

FormRecord 模型的外键 `admissionId` 指向 Admission 表，导致病案页在数据模型层面归属于入住记录而非病案。唯一约束 `@@unique([admissionId, templateId, formType])` 基于 Admission 粒度，使得同一病案下不同入住记录（如产妇 PRIMARY + 宝宝 DEPENDENT）可以创建相同模板的表单，语义上不正确。

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type FormRecordOperation
  OUTPUT: boolean

  RETURN input.model = "FormRecord"
         AND input.foreignKey = "admissionId"
         AND input.relatedModel = "Admission"
         AND input.uniqueConstraint CONTAINS "admissionId"
END FUNCTION
```

### Examples

- **创建 FormRecord 时**：当前需要传入 `admissionId`，系统将记录关联到 Admission。期望传入 `medicalCaseId`，关联到 MedicalCase。
- **唯一约束冲突**：同一 MedicalCase 下产妇（PRIMARY Admission）和宝宝（DEPENDENT Admission）各自可以创建同一模板的 SINGLE_FORM，违反"每个病案每种模板只有一条记录"的业务规则。期望 `@@unique([medicalCaseId, templateId, formType])` 阻止重复。
- **查询路径冗余**：查询某病案的所有表单需要 `FormRecord → Admission → MedicalCase`，期望直接 `FormRecord → MedicalCase`。
- **按档案号查询**：当前 `findByAdmissionNumber` 方法查询 `Admission.admissionNumber`（该字段已在 schema 中移除），应改为查询 `MedicalCase.caseNumber`。

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- SINGLE_FORM 类型的 upsert 逻辑（已存在则更新，否则创建）必须继续正常工作
- DAILY_LOG 类型的条目创建和追加逻辑不变
- 已签名或已归档的 FormRecord 拒绝修改的逻辑不变
- 按 templateId、status、formType、patientId 等条件过滤和分页不变
- FormRecord 详情返回完整 AutoForm 模板数据和继承字段数据不变
- 签名记录创建和状态更新逻辑不变
- DailyLogEntry 追加时的表单类型和状态验证不变

**Scope:**
所有不涉及 FormRecord 外键关联字段的操作应完全不受影响。具体包括：
- 表单数据（formData）的读写
- 每日记录条目（DailyLogEntry）的 CRUD
- 签名（Signature）的创建和验证
- 修改记录（Modification）的追踪
- PDF 生成和同步日志

## Hypothesized Root Cause

基于代码分析，根本原因是初始数据模型设计时将 FormRecord 直接关联到 Admission，而非 MedicalCase。具体影响的代码位置：

1. **Prisma Schema 定义错误**：`backend/prisma/schema.prisma` 中 FormRecord 模型的 `admissionId` 外键和 `@@unique([admissionId, templateId, formType])` 约束
   - FormRecord 应该有 `medicalCaseId` 字段指向 MedicalCase
   - 唯一约束应基于 `[medicalCaseId, templateId, formType]`

2. **Service 层查询路径错误**：`backend/src/modules/form-record/form-record.service.ts`
   - `create()` 方法验证 Admission 存在性，应改为验证 MedicalCase
   - `findByAdmissionId()` 按 `admissionId` 查询，应改为按 `medicalCaseId` 查询
   - `findByAdmissionNumber()` 查询 `Admission.admissionNumber`（已不存在），应改为查询 `MedicalCase.caseNumber`
   - `findAll()` 中的过滤条件通过 `admission` 关联过滤科室，应改为通过 `medicalCase` 关联
   - `validateAdmissionAccess()` 通过 Admission 获取 `departmentId`，应改为通过 MedicalCase 获取
   - upsert 的 `where` 条件使用 `unique_single_form` 约束中的 `admissionId`，需改为 `medicalCaseId`

3. **DTO 字段名错误**：
   - `CreateFormRecordDto` 使用 `admissionId` 字段
   - `FormRecordQueryDto` 使用 `admissionId` 和 `admissionNumber` 过滤字段

4. **Controller 端点语义错误**：
   - `GET /form-records/admission/:admissionId` 应改为 `GET /form-records/medical-case/:medicalCaseId`
   - `GET /form-records/admission-number/:admissionNumber` 应改为 `GET /form-records/case-number/:caseNumber`

5. **Response Adapter 字段错误**：
   - `FormRecordListItemDto` 和 `FormRecordDetailDto` 包含 `admissionId` 字段，应改为 `medicalCaseId`
   - `AdmissionDto` 引用 `admissionNumber`（schema 中已不存在）

6. **DataSource Strategy 上下文错误**：
   - `DataSourceContext` 接口使用 `admissionId`，应改为 `medicalCaseId`
   - `InheritDataSourceStrategy` 按 `admissionId` 查询关联表单，应改为按 `medicalCaseId`
   - `DataSourceResolverService` 中的 `FormRecordWithRelations` 接口使用 `admissionId`

## Correctness Properties

Property 1: Fault Condition - FormRecord 关联到 MedicalCase

_For any_ FormRecord 操作（创建、查询、upsert），当 bug 条件成立（外键指向 Admission）时，修复后的系统 SHALL 使用 `medicalCaseId` 外键关联到 MedicalCase 表，唯一约束为 `@@unique([medicalCaseId, templateId, formType])`，所有 DTO 和 API 端点使用 `medicalCaseId` 字段名。

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - 非关联相关行为不变

_For any_ 不涉及 FormRecord 外键关联的操作（表单数据 CRUD、签名、每日记录条目追加、状态验证、权限检查），修复后的系统 SHALL 产生与修复前完全相同的行为，保留所有现有的业务逻辑和数据验证规则。

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**


## Fix Implementation

### Changes Required

假设根因分析正确，以下是需要修改的文件和具体变更：

**File**: `backend/prisma/schema.prisma`

**Model**: `FormRecord`

**Specific Changes**:
1. **替换外键字段**：将 `admissionId String` 改为 `medicalCaseId String`
2. **替换关联关系**：将 `admission Admission @relation(...)` 改为 `medicalCase MedicalCase @relation(...)`
3. **更新唯一约束**：将 `@@unique([admissionId, templateId, formType])` 改为 `@@unique([medicalCaseId, templateId, formType])`
4. **更新索引**：将 `@@index([admissionId])` 改为 `@@index([medicalCaseId])`
5. **更新 MedicalCase 模型**：添加 `formRecords FormRecord[]` 反向关联
6. **更新 Admission 模型**：移除 `formRecords FormRecord[]` 反向关联

---

**File**: `backend/src/modules/form-record/dto/create-form-record.dto.ts`

**Schema**: `CreateFormRecordSchema`

**Specific Changes**:
1. **替换字段名**：将 `admissionId` 改为 `medicalCaseId`，描述改为 `'病案 ID（关联 MedicalCase）'`

---

**File**: `backend/src/modules/form-record/dto/form-record-query.dto.ts`

**Schema**: `FormRecordQuerySchema`

**Specific Changes**:
1. **替换过滤字段**：将 `admissionId` 改为 `medicalCaseId`，描述改为 `'病案 ID'`
2. **替换档案号字段**：将 `admissionNumber` 改为 `caseNumber`，描述改为 `'档案号（模糊搜索）'`

---

**File**: `backend/src/modules/form-record/form-record.service.ts`

**Class**: `FormRecordService`

**Specific Changes**:
1. **`findAll()` 方法**：
   - 解构 `query` 时将 `admissionId` 改为 `medicalCaseId`，`admissionNumber` 改为 `caseNumber`
   - 过滤条件从 `admission` 关联改为 `medicalCase` 关联
   - 科室过滤从 `admission.departmentId` 改为 `medicalCase.departmentId`
   - include 中将 `admission` 改为 `medicalCase`，通过 `medicalCase.admissions` 获取患者信息

2. **`findByAdmissionId()` → `findByMedicalCaseId()`**：
   - 方法重命名
   - 参数从 `admissionId` 改为 `medicalCaseId`
   - 查询条件从 `{ admissionId }` 改为 `{ medicalCaseId }`
   - 验证访问权限从 `validateAdmissionAccess` 改为 `validateMedicalCaseAccess`

3. **`findByAdmissionNumber()` → `findByCaseNumber()`**：
   - 方法重命名
   - 查询 `MedicalCase.caseNumber` 而非 `Admission.admissionNumber`

4. **`findOne()` 方法**：
   - include 中将 `admission` 改为 `medicalCase`（通过 medicalCase 的 admissions 获取患者信息）
   - 访问权限验证改为通过 `medicalCase.departmentId`

5. **`create()` 方法**：
   - 验证 MedicalCase 存在性（替代 Admission）
   - upsert 的 `where` 条件使用 `medicalCaseId`
   - create/update 数据使用 `medicalCaseId`

6. **`validateAdmissionAccess()` → `validateMedicalCaseAccess()`**：
   - 直接查询 `MedicalCase.departmentId`（无需经过 Admission 中转）

7. **`buildDepartmentFilter()` 方法**：无需修改（逻辑不变）

---

**File**: `backend/src/modules/form-record/form-record.controller.ts`

**Class**: `FormRecordController`

**Specific Changes**:
1. **替换端点路径**：`GET /form-records/admission/:admissionId` → `GET /form-records/medical-case/:medicalCaseId`
2. **替换端点路径**：`GET /form-records/admission-number/:admissionNumber` → `GET /form-records/case-number/:caseNumber`
3. **更新方法名和参数名**：`findByAdmissionId` → `findByMedicalCaseId`，`findByAdmissionNumber` → `findByCaseNumber`
4. **更新 Swagger 文档**：ApiOperation、ApiParam 描述更新

---

**File**: `backend/src/modules/form-record/adapters/response.adapter.ts`

**Specific Changes**:
1. **`FormRecordListItemDto` 接口**：将 `admissionId` 改为 `medicalCaseId`，将 `admission?: AdmissionDto` 改为 `medicalCase?: MedicalCaseDto`
2. **`FormRecordDetailDto` 接口**：继承自更新后的 `FormRecordListItemDto`
3. **新增 `MedicalCaseDto` 接口**：包含 `id`、`caseNumber`、`scenario`、`departmentId`、`status`
4. **`adapt()` 和 `adaptListItem()` 方法**：输出 `medicalCaseId` 和 `medicalCase` 字段
5. **新增 `adaptMedicalCase()` 方法**：转换 MedicalCase 数据
6. **`AdmissionDto` 接口**：移除 `admissionNumber` 字段（schema 中已不存在），或保留但从 MedicalCase.caseNumber 获取

---

**File**: `backend/src/modules/form-record/strategies/data-source.strategy.ts`

**Interface**: `DataSourceContext`

**Specific Changes**:
1. **替换字段**：将 `admissionId: string` 改为 `medicalCaseId: string`

---

**File**: `backend/src/modules/form-record/strategies/inherit.strategy.ts`

**Class**: `InheritDataSourceStrategy`

**Specific Changes**:
1. **`resolve()` 方法**：解构时将 `admissionId` 改为 `medicalCaseId`
2. **查询条件**：`prisma.formRecord.findFirst({ where: { admissionId, ... } })` 改为 `{ where: { medicalCaseId, ... } }`

---

**File**: `backend/src/modules/form-record/data-source-resolver.service.ts`

**Specific Changes**:
1. **`FormRecordWithRelations` 接口**：将 `admissionId` 改为 `medicalCaseId`，添加 `medicalCase` 关联类型
2. **`resolveInheritedFields()` 和 `resolveFromFieldConfig()` 方法**：baseContext 中将 `admissionId` 改为 `medicalCaseId`
3. **保留 admission 数据源策略**：admission 策略仍然需要从 Admission 获取房号、床号等数据，但需要通过 MedicalCase → Admission 路径获取

---

**File**: `backend/src/modules/form-record/strategies/admission.strategy.ts`

**Class**: `AdmissionDataSourceStrategy`

**Specific Changes**:
1. **数据获取路径调整**：admission 数据需要从 `medicalCase.admissions[0]`（PRIMARY admission）获取，而非直接从 `admission` 获取
2. **DataSourceContext 中的 admission 字段**：保留但数据来源改为通过 MedicalCase 关联获取

---

**File**: `backend/src/modules/form-record/form-record.service.spec.ts`

**Specific Changes**:
1. **所有 mock 数据**：将 `admissionId` 替换为 `medicalCaseId`
2. **mock Prisma 方法**：添加 `medicalCase` 相关 mock，移除 `admission.findUnique` 相关 mock
3. **测试用例名称和断言**：更新为 `medicalCaseId` 相关

---

**File**: `backend/src/modules/form-record/strategies/data-source.strategy.spec.ts`

**Specific Changes**:
1. **所有 DataSourceContext mock**：将 `admissionId` 替换为 `medicalCaseId`

## Testing Strategy

### Validation Approach

测试策略分两阶段：首先在未修复代码上验证 bug 存在，然后验证修复后的正确性和行为保留。

### Exploratory Fault Condition Checking

**Goal**: 在实施修复前，验证 bug 确实存在。确认或否定根因分析。

**Test Plan**: 编写测试验证 FormRecord 当前使用 `admissionId` 关联 Admission，以及唯一约束基于 Admission 粒度。在未修复代码上运行以观察问题。

**Test Cases**:
1. **Schema 验证测试**：验证 FormRecord 模型包含 `admissionId` 字段而非 `medicalCaseId`（在未修复代码上通过）
2. **唯一约束测试**：验证同一 MedicalCase 下不同 Admission 可以创建相同模板的 SINGLE_FORM（在未修复代码上通过，但语义错误）
3. **DTO 字段测试**：验证 CreateFormRecordDto 接受 `admissionId` 而非 `medicalCaseId`（在未修复代码上通过）
4. **查询路径测试**：验证 `findByAdmissionNumber` 查询 `Admission.admissionNumber`（在未修复代码上因字段不存在而失败）

**Expected Counterexamples**:
- 同一 MedicalCase 下两个不同 Admission 可以各自创建同一模板的 SINGLE_FORM
- `findByAdmissionNumber` 因 `Admission.admissionNumber` 字段不存在而运行时错误

### Fix Checking

**Goal**: 验证所有满足 bug 条件的输入，修复后的函数产生期望行为。

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := FormRecordService_fixed(input)
  ASSERT result.foreignKey = "medicalCaseId"
    AND result.relatedModel = "MedicalCase"
    AND result.uniqueConstraint = [medicalCaseId, templateId, formType]
END FOR
```

### Preservation Checking

**Goal**: 验证所有不满足 bug 条件的输入，修复后的函数与原函数行为一致。

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT FormRecordService_original(input) = FormRecordService_fixed(input)
END FOR
```

**Testing Approach**: 推荐使用 property-based testing（fast-check）进行保留性检查，因为：
- 自动生成大量测试用例覆盖输入域
- 捕获手动单元测试可能遗漏的边界情况
- 对非 bug 输入的行为不变提供强保证

**Test Plan**: 先在未修复代码上观察非 bug 输入的行为，然后编写 property-based 测试捕获该行为。

**Test Cases**:
1. **SINGLE_FORM Upsert 保留**：验证 SINGLE_FORM 类型的 upsert 逻辑在修复后仍然正确（已存在则更新，否则创建）
2. **DAILY_LOG 条目追加保留**：验证 DAILY_LOG 类型的条目创建和追加在修复后不变
3. **签名拒绝保留**：验证已签名/已归档记录拒绝修改的逻辑不变
4. **分页过滤保留**：验证按 templateId、status、formType 等条件过滤和分页不变

### Unit Tests

- 测试 `create()` 方法验证 MedicalCase 存在性（替代 Admission）
- 测试 `findByMedicalCaseId()` 按 `medicalCaseId` 查询
- 测试 `findByCaseNumber()` 按 `MedicalCase.caseNumber` 查询
- 测试 `findAll()` 通过 `medicalCase.departmentId` 过滤科室
- 测试 upsert 使用 `medicalCaseId` 唯一约束
- 测试 `validateMedicalCaseAccess()` 通过 MedicalCase 获取 departmentId

### Property-Based Tests

- 生成随机 `medicalCaseId` + `templateId` + `formType` 组合，验证唯一约束正确性
- 生成随机表单数据，验证 CRUD 操作在修复后行为一致
- 生成随机 DataSourceContext（使用 `medicalCaseId`），验证继承策略正确查询关联表单
- 生成随机非 bug 输入（更新 formData、追加条目、签名），验证行为保留

### Integration Tests

- 测试完整的 FormRecord 创建流程：MedicalCase → FormRecord
- 测试同一 MedicalCase 下唯一约束阻止重复 SINGLE_FORM
- 测试按 `caseNumber` 查询返回正确的 FormRecord 列表
- 测试科室权限过滤通过 MedicalCase.departmentId 正确工作
