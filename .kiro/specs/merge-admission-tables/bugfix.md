# Bugfix Requirements Document

## Introduction

`Admission` 和 `AdmissionUnit` 两张表描述的是同一个概念——"患者入住"，但被拆分为"医疗维度"和"运营维度"两个模型。两表共享 `medicalCaseId`、`patientId`、`dischargeTime`、`status`、`createdBy` 等字段，同一次入住需要同时维护两条记录。查询完整入住信息需要 join 两张表，增加了不必要的复杂度。

**影响范围：**
- `AdmissionUnitService.createWithMedicalCase` 在同一事务中同时创建 Admission 和 AdmissionUnit 记录
- `AdmissionService.getRooms` 查询房间时需要通过 `AdmissionUnit` 获取床位信息，而表单记录又关联在 `Admission` 上
- `FormRecord` 通过 `admissionId` 关联 `Admission`，而 `BedAssignment`、`Quote`、`Deposit`、`Settlement` 通过 `admissionUnitId` 关联 `AdmissionUnit`
- 前端需要同时处理两个不同的 ID（admissionId 和 admissionUnitId）来获取完整数据

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN 创建一次新入住时 THEN 系统在同一事务中创建两条概念重叠的记录（Admission + AdmissionUnit），两者共享 medicalCaseId、patientId、createdBy 等字段，造成数据冗余

1.2 WHEN 查询某次入住的完整信息（包含表单记录和计费数据）时 THEN 系统需要分别查询 Admission（获取 formRecords）和 AdmissionUnit（获取 bedAssignments、quotes、deposits、settlement），无法通过单一实体获取

1.3 WHEN Admission 和 AdmissionUnit 的共享字段（如 dischargeTime、status）需要更新时 THEN 系统需要分别更新两张表，存在数据不一致的风险（例如 AdmissionUnit 已 DISCHARGED 但 Admission 仍为 ACTIVE）

1.4 WHEN 前端需要展示入住详情时 THEN 需要同时持有 admissionId（用于表单记录操作）和 admissionUnitId（用于计费和床位操作），增加了前端状态管理的复杂度

### Expected Behavior (Correct)

2.1 WHEN 创建一次新入住时 THEN 系统 SHALL 只创建一条统一的入住记录（合并后的 Admission），包含医疗维度（role、formRecords）和运营维度（currentBedId、stayDurationTier、babyCount、quotes、deposits 等）的所有字段

2.2 WHEN 查询某次入住的完整信息时 THEN 系统 SHALL 通过单一实体（合并后的 Admission）即可获取表单记录、床位分配、报价、押金、结算等所有关联数据，无需跨表 join

2.3 WHEN 入住状态或出院时间等字段需要更新时 THEN 系统 SHALL 只更新一条记录，消除多表同步导致的数据不一致风险

2.4 WHEN 前端需要展示入住详情或执行操作时 THEN 系统 SHALL 只需要一个 admissionId 即可完成所有表单记录和计费相关操作

### Unchanged Behavior (Regression Prevention)

3.1 WHEN 产康场景创建入住时 THEN 系统 SHALL CONTINUE TO 支持一个病案下包含多个入住记录（产妇 PRIMARY + 宝宝 DEPENDENT），通过 role 字段区分

3.2 WHEN 入住单元经历完整生命周期（PENDING → QUOTED → DEPOSITED → ACTIVE → DISCHARGED）时 THEN 系统 SHALL CONTINUE TO 正确执行每个阶段的业务逻辑（报价、押金、入住、出院结算）

3.3 WHEN 查询房间列表时 THEN 系统 SHALL CONTINUE TO 返回每个房间的活跃入住信息，包含患者、宝宝、病案等关联数据

3.4 WHEN 创建或查询表单记录时 THEN 系统 SHALL CONTINUE TO 通过 admissionId 关联表单记录，保持 `FormRecord.admissionId` 外键关系不变

3.5 WHEN 执行换房操作时 THEN 系统 SHALL CONTINUE TO 正确结束旧 BedAssignment、释放旧床位、创建新 BedAssignment、占用新床位

3.6 WHEN 执行出院结算时 THEN 系统 SHALL CONTINUE TO 正确计算实际费用、生成结算单、释放床位

3.7 WHEN 取消入住时 THEN 系统 SHALL CONTINUE TO 仅允许 PENDING/QUOTED/DEPOSITED 状态取消，并正确释放已预留的床位

3.8 WHEN 通过 API 查询入住单元列表时 THEN 系统 SHALL CONTINUE TO 支持按状态、场景、科室、患者分页筛选
