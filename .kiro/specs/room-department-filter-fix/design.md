# 房间科室过滤修复 Bugfix Design

## Overview

产康前端在显示房间入住情况时，显示了所有科室的房间数据，而不是只显示产康科室的房间。根本原因是 `AdmissionService.getRooms()` 方法中的 `scenario` 过滤逻辑已被移除，导致该方法只按用户的科室权限过滤，但没有按应用场景（POSTPARTUM/GENERAL）过滤房间数据。

修复策略：在 `getRooms()` 方法中，当传入 `scenario` 参数时，通过 Room 表的 `departmentId` 字段和用户的 `departmentIds` 交集来过滤房间。由于 Room 表已经有 `departmentId` 字段，且用户的 JWT token 中包含 `departmentIds` 列表，我们可以直接在数据库查询层面实现过滤，无需调用 auth-svc。

## Glossary

- **Bug_Condition (C)**: 当产康前端调用 `getRooms(scenario=POSTPARTUM)` 时，系统返回所有科室的房间（包括通用科室）
- **Property (P)**: 当传入 `scenario` 参数时，系统应只返回用户所属科室中与该 scenario 匹配的房间
- **Preservation**: 当不传入 `scenario` 参数时，系统应继续返回用户所属所有科室的房间（现有行为）
- **AdmissionService.getRooms()**: `backend/src/modules/admission/admission.service.ts` 中的方法，负责查询房间列表及其入住情况
- **scenario**: Prisma 枚举类型，取值为 `POSTPARTUM`（产康）或 `GENERAL`（通用）
- **departmentId**: Room 表中的字段，存储 auth-svc 的科室 ID（String 类型，无外键约束）
- **user.departmentIds**: JWT token 中的字段，包含用户所属的所有科室 ID 列表

## Bug Details

### Fault Condition

该 bug 在产康前端调用 `GET /api/v1/admissions/rooms?scenario=POSTPARTUM` 时触发。`AdmissionService.getRooms()` 方法中的 `scenario` 过滤逻辑已被移除（代码注释显示"scenario 过滤已移除，因为本地不再维护 Department 表"），导致该方法只按用户的 `departmentIds` 过滤房间，但没有按 `scenario` 过滤。

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { user: RequestUser, scenario?: Scenario }
  OUTPUT: boolean
  
  RETURN input.scenario IS NOT NULL
         AND input.user.departmentIds.length > 0
         AND EXISTS room IN database WHERE room.departmentId IN input.user.departmentIds
         AND NOT (room.departmentId 对应的科室的 scenario == input.scenario)
END FUNCTION
```

### Examples

假设数据库中有以下房间：

| roomNumber | departmentId | 科室名称 | 科室 scenario |
|------------|--------------|----------|---------------|
| "101" | "dept-postpartum-1" | 产康一科 | POSTPARTUM |
| "102" | "dept-postpartum-1" | 产康一科 | POSTPARTUM |
| "201" | "dept-general-1" | 通用科室 | GENERAL |

用户属于两个科室：`["dept-postpartum-1", "dept-general-1"]`

- **Bug 示例 1**: 产康前端调用 `getRooms(scenario=POSTPARTUM)`，期望只返回 101、102，实际返回 101、102、201（错误）
- **Bug 示例 2**: 通用前端调用 `getRooms(scenario=GENERAL)`，期望只返回 201，实际返回 101、102、201（错误）
- **Bug 示例 3**: 不传 scenario 参数调用 `getRooms()`，期望返回 101、102、201，实际返回 101、102、201（正确，这是 preservation 场景）
- **Edge Case**: 用户只属于产康科室 `["dept-postpartum-1"]`，调用 `getRooms(scenario=POSTPARTUM)`，期望返回 101、102，实际返回 101、102（正确，但这不是 bug 场景）

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- 当用户没有传递 `scenario` 参数时，系统必须继续返回用户所属所有科室的房间（不按 scenario 过滤）
- 当用户没有分配任何科室时，系统必须继续返回空数组或抛出权限错误
- 当查询未分配床位的入住记录时，系统必须继续将其追加为虚拟房间"未分配"
- 当 SSO 用户调用 API（没有 departmentIds）时，系统必须继续跳过科室过滤
- 当房间没有活跃入住记录时，系统必须继续返回空房间（admissions 为空数组）

**Scope:**
所有不涉及 `scenario` 参数的 API 调用应完全不受此修复影响。这包括：
- 不传 `scenario` 参数的 `getRooms()` 调用
- SSO 用户的调用（`user.ssoPermissions` 存在且 `user.departmentIds` 为空）
- 其他 AdmissionService 方法（如 `findActiveAdmissions`、`findOne` 等）

## Hypothesized Root Cause

基于代码注释和 bug 描述，最可能的原因是：

1. **历史遗留问题**: 之前 NestJS 后端本地维护了 Department 表，可以通过 `department.scenario` 字段过滤。后来 Department 表被移除，科室数据完全由 auth-svc 管理，导致 scenario 过滤逻辑失效。

2. **错误的假设**: 代码注释显示"如果需要按 scenario 过滤，应该从 auth-svc 获取对应 scenario 的科室列表"，但实际上：
   - auth-svc 目前没有提供按 scenario 过滤科室的 API
   - Room 表已经有 `departmentId` 字段
   - 用户的 JWT token 中已经包含 `departmentIds` 列表
   - 因此可以直接在数据库查询层面实现过滤，无需调用 auth-svc

3. **数据模型不一致**: Room 表有 `departmentId` 字段，但没有 `scenario` 字段。如果要按 scenario 过滤，需要知道每个 `departmentId` 对应的 scenario。目前的实现假设需要从 auth-svc 获取这个映射关系，但实际上可以通过以下方式解决：
   - 方案 A: 在 Room 表中添加 `scenario` 字段（冗余但高效）
   - 方案 B: 通过 auth-svc API 获取科室的 scenario（需要 auth-svc 支持）
   - 方案 C: 在 NestJS 后端维护一个 departmentId → scenario 的缓存映射（复杂）

## Correctness Properties

Property 1: Fault Condition - 按 scenario 过滤房间

_For any_ API 调用 `getRooms(user, scenario)` where `scenario` 参数不为 null 且用户属于多个不同 scenario 的科室，修复后的方法 SHALL 只返回用户所属科室中与指定 scenario 匹配的房间，不返回其他 scenario 的房间。

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - 不传 scenario 时的行为

_For any_ API 调用 `getRooms(user)` where `scenario` 参数为 null 或 undefined，修复后的方法 SHALL 产生与原始方法完全相同的结果，返回用户所属所有科室的房间，不进行 scenario 过滤。

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

由于当前架构限制（auth-svc 不提供按 scenario 过滤科室的 API，Room 表没有 scenario 字段），我们采用最简单且最符合现有架构的方案：

**方案：在 Room 表中添加 `scenario` 字段**

这是最直接的解决方案，因为：
- Room 本身就是业务实体，应该知道自己属于哪个应用场景
- 避免了对 auth-svc 的额外依赖
- 查询性能最优（单表过滤）
- 数据一致性由应用层保证（创建房间时必须指定 scenario）

**File**: `backend/prisma/schema.prisma`

**Specific Changes**:
1. **添加 scenario 字段到 Room 模型**:
   ```prisma
   model Room {
     // ... 现有字段
     scenario     Scenario  @default(POSTPARTUM)  // 新增字段
     // ... 其他字段
   }
   ```

2. **添加索引优化查询**:
   ```prisma
   @@index([scenario, departmentId])
   ```

**File**: `backend/src/modules/admission/admission.service.ts`

**Function**: `getRooms()`

**Specific Changes**:
1. **修改 roomWhere 条件，添加 scenario 过滤**:
   ```typescript
   const roomWhere: Prisma.RoomWhereInput = {
     isActive: true,
     ...(departmentIdFilter && { departmentId: departmentIdFilter }),
     ...(scenario && { scenario }),  // 新增：按 scenario 过滤
   };
   ```

2. **移除误导性的代码注释**:
   删除以下注释：
   ```typescript
   // 注意：scenario 过滤已移除，因为本地不再维护 Department 表
   // 如果需要按 scenario 过滤，应该：
   // 1. 从 auth-svc 获取对应 scenario 的科室列表
   // 2. 或者在 Room 表中添加 scenario 字段
   // 当前实现：仅按用户的科室权限过滤
   ```

3. **添加新的注释说明修复**:
   ```typescript
   // scenario 过滤通过 Room 表的 scenario 字段实现
   // 当传入 scenario 参数时，只返回匹配该 scenario 的房间
   ```

**File**: `backend/src/modules/room/room.service.ts` (假设存在)

**Specific Changes**:
1. **创建房间时必须指定 scenario**:
   - 修改 CreateRoomDto，添加 `scenario` 字段（必填）
   - 在 `create()` 方法中，将 scenario 写入数据库

2. **更新房间时允许修改 scenario**:
   - 修改 UpdateRoomDto，添加 `scenario` 字段（可选）
   - 在 `update()` 方法中，允许更新 scenario

**File**: `backend/prisma/seed.ts` (如果存在房间种子数据)

**Specific Changes**:
1. **为现有房间种子数据添加 scenario 字段**:
   - 产康科室的房间设置 `scenario: 'POSTPARTUM'`
   - 通用科室的房间设置 `scenario: 'GENERAL'`

### 数据迁移

**重要**: 由于 Room 表中现有数据没有 scenario 字段，需要进行数据迁移：

1. **添加字段（带默认值）**:
   ```sql
   ALTER TABLE rooms ADD COLUMN scenario TEXT NOT NULL DEFAULT 'POSTPARTUM';
   ```

2. **根据 departmentId 更新 scenario**:
   - 需要手动或通过脚本将通用科室的房间更新为 `GENERAL`
   - 产康科室的房间保持 `POSTPARTUM`（默认值）

3. **添加索引**:
   ```sql
   CREATE INDEX "rooms_scenario_departmentId_idx" ON "rooms"("scenario", "departmentId");
   ```

## Testing Strategy

### Validation Approach

测试策略分为两个阶段：
1. **探索性测试（Exploratory Fault Condition Checking）**: 在未修复的代码上运行测试，验证 bug 确实存在
2. **修复验证（Fix Checking + Preservation Checking）**: 在修复后的代码上运行测试，验证 bug 已修复且未引入回归

### Exploratory Fault Condition Checking

**Goal**: 在未修复的代码上运行测试，确认 bug 存在，并验证根本原因假设。

**Test Plan**: 
1. 准备测试数据：创建产康科室和通用科室的房间
2. 创建一个同时属于两个科室的测试用户
3. 调用 `getRooms(user, scenario='POSTPARTUM')`
4. 断言返回结果包含通用科室的房间（bug 行为）

**Test Cases**:
1. **产康场景测试**: 调用 `getRooms(scenario=POSTPARTUM)`，预期只返回产康房间，实际返回所有房间（will fail on unfixed code）
2. **通用场景测试**: 调用 `getRooms(scenario=GENERAL)`，预期只返回通用房间，实际返回所有房间（will fail on unfixed code）
3. **跨科室用户测试**: 用户属于产康和通用两个科室，调用 `getRooms(scenario=POSTPARTUM)`，预期只返回产康房间，实际返回所有房间（will fail on unfixed code）
4. **无 scenario 参数测试**: 调用 `getRooms()` 不传 scenario，预期返回所有房间，实际返回所有房间（will pass on unfixed code - preservation）

**Expected Counterexamples**:
- 当传入 `scenario=POSTPARTUM` 时，返回结果包含 `scenario=GENERAL` 的房间
- 当传入 `scenario=GENERAL` 时，返回结果包含 `scenario=POSTPARTUM` 的房间
- Possible causes: Room 表缺少 scenario 字段，或查询条件未包含 scenario 过滤

### Fix Checking

**Goal**: 验证修复后，所有传入 scenario 参数的调用都只返回匹配该 scenario 的房间。

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := getRooms_fixed(input.user, input.scenario)
  ASSERT ALL room IN result WHERE room.scenario == input.scenario
  ASSERT NOT EXISTS room IN result WHERE room.scenario != input.scenario
END FOR
```

**Test Cases**:
1. **产康场景修复验证**: 调用 `getRooms(scenario=POSTPARTUM)`，断言所有返回的房间都是 `scenario=POSTPARTUM`
2. **通用场景修复验证**: 调用 `getRooms(scenario=GENERAL)`，断言所有返回的房间都是 `scenario=GENERAL`
3. **跨科室用户修复验证**: 用户属于产康和通用两个科室，调用 `getRooms(scenario=POSTPARTUM)`，断言只返回产康房间
4. **单科室用户验证**: 用户只属于产康科室，调用 `getRooms(scenario=POSTPARTUM)`，断言返回产康房间（边界情况）

### Preservation Checking

**Goal**: 验证修复后，所有不传 scenario 参数的调用行为与原始代码完全一致。

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT getRooms_original(input.user) = getRooms_fixed(input.user)
END FOR
```

**Testing Approach**: Property-based testing 推荐用于 preservation checking，因为：
- 自动生成多种测试用例（不同的用户科室组合）
- 捕获手动测试可能遗漏的边界情况
- 提供强保证：所有非 bug 输入的行为都未改变

**Test Plan**: 
1. 在未修复的代码上运行测试，记录不传 scenario 参数时的返回结果
2. 在修复后的代码上运行相同测试，断言返回结果完全一致

**Test Cases**:
1. **无 scenario 参数 - 跨科室用户**: 用户属于多个科室，调用 `getRooms()` 不传 scenario，验证返回所有科室的房间
2. **无 scenario 参数 - 单科室用户**: 用户只属于一个科室，调用 `getRooms()` 不传 scenario，验证返回该科室的房间
3. **SSO 用户**: SSO 用户（无 departmentIds），调用 `getRooms()`，验证跳过科室过滤
4. **无科室用户**: 用户没有分配任何科室，调用 `getRooms()`，验证返回空数组
5. **未分配床位的入住记录**: 验证虚拟房间"未分配"仍然被正确追加

### Unit Tests

- 测试 `getRooms()` 方法在不同 scenario 参数下的行为
- 测试 Room 表的 scenario 字段约束（必填、枚举值验证）
- 测试创建房间时 scenario 字段的验证
- 测试边界情况：用户无科室、SSO 用户、单科室用户

### Property-Based Tests

- 生成随机的用户科室组合，验证 scenario 过滤的正确性
- 生成随机的房间数据（不同 scenario），验证查询结果的一致性
- 测试不传 scenario 参数时，行为与原始代码一致（preservation）

### Integration Tests

- 端到端测试：产康前端调用 `GET /api/v1/admissions/rooms?scenario=POSTPARTUM`，验证只返回产康房间
- 端到端测试：通用前端调用 `GET /api/v1/admissions/rooms?scenario=GENERAL`，验证只返回通用房间
- 测试数据迁移脚本：验证现有房间数据正确设置了 scenario 字段
- 测试 API 文档：验证 Swagger 文档正确显示 scenario 参数和 Room 响应中的 scenario 字段
