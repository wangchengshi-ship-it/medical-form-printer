# Bugfix Requirements Document

## Introduction

FormRecord（表单记录/病案页）当前通过 `admissionId` 外键关联到 `Admission` 表。但在业务领域中，FormRecord 等同于"病案页"，属于 MedicalCase（病案），而非 Admission（入住记录）。一个 MedicalCase 下可能有多个 Admission（如产妇 PRIMARY + 宝宝 DEPENDENT），病案页应归属于病案整体，而不是某一条入住记录。

当前的错误关联导致：
- 语义不正确：病案页挂在入住记录下，而非病案下
- 唯一约束错误：`@@unique([admissionId, templateId, formType])` 应该是 `[medicalCaseId, templateId, formType]`
- 查询路径冗余：查询某病案的所有表单需要先查 Admission 再查 FormRecord，而非直接通过 MedicalCase 查询

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN 创建 FormRecord 时 THEN 系统要求提供 `admissionId` 并将记录关联到 Admission 表，而非 MedicalCase 表

1.2 WHEN 同一 MedicalCase 下有多个 Admission（如产妇 PRIMARY + 宝宝 DEPENDENT）时 THEN 系统的唯一约束 `@@unique([admissionId, templateId, formType])` 基于 Admission 粒度，导致同一病案下不同入住记录可以创建相同模板的表单，语义上不正确

1.3 WHEN 查询某病案的所有表单记录时 THEN 系统需要先通过 Admission 间接查询，无法直接通过 MedicalCase ID 查询

1.4 WHEN FormRecord 的 DTO（CreateFormRecordDto、FormRecordQueryDto）接收参数时 THEN 系统使用 `admissionId` 字段名，与业务语义（病案页属于病案）不一致

### Expected Behavior (Correct)

2.1 WHEN 创建 FormRecord 时 THEN 系统 SHALL 要求提供 `medicalCaseId` 并将记录关联到 MedicalCase 表

2.2 WHEN 同一 MedicalCase 下有多个 Admission 时 THEN 系统 SHALL 使用唯一约束 `@@unique([medicalCaseId, templateId, formType])`，确保同一病案下每种模板+表单类型只有一条记录

2.3 WHEN 查询某病案的所有表单记录时 THEN 系统 SHALL 支持直接通过 `medicalCaseId` 查询，无需经过 Admission 中转

2.4 WHEN FormRecord 的 DTO 接收参数时 THEN 系统 SHALL 使用 `medicalCaseId` 字段名，与业务语义保持一致

### Unchanged Behavior (Regression Prevention)

3.1 WHEN 创建 SINGLE_FORM 类型的 FormRecord 时 THEN 系统 SHALL CONTINUE TO 执行 upsert 逻辑（已存在则更新，否则创建）

3.2 WHEN 创建 DAILY_LOG 类型的 FormRecord 并提供初始条目时 THEN 系统 SHALL CONTINUE TO 正确创建 DailyLogEntry 记录

3.3 WHEN 更新已签名或已归档的 FormRecord 时 THEN 系统 SHALL CONTINUE TO 拒绝修改并抛出 BadRequestException

3.4 WHEN 查询 FormRecord 列表时 THEN 系统 SHALL CONTINUE TO 支持按 templateId、status、formType、patientId 等条件过滤和分页

3.5 WHEN 获取 FormRecord 详情时 THEN 系统 SHALL CONTINUE TO 返回完整的 AutoForm 模板数据和继承字段数据

3.6 WHEN 签名 FormRecord 时 THEN 系统 SHALL CONTINUE TO 创建签名记录并更新状态为 SIGNED

3.7 WHEN 追加 DailyLogEntry 时 THEN 系统 SHALL CONTINUE TO 验证表单类型为 DAILY_LOG 且状态未签名/归档

3.8 WHEN 用户访问 FormRecord 时 THEN 系统 SHALL CONTINUE TO 通过科室权限过滤数据（通过 MedicalCase 的 departmentId 替代原来通过 Admission 的 departmentId）

---

## Bug Condition

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type FormRecordOperation
  OUTPUT: boolean
  
  // FormRecord 的外键指向 Admission 而非 MedicalCase 时即为 bug
  RETURN X.foreignKey = "admissionId" AND X.relatedModel = "Admission"
END FUNCTION
```

## Fix Checking Property

```pascal
// Property: Fix Checking - FormRecord 关联到 MedicalCase
FOR ALL X WHERE isBugCondition(X) DO
  result ← FormRecord'(X)
  ASSERT result.foreignKey = "medicalCaseId"
    AND result.relatedModel = "MedicalCase"
    AND result.uniqueConstraint = [medicalCaseId, templateId, formType]
END FOR
```

## Preservation Property

```pascal
// Property: Preservation Checking - 非关联相关的行为保持不变
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X) = F'(X)
END FOR
```

即：所有不涉及 FormRecord 外键关联的操作（如表单数据 CRUD、签名、每日记录条目追加、权限检查逻辑等）在修复前后行为完全一致。
