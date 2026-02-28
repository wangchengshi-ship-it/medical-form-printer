# Bugfix Requirements Document

## Introduction

产康前端在显示房间入住情况时，显示了所有科室的房间数据，而不是只显示产康科室的房间。这导致产康护士看到了其他科室（如通用科室）的房间和入住信息，造成数据混乱和隐私问题。

根本原因：`AdmissionService.getRooms()` 方法中的 `scenario` 过滤逻辑已被移除（代码注释显示"scenario 过滤已移除，因为本地不再维护 Department 表"），导致该方法只按用户的科室权限过滤，但没有按应用场景（POSTPARTUM/GENERAL）过滤房间数据。

影响范围：
- 产康前端房间列表页面
- 入住情况查询
- API 端点：`GET /api/v1/admissions/rooms`

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN 产康前端调用 `GET /api/v1/admissions/rooms?scenario=POSTPARTUM` THEN 系统返回所有科室的房间数据（包括通用科室的房间）

1.2 WHEN 用户属于产康科室且调用 `getRooms()` 方法 THEN 系统只按 `departmentId` 过滤房间，忽略 `scenario` 参数

1.3 WHEN Room 表中存在多个科室的房间数据 THEN 所有房间都会被返回，无论其所属科室的应用场景是什么

### Expected Behavior (Correct)

2.1 WHEN 产康前端调用 `GET /api/v1/admissions/rooms?scenario=POSTPARTUM` THEN 系统 SHALL 只返回产康科室的房间数据

2.2 WHEN 用户属于产康科室且调用 `getRooms()` 方法 THEN 系统 SHALL 同时按 `departmentId` 和 `scenario` 过滤房间

2.3 WHEN Room 表中存在多个科室的房间数据 THEN 系统 SHALL 通过 auth-svc 获取对应 scenario 的科室列表，并只返回这些科室的房间

### Unchanged Behavior (Regression Prevention)

3.1 WHEN 用户没有传递 `scenario` 参数 THEN 系统 SHALL CONTINUE TO 返回用户所属所有科室的房间（不按 scenario 过滤）

3.2 WHEN 用户没有分配任何科室 THEN 系统 SHALL CONTINUE TO 返回空数组或抛出权限错误

3.3 WHEN 查询未分配床位的入住记录 THEN 系统 SHALL CONTINUE TO 将其追加为虚拟房间"未分配"

3.4 WHEN SSO 用户调用 API（没有 departmentIds） THEN 系统 SHALL CONTINUE TO 跳过科室过滤

3.5 WHEN 房间没有活跃入住记录 THEN 系统 SHALL CONTINUE TO 返回空房间（admissions 为空数组）
