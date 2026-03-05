# Implementation Plan: 入住报价单打折功能

## Overview

在现有入住报价单工作台中增加折扣交互。主要改动集中在前端：扩展 `estimateCost.ts` 纯函数支持折扣计算、扩展 `useAdmissionQuote.ts` 管理折扣状态、扩展 `QuoteSummary.vue` 展示折扣 UI。后端 DTO 和计费引擎已支持 `discountRate`，无需修改核心逻辑。安全策略：折扣率在报价单创建时由护士自由设置（0-1），创建后不可修改（immutable）。

## Tasks

- [x] 1. 扩展 estimateCost.ts 纯函数支持折扣计算
  - [x] 1.1 新增 `estimateSubtotal` 函数，计算折前总额（与当前 `estimateCost` 逻辑一致）
    - 新增 `estimateSubtotal(dailyRate, tier, babyCount): number`，返回 `bedFee + babySurcharge`
    - 新增 `isValidDiscountRate(rate: number): boolean`，验证折扣率在 [0, 1] 范围内
    - _Requirements: 2.1, 2.4, 6.1_
  - [x] 1.2 修改 `estimateCost` 函数签名，增加可选 `discountRate` 参数
    - 签名变为 `estimateCost(dailyRate, tier, babyCount, discountRate?: number): number`
    - 计算逻辑：`Math.round(subtotal × discountRate)`，`discountRate` 默认 1
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ]* 1.3 编写 estimateCost 属性测试（Property 1: 折扣计算公式正确性）
    - **Property 1: 折扣计算公式正确性**
    - 使用 fast-check 生成 dailyRate(`fc.nat()`), tier(`fc.constantFrom(28, 42)`), babyCount(`fc.nat({max:5})`), discountRate(`fc.double({min:0, max:1, noNaN:true})`)
    - 验证 `estimateCost(args, discountRate) === Math.round(estimateSubtotal(args) × discountRate)` 且结果 >= 0
    - 测试文件：`frontend/src/utils/estimateCost.spec.ts`
    - **Validates: Requirements 2.2, 2.4**
  - [ ]* 1.4 编写 isValidDiscountRate 属性测试（Property 2: 折扣率验证范围）
    - **Property 2: 折扣率验证范围**
    - 使用 `fc.double({noNaN:true})` 全范围数值，验证 `isValidDiscountRate(rate) === (rate >= 0 && rate <= 1)`
    - 测试文件：`frontend/src/utils/estimateCost.spec.ts`
    - **Validates: Requirements 1.3, 6.1**
  - [ ]* 1.5 编写优惠金额属性测试（Property 3: 优惠金额等于折前总额减折后总额）
    - **Property 3: 优惠金额等于折前总额减折后总额**
    - 验证 `estimateSubtotal(args) - estimateCost(args, discountRate) >= 0`
    - 测试文件：`frontend/src/utils/estimateCost.spec.ts`
    - **Validates: Requirements 3.3**

- [x] 2. Checkpoint - 确认纯函数层正确
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. 扩展 useAdmissionQuote.ts 状态管理
  - [x] 3.1 新增折扣率响应式状态和计算属性
    - 新增 `discountRate = ref(1)` 响应式状态
    - 新增 `estimatedSubtotal` computed，调用 `estimateSubtotal(dailyRate, selectedTier, babyCount)`
    - 新增 `discountAmount` computed，等于 `estimatedSubtotal - estimatedCost`
    - 修改 `estimatedCostValue` computed，传入 `discountRate.value` 给 `estimateCost`
    - _Requirements: 4.1, 4.2_
  - [x] 3.2 修改 confirmSubmit 传递折扣率到 API
    - 在 `createAdmissionMutation.mutateAsync` 的 body 中增加 `discountRate` 字段
    - 将 `discountRate`, `estimatedSubtotal`, `discountAmount` 加入 composable 返回值
    - _Requirements: 4.3, 5.1_

- [x] 4. 扩展 QuoteSummary.vue 折扣 UI
  - [x] 4.1 新增折扣率输入控件和快捷按钮
    - 新增 props: `discountRate`, `subtotal`, `discountAmount`
    - 新增 emit: `update:discountRate`
    - 添加折扣率 `<input type="number" step="0.01" min="0" max="1">`，v-model 绑定
    - 添加快捷按钮（九折 0.9、八五折 0.85、八折 0.8、七五折 0.75、七折 0.7），粉色 pill 样式 `rounded-full bg-pink-50 text-pink-600`
    - 输入验证：超出 [0, 1] 范围时显示红色错误提示
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [x] 4.2 实现折扣费用明细条件展示
    - 当 `discountRate !== 1` 时：显示折前总额、折扣率标签、优惠金额（负数红色）、折后总额（粉色加粗）
    - 当 `discountRate === 1` 时：仅显示"预估总费用"，隐藏折扣相关行
    - 所有金额以元为单位展示（分转元，保留两位小数）
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ]* 4.3 编写 QuoteSummary 折扣明细条件展示属性测试（Property 5: 折扣明细条件展示）
    - **Property 5: 折扣明细条件展示**
    - 使用 `@vue/test-utils` mount 组件 + fast-check 生成 discountRate
    - 当 `discountRate !== 1` 时验证渲染包含折前总额、折扣率、优惠金额、折后总额
    - 当 `discountRate === 1` 时验证不包含折扣相关行
    - 测试文件：`frontend/src/components/quote/QuoteSummary.spec.ts`
    - **Validates: Requirements 3.1, 3.2**

- [x] 5. 接线 quote.vue 页面
  - [x] 5.1 将折扣状态从 composable 传递到 QuoteSummary
    - 从 `useAdmissionQuote` 解构 `discountRate`, `estimatedSubtotal`, `discountAmount`
    - 在 `<QuoteSummary>` 上绑定 `v-model:discount-rate`, `:subtotal`, `:discount-amount`
    - _Requirements: 1.1, 4.1, 4.2_

- [x] 6. Checkpoint - 确认前端折扣功能完整
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. 后端报价单不可篡改保障
  - [x] 7.1 确认后端不提供修改 Quote 记录的任何 API
    - 检查现有 controller/service 确认没有更新 Quote 记录任何字段的端点
    - 确认 `GenerateQuoteSchema` 的 `discountRate` 验证范围为 [0, 1]（已有）
    - 确认 Quote 记录创建后所有字段（discountRate、totalAmount、bedFee、babySurcharge、packageFee 等）不会被任何更新操作覆盖
    - _Requirements: 7.2, 7.3, 7.5_
  - [ ]* 7.2 编写前后端计算一致性属性测试（Property 4: 前后端计算一致性）
    - **Property 4: 前后端计算一致性**
    - 在后端测试中验证 `BillingEngineService.calculateQuote` 的 `totalAmount === Math.round(subtotal × discountRate)`
    - 使用 fast-check 生成 dailyRate, stayDays, babyCount, discountRate（[0, 1] 范围）
    - 测试文件：`backend/src/modules/admission-unit/billing-engine.property.spec.ts`
    - **Validates: Requirements 5.4, 6.4**

- [x] 8. Final checkpoint - 确认所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 后端 `GenerateQuoteDto` 和 `BillingEngineService` 已支持 `discountRate`，本次主要补齐前端交互
- 安全策略：护士创建报价单时自由设置折扣率（0-1），报价单生成后整个 Quote 记录不可修改（immutable），收费员无法二次调整任何字段
- 前端测试使用 Vitest + fast-check，后端测试使用 Jest + fast-check
- 包管理器统一使用 bun，前端安装 fast-check: `bun add -d fast-check`
- 所有金额单位：内部计算用分（整数），UI 展示用元（保留两位小数）
