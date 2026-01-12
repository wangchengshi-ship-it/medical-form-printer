# 功能差距分析：Backend vs Frontend (guozhen-web)

**分析日期**: 2026-01-11  
**分析范围**: Backend API 端点 vs Frontend 页面实现  
**项目**: 国诊平台 (Guozhen Platform)

---

## 执行摘要

### 整体情况
- **后端模块数**: 16 个
- **后端 API 端点**: ~50+ 个
- **前端页面**: 仅 8 个（主要集中在管理后台）
- **功能覆盖率**: ~30%（仅管理功能已实现）
- **关键缺失**: 患者管理、入住管理、电子病历表单、日志记录等核心业务功能

### 核心问题
1. **缺失核心业务页面**: 患者档案、入住管理、表单记录等
2. **缺失 EMR 功能**: 电子病历表单编辑、打印、签名等
3. **缺失数据查询页面**: 患者列表、入住单元、房间管理等
4. **API 集成不完整**: 后端已实现但前端未调用的 API 占 70%+

---

## 详细差距分析

### 1. 已实现的功能 ✅

#### 1.1 认证系统
| 功能 | 后端 API | 前端页面 | 状态 |
|------|---------|---------|------|
| 用户登录 | ✅ POST /auth/login | ✅ login.vue | ✅ 完成 |
| Token 刷新 | ✅ POST /auth/refresh | ✅ 自动处理 | ✅ 完成 |
| 用户登出 | ✅ POST /auth/logout | ✅ 自动处理 | ✅ 完成 |
| SSO 检查 | ✅ GET /auth/check | ✅ 自动处理 | ✅ 完成 |
| 获取用户信息 | ✅ GET /auth/me | ✅ 自动处理 | ✅ 完成 |

#### 1.2 后台管理功能
| 功能 | 后端 API | 前端页面 | 状态 |
|------|---------|---------|------|
| 用户列表 | ✅ GET /users | ✅ admin/users/index.vue | ✅ 完成 |
| 用户创建 | ✅ POST /users | ✅ UserFormDialog | ✅ 完成 |
| 用户编辑 | ✅ PATCH /users/:id | ✅ UserFormDialog | ✅ 完成 |
| 用户删除 | ✅ DELETE /users/:id | ✅ ConfirmDialog | ✅ 完成 |
| 重置密码 | ✅ POST /users/:id/reset-password | ✅ ResetPasswordDialog | ✅ 完成 |
| 解锁账户 | ✅ POST /users/:id/unlock | ✅ ConfirmDialog | ✅ 完成 |
| 科室列表 | ✅ GET /departments | ✅ admin/departments/index.vue | ✅ 完成 |
| 科室创建 | ✅ POST /departments | ✅ DepartmentFormDialog | ✅ 完成 |
| 科室编辑 | ✅ PUT /departments/:id | ✅ DepartmentFormDialog | ✅ 完成 |
| 科室删除 | ✅ DELETE /departments/:id | ✅ ConfirmDialog | ✅ 完成 |
| 用户组列表 | ✅ GET /user-groups | ✅ admin/user-groups/index.vue | ✅ 完成 |
| 模板列表 | ✅ GET /templates | ✅ admin/templates/index.vue | ✅ 完成 |
| 模板详情 | ✅ GET /templates/:id | ✅ admin/templates/[id].vue | ✅ 完成 |
| 会话管理 | ✅ GET /sessions | ✅ admin/sessions/index.vue | ✅ 完成 |
| 应用场景 | ✅ GET /scenarios | ✅ admin/scenarios/index.vue | ✅ 完成 |

#### 1.3 仪表盘
| 功能 | 后端 API | 前端页面 | 状态 |
|------|---------|---------|------|
| 仪表盘统计 | ✅ GET /dashboard/stats | ✅ index.vue | ✅ 完成 |

---

### 2. 部分实现的功能 ⚠️

#### 2.1 用户组管理
| 功能 | 后端 API | 前端页面 | 状态 | 备注 |
|------|---------|---------|------|------|
| 用户组列表 | ✅ GET /user-groups | ✅ admin/user-groups/index.vue | ⚠️ 基础 | 仅显示列表，无编辑功能 |
| 用户组创建 | ✅ POST /user-groups | ❌ 无 | ❌ 缺失 | 需要实现创建对话框 |
| 用户组编辑 | ✅ PATCH /user-groups/:id | ❌ 无 | ❌ 缺失 | 需要实现编辑对话框 |
| 用户组删除 | ✅ DELETE /user-groups/:id | ❌ 无 | ❌ 缺失 | 需要实现删除确认 |
| 权限配置 | ✅ PATCH /user-groups/:id | ❌ 无 | ❌ 缺失 | 需要实现权限编辑器 |

#### 2.2 模板管理
| 功能 | 后端 API | 前端页面 | 状态 | 备注 |
|------|---------|---------|------|------|
| 模板列表 | ✅ GET /templates | ✅ admin/templates/index.vue | ✅ 完成 | |
| 模板详情 | ✅ GET /templates/:id | ✅ admin/templates/[id].vue | ⚠️ 基础 | 仅显示详情，无编辑 |
| 模板创建 | ✅ POST /templates | ❌ 无 | ❌ 缺失 | 需要实现模板编辑器 |
| 模板编辑 | ✅ PUT /templates/:id | ❌ 无 | ❌ 缺失 | 需要实现模板编辑器 |
| 模板版本历史 | ✅ GET /templates/:id/versions | ❌ 无 | ❌ 缺失 | 需要实现版本查看 |
| AutoForm 格式 | ✅ GET /templates/:id/autoform | ❌ 无 | ❌ 缺失 | 用于表单渲染 |

---

### 3. 完全缺失的功能 ❌

#### 3.1 患者管理（核心业务）
| 功能 | 后端 API | 前端页面 | 优先级 | 说明 |
|------|---------|---------|--------|------|
| 患者列表 | ✅ GET /patients | ❌ 无 | 🔴 高 | 按科室、患者类型筛选 |
| 患者创建 | ✅ POST /patients | ❌ 无 | 🔴 高 | 支持产妇、新生儿 |
| 患者编辑 | ✅ PUT /patients/:id | ❌ 无 | 🔴 高 | 更新患者信息 |
| 患者删除 | ✅ DELETE /patients/:id | ❌ 无 | 🟡 中 | 软删除 |
| 患者详情 | ✅ GET /patients/:id | ❌ 无 | 🔴 高 | 查看患者完整信息 |
| 入住单元查询 | ✅ GET /patients/:id/admission-unit | ❌ 无 | 🔴 高 | 产康特有：母子共享 |
| 新生儿列表 | ✅ GET /patients/:id/newborns | ❌ 无 | 🔴 高 | 查看产妇的所有新生儿 |

**实现建议**:
- 创建 `src/pages/patients/` 目录
- 实现患者列表页面（支持多维度筛选）
- 实现患者创建/编辑对话框
- 实现患者详情页面（显示关联的新生儿和入住记录）

#### 3.2 入住管理（核心业务）
| 功能 | 后端 API | 前端页面 | 优先级 | 说明 |
|------|---------|---------|--------|------|
| 活跃入住列表 | ✅ GET /admissions/active | ❌ 无 | 🔴 高 | 显示所有在住患者 |
| 房间管理 | ✅ GET /admissions/rooms | ❌ 无 | 🔴 高 | 按房间号分组显示 |
| 入住详情 | ✅ GET /admissions/:id | ❌ 无 | 🔴 高 | 查看入住记录详情 |
| 按档案号查询 | ✅ GET /admissions/number/:admissionNumber | ❌ 无 | 🔴 高 | 快速查找入住记录 |

**实现建议**:
- 创建 `src/pages/admissions/` 目录
- 实现房间管理页面（卡片式布局显示房间和患者）
- 实现入住详情页面（显示患者信息和关联表单）
- 实现档案号快速查询功能

#### 3.3 电子病历表单（核心业务）
| 功能 | 后端 API | 前端页面 | 优先级 | 说明 |
|------|---------|---------|--------|------|
| 表单记录列表 | ✅ GET /form-records | ❌ 无 | 🔴 高 | 按入住、模板筛选 |
| 表单记录创建 | ✅ POST /form-records | ❌ 无 | 🔴 高 | 新建表单记录 |
| 表单记录编辑 | ✅ PUT /form-records/:id | ❌ 无 | 🔴 高 | 编辑表单数据 |
| 表单记录详情 | ✅ GET /form-records/:id | ❌ 无 | 🔴 高 | 查看表单详情 |
| 按入住查询 | ✅ GET /form-records/admission/:admissionId | ❌ 无 | 🔴 高 | 查看入住的所有表单 |
| 按档案号查询 | ✅ GET /form-records/admission-number/:admissionNumber | ❌ 无 | 🔴 高 | 快速查找表单 |
| 表单签名 | ✅ POST /form-records/:id/sign | ❌ 无 | 🔴 高 | 电子签名 |
| 追加日志条目 | ✅ POST /form-records/:id/entries | ❌ 无 | 🔴 高 | 日志表单追加记录 |

**实现建议**:
- 创建 `src/pages/form-records/` 目录
- 实现表单列表页面
- 实现表单编辑页面（使用 AutoForm 组件）
- 实现表单打印/预览页面
- 实现表单签名功能
- 实现日志表单追加条目功能

#### 3.4 系统管理
| 功能 | 后端 API | 前端页面 | 优先级 | 说明 |
|------|---------|---------|--------|------|
| 系统时间 | ✅ GET /system/time | ❌ 无 | 🟡 中 | 公开接口 |
| 健康检查 | ✅ GET /system/health | ❌ 无 | 🟡 中 | 公开接口 |
| 就绪检查 | ✅ GET /system/ready | ❌ 无 | 🟡 中 | 公开接口 |
| 系统信息 | ✅ GET /system/info | ❌ 无 | 🟡 中 | 仅管理员 |

**实现建议**:
- 在管理后台添加系统信息页面
- 显示服务器版本、运行时间、内存使用等

#### 3.5 审计日志
| 功能 | 后端 API | 前端页面 | 优先级 | 说明 |
|------|---------|---------|--------|------|
| 审计日志列表 | ✅ GET /audit-logs | ❌ 无 | 🟡 中 | 查看操作日志 |
| 审计日志详情 | ✅ GET /audit-logs/:id | ❌ 无 | 🟡 中 | 查看日志详情 |

**实现建议**:
- 在管理后台添加审计日志页面
- 支持按用户、操作类型、时间范围筛选

#### 3.6 权限管理
| 功能 | 后端 API | 前端页面 | 优先级 | 说明 |
|------|---------|---------|--------|------|
| 权限检查 | ✅ 内置 | ❌ 无 | 🟡 中 | 前端权限控制 |
| 权限编辑 | ✅ PATCH /user-groups/:id | ❌ 无 | 🟡 中 | 编辑用户组权限 |

---

## 按优先级的实现建议

### 🔴 第一阶段（高优先级 - 核心业务）

#### 1. 患者管理模块
**文件结构**:
```
src/pages/patients/
├── index.vue                    # 患者列表
├── [id].vue                     # 患者详情
└── new.vue                      # 新建患者

src/composables/
├── usePatients.ts               # 患者查询
├── useCreatePatient.ts          # 创建患者
├── useUpdatePatient.ts          # 更新患者
└── useDeletePatient.ts          # 删除患者

src/components/
├── PatientListTable.vue         # 患者表格
├── PatientFormDialog.vue        # 患者表单对话框
└── AdmissionUnitCard.vue        # 入住单元卡片
```

**关键功能**:
- 患者列表（支持按科室、患者类型、搜索筛选）
- 患者创建/编辑（区分产妇和新生儿）
- 患者详情（显示关联的新生儿和入住记录）
- 入住单元查询（产康特有）

#### 2. 入住管理模块
**文件结构**:
```
src/pages/admissions/
├── index.vue                    # 房间管理（卡片式布局）
├── [id].vue                     # 入住详情
└── search.vue                   # 档案号快速查询

src/composables/
├── useAdmissions.ts             # 入住查询
└── useAdmissionRooms.ts         # 房间查询

src/components/
├── RoomCard.vue                 # 房间卡片
├── AdmissionDetailPanel.vue     # 入住详情面板
└── AdmissionSearch.vue          # 档案号搜索
```

**关键功能**:
- 房间管理（按房间号分组，显示产妇和新生儿）
- 入住详情（显示患者信息和关联表单）
- 档案号快速查询
- 活跃入住列表

#### 3. 电子病历表单模块
**文件结构**:
```
src/pages/form-records/
├── index.vue                    # 表单列表
├── [id].vue                     # 表单详情/编辑
├── [id]/print.vue               # 表单打印预览
└── new.vue                      # 新建表单

src/composables/
├── useFormRecords.ts            # 表单查询
├── useCreateFormRecord.ts       # 创建表单
├── useUpdateFormRecord.ts       # 更新表单
├── useSignFormRecord.ts         # 签名表单
└── useAddDailyLogEntry.ts       # 追加日志条目

src/components/
├── FormRecordList.vue           # 表单列表
├── FormRecordEditor.vue         # 表单编辑器（使用 AutoForm）
├── FormRecordPrint.vue          # 表单打印
├── FormSignature.vue            # 签名组件
└── DailyLogEntryForm.vue        # 日志条目表单
```

**关键功能**:
- 表单列表（按入住、模板、状态筛选）
- 表单编辑（使用 AutoForm 组件）
- 表单打印/预览
- 电子签名
- 日志表单追加条目

### 🟡 第二阶段（中优先级 - 增强功能）

#### 1. 用户组权限管理
- 实现用户组创建/编辑对话框
- 实现权限编辑器（可视化权限配置）
- 实现权限预览

#### 2. 模板管理增强
- 实现模板创建/编辑页面
- 实现模板版本历史查看
- 实现模板预览

#### 3. 系统管理
- 实现系统信息页面
- 实现审计日志查看
- 实现系统监控仪表盘

---

## 技术实现指南

### 1. API 集成

#### 创建 Composables
```typescript
// src/composables/usePatients.ts
import { ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { patientApi } from '@/api'
import type { PatientQuery } from '@/types/admin'

export function usePatients(query: Ref<PatientQuery>) {
  return useQuery({
    queryKey: ['patients', query],
    queryFn: () => patientApi.list(query.value),
  })
}
```

#### 使用 API 客户端
```typescript
// src/api/patients.ts
import { api, buildQueryString } from './client'
import type { Patient, PatientQuery } from '@/types/admin'

export const patientApi = {
  list: (query?: PatientQuery) =>
    api.get<PaginatedResponse<Patient>>(
      `/patients${buildQueryString(query as Record<string, unknown>)}`
    ),
  
  get: (id: string) =>
    api.get<Patient>(`/patients/${id}`),
  
  create: (data: CreatePatientDto) =>
    api.post<Patient>('/patients', data),
  
  update: (id: string, data: UpdatePatientDto) =>
    api.put<Patient>(`/patients/${id}`, data),
  
  delete: (id: string) =>
    api.delete<void>(`/patients/${id}`),
  
  getAdmissionUnit: (id: string) =>
    api.get(`/patients/${id}/admission-unit`),
  
  getNewborns: (id: string) =>
    api.get<Patient[]>(`/patients/${id}/newborns`),
}
```

### 2. 页面结构

#### 列表页面模板
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import DataTable from '@/components/admin/DataTable.vue'
import DataTableToolbar from '@/components/admin/DataTableToolbar.vue'
import { usePatients } from '@/composables/usePatients'

const query = ref<PatientQuery>({
  page: 1,
  limit: 20,
  search: '',
  patientType: undefined,
  departmentId: undefined,
})

const { data, isLoading, isError, error, refetch } = usePatients(query)

const patients = computed(() => data.value?.data ?? [])
const pagination = computed(() => data.value?.meta ?? null)
</script>

<template>
  <div class="space-y-6">
    <DataTableToolbar
      :search-value="query.search"
      :filters="filters"
      @update:search-value="handleSearch"
      @filter-change="handleFilterChange"
    />
    
    <DataTable
      :columns="columns"
      :data="patients"
      :loading="isLoading"
      :pagination="pagination"
      @page-change="handlePageChange"
    />
  </div>
</template>
```

### 3. 表单编辑集成

#### 使用 AutoForm 组件
```vue
<script setup lang="ts">
import { AutoForm } from '@/components/ui/auto-form'
import { useFormRecords } from '@/composables/useFormRecords'

const { data: template } = useTemplate(templateId)

const formData = ref({})

async function handleSubmit() {
  await formRecordApi.update(recordId, {
    formData: formData.value,
  })
}
</script>

<template>
  <AutoForm
    :schema="template.editSchema"
    :values="formData"
    @submit="handleSubmit"
  />
</template>
```

---

## 数据流示例

### 患者管理流程
```
患者列表页面
  ↓
usePatients() composable
  ↓
patientApi.list() 
  ↓
GET /patients?page=1&limit=20&search=...
  ↓
后端返回 PaginatedResponse<Patient>
  ↓
DataTable 组件渲染
```

### 表单编辑流程
```
表单编辑页面
  ↓
useFormRecords() 获取表单数据
  ↓
useTemplate() 获取模板 schema
  ↓
AutoForm 组件渲染表单
  ↓
用户填写表单
  ↓
useUpdateFormRecord() 提交
  ↓
PUT /form-records/:id
  ↓
后端保存并返回更新后的记录
```

---

## 类型定义

### 需要补充的类型
```typescript
// src/types/admin.ts

// 患者相关
export interface Patient {
  id: string
  scenario: 'POSTPARTUM' | 'GENERAL'
  patientType: string
  name: string
  gender?: 'MALE' | 'FEMALE'
  birthDate?: string
  idType: 'ID_CARD' | 'PASSPORT' | 'OTHER'
  idNumber?: string
  phone?: string
  age?: number
  bloodType?: string
  ethnicity?: string
  motherId?: string
  departmentId?: string
  createdAt: string
  updatedAt: string
  userGroups?: Array<{ userGroup: UserGroup }>
  departments?: Array<{ department: Department }>
  children?: Patient[]
  mother?: Patient
}

export interface PatientQuery {
  page?: number
  limit?: number
  search?: string
  scenario?: string
  patientType?: string
  departmentId?: string
  motherId?: string
  includeChildren?: boolean
  includeAdmissions?: boolean
}

// 入住相关
export interface Admission {
  id: string
  admissionNumber: string
  patientId: string
  scenario: 'POSTPARTUM' | 'GENERAL'
  departmentId?: string
  roomNumber?: string
  bedNumber?: string
  admissionTime: string
  dischargeTime?: string
  status: 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED'
  createdAt: string
  updatedAt: string
  patient?: Patient
  department?: Department
  formRecords?: FormRecord[]
}

// 表单记录相关
export interface FormRecord {
  id: string
  admissionId: string
  templateId: string
  formType: 'SINGLE_FORM' | 'DAILY_LOG'
  formData: Record<string, unknown>
  status: 'DRAFT' | 'PENDING' | 'SIGNED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
  createdBy: string
  admission?: Admission
  template?: Template
  entries?: DailyLogEntry[]
  signatures?: Signature[]
}

export interface DailyLogEntry {
  id: string
  recordId: string
  entryDate: string
  entryTime?: string
  entryData: Record<string, unknown>
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Signature {
  id: string
  recordId: string
  type: 'AUTHOR'
  signerId: string
  signerName: string
  imageUrl?: string
  signedAt: string
  contentHash: string
}
```

---

## 实现时间表

| 阶段 | 功能 | 预计工作量 | 优先级 |
|------|------|----------|--------|
| 第一阶段 | 患者管理 | 3-4 天 | 🔴 高 |
| 第一阶段 | 入住管理 | 2-3 天 | 🔴 高 |
| 第一阶段 | 表单记录 | 4-5 天 | 🔴 高 |
| 第二阶段 | 用户组权限 | 2-3 天 | 🟡 中 |
| 第二阶段 | 模板管理增强 | 2-3 天 | 🟡 中 |
| 第二阶段 | 系统管理 | 1-2 天 | 🟡 中 |

**总计**: 14-20 天（第一阶段 9-12 天，第二阶段 5-8 天）

---

## 关键注意事项

### 1. 产康特殊性
- 产康患者包括产妇和新生儿（一对多关系）
- 入住单元是产妇和新生儿的组合
- 表单可能关联到产妇或新生儿

### 2. 权限控制
- 所有 API 都需要 JWT 认证
- 数据范围由用户所属科室决定
- 操作权限由用户组决定

### 3. 表单引擎
- 使用 AutoForm 组件渲染表单
- 表单 schema 来自后端模板
- 支持两种表单类型：SINGLE_FORM 和 DAILY_LOG

### 4. 状态管理
- 使用 TanStack Query 管理服务端状态
- 使用 Pinia 管理应用状态（认证、场景选择）
- 使用 vee-validate + Zod 进行表单验证

---

## 参考资源

### 后端 API 文档
- Swagger UI: http://localhost:3001/api
- 模块文档: `backend/docs/`

### 前端组件库
- shadcn-vue: https://www.shadcn-vue.com/
- Reka UI: https://reka-ui.com/

### 项目规范
- 技术栈: `tech.md`
- 项目结构: `structure.md`
- 注释规范: `tech.md` (注释规范部分)
- 认证系统: `auth-system.md`

---

## 总结

当前 guozhen-web 前端项目主要实现了**管理后台功能**（用户、科室、模板等），但**完全缺失核心业务功能**（患者管理、入住管理、电子病历表单等）。

建议按照优先级分阶段实现：
1. **第一阶段**（高优先级）：患者、入住、表单管理 - 这是系统的核心功能
2. **第二阶段**（中优先级）：权限管理、模板增强、系统管理 - 这是增强功能

预计总工作量 14-20 天，其中第一阶段 9-12 天最为关键。
