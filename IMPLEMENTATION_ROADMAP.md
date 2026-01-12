# 实现路线图 - 前端功能补全

## 快速参考

### 第一阶段：核心业务（9-12 天）

#### Week 1: 患者管理 + 入住管理
- **Day 1-2**: 患者管理模块
  - `src/pages/patients/index.vue` - 患者列表
  - `src/composables/usePatients.ts` - 患者查询
  - `src/api/patients.ts` - API 集成
  
- **Day 3-4**: 入住管理模块
  - `src/pages/admissions/index.vue` - 房间管理
  - `src/composables/useAdmissions.ts` - 入住查询
  - `src/api/admissions.ts` - API 集成

#### Week 2: 表单记录
- **Day 5-7**: 表单编辑
  - `src/pages/form-records/index.vue` - 表单列表
  - `src/pages/form-records/[id].vue` - 表单编辑
  - `src/composables/useFormRecords.ts` - 表单查询
  - `src/api/form-records.ts` - API 集成

- **Day 8-9**: 表单打印 + 签名
  - `src/pages/form-records/[id]/print.vue` - 打印预览
  - `src/components/FormSignature.vue` - 签名组件

### 第二阶段：增强功能（5-8 天）

- **Day 10-11**: 用户组权限管理
- **Day 12-13**: 模板管理增强
- **Day 14**: 系统管理

## 关键 API 端点

### 患者管理
```
GET    /patients                    # 列表
POST   /patients                    # 创建
GET    /patients/:id                # 详情
PUT    /patients/:id                # 编辑
DELETE /patients/:id                # 删除
GET    /patients/:id/admission-unit # 入住单元
GET    /patients/:id/newborns       # 新生儿列表
```

### 入住管理
```
GET    /admissions/active           # 活跃入住
GET    /admissions/rooms            # 房间列表
GET    /admissions/:id              # 详情
GET    /admissions/number/:number   # 按档案号查询
```

### 表单记录
```
GET    /form-records                # 列表
POST   /form-records                # 创建
GET    /form-records/:id            # 详情
PUT    /form-records/:id            # 编辑
POST   /form-records/:id/sign       # 签名
POST   /form-records/:id/entries    # 追加日志
GET    /form-records/admission/:id  # 按入住查询
```

## 文件清单

### 新增 Composables
- `src/composables/usePatients.ts`
- `src/composables/useCreatePatient.ts`
- `src/composables/useUpdatePatient.ts`
- `src/composables/useDeletePatient.ts`
- `src/composables/useAdmissions.ts`
- `src/composables/useFormRecords.ts`
- `src/composables/useCreateFormRecord.ts`
- `src/composables/useUpdateFormRecord.ts`
- `src/composables/useSignFormRecord.ts`
- `src/composables/useAddDailyLogEntry.ts`

### 新增 API 模块
- `src/api/patients.ts`
- `src/api/admissions.ts`
- `src/api/form-records.ts`

### 新增页面
- `src/pages/patients/index.vue`
- `src/pages/patients/[id].vue`
- `src/pages/patients/new.vue`
- `src/pages/admissions/index.vue`
- `src/pages/admissions/[id].vue`
- `src/pages/form-records/index.vue`
- `src/pages/form-records/[id].vue`
- `src/pages/form-records/[id]/print.vue`
- `src/pages/form-records/new.vue`

### 新增组件
- `src/components/PatientListTable.vue`
- `src/components/PatientFormDialog.vue`
- `src/components/AdmissionUnitCard.vue`
- `src/components/RoomCard.vue`
- `src/components/AdmissionDetailPanel.vue`
- `src/components/FormRecordList.vue`
- `src/components/FormRecordEditor.vue`
- `src/components/FormRecordPrint.vue`
- `src/components/FormSignature.vue`
- `src/components/DailyLogEntryForm.vue`

### 类型定义更新
- `src/types/admin.ts` - 添加患者、入住、表单相关类型

## 实现检查清单

### 患者管理
- [ ] 患者列表页面（支持筛选、搜索、分页）
- [ ] 患者创建对话框
- [ ] 患者编辑对话框
- [ ] 患者详情页面
- [ ] 入住单元查询
- [ ] 新生儿列表显示

### 入住管理
- [ ] 房间管理页面（卡片式布局）
- [ ] 入住详情页面
- [ ] 档案号快速查询
- [ ] 活跃入住列表

### 表单记录
- [ ] 表单列表页面
- [ ] 表单编辑页面（AutoForm 集成）
- [ ] 表单打印预览
- [ ] 电子签名功能
- [ ] 日志表单追加条目
- [ ] 表单状态管理

### 权限和安全
- [ ] JWT 认证集成
- [ ] 权限检查
- [ ] 科室范围过滤
- [ ] 错误处理

## 测试计划

### 单元测试
- Composables 测试
- API 客户端测试
- 组件单元测试

### 集成测试
- 页面流程测试
- API 集成测试
- 权限控制测试

### E2E 测试
- 患者管理完整流程
- 表单编辑完整流程
- 权限控制验证

## 部署检查

- [ ] 类型检查通过 (`bun run lint`)
- [ ] 单元测试通过 (`bun run test`)
- [ ] 构建成功 (`bun run build`)
- [ ] 无 console 错误
- [ ] 无 TypeScript 错误
- [ ] API 文档更新
- [ ] 用户文档更新
