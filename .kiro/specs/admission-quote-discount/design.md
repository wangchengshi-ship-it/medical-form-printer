# 设计文档：入住报价单打折功能

## 概述

本功能在现有入住报价单工作台中增加折扣交互，使操作人员能够设置折扣率、实时预览折后价格，并将折扣信息完整传递到后端报价生成流程。

核心改动范围：
- **前端纯函数层**：`estimateCost.ts` 增加 `discountRate` 参数，返回折后总额
- **前端状态层**：`useAdmissionQuote.ts` 管理 `discountRate` 响应式状态，传递给计算函数和提交请求
- **前端 UI 层**：`QuoteSummary.vue` 增加折扣率输入控件、快捷按钮、折扣明细展示
- **后端 DTO 层**：`GenerateQuoteDto` 已支持 `discountRate`，无需修改
- **后端计费引擎**：`BillingEngineService.calculateQuote` 已支持 `discountRate`，无需修改

设计决策：后端 `GenerateQuoteSchema` 和 `BillingEngineService` 已完整支持 `discountRate`（0-1，默认 1），本次改动集中在前端。后端无需新增字段或修改逻辑。

## 架构

```mermaid
graph TD
    subgraph 前端
        A[quote.vue 页面] --> B[QuoteSummary.vue]
        A --> C[useAdmissionQuote.ts]
        C --> D[estimateCost.ts]
        B --> D
        C -->|discountRate| E[API 提交]
    end

    subgraph 后端（已有，无需修改）
        E -->|GenerateQuoteDto| F[AdmissionUnitController]
        F --> G[AdmissionUnitService.generateQuote]
        G --> H[BillingEngineService.calculateQuote]
    end

    style A fill:#fce7f3
    style B fill:#fce7f3
    style C fill:#fce7f3
    style D fill:#fce7f3
```

### 数据流

```
用户输入折扣率
  → useAdmissionQuote.discountRate (ref)
    → estimateCost(dailyRate, tier, babyCount, discountRate)
      → QuoteSummary 展示折前/折后明细
    → confirmSubmit() 将 discountRate 传入 generateQuote API
      → 后端 BillingEngine 计算并持久化
```

## 组件与接口

### 1. estimateCost.ts — 纯函数扩展

当前签名：
```typescript
function estimateCost(dailyRate: number, tier: StayDurationTier, babyCount: number): number
```

新增重载/修改签名，增加可选 `discountRate` 参数：
```typescript
function estimateCost(
  dailyRate: number,
  tier: StayDurationTier,
  babyCount: number,
  discountRate?: number,  // 0-1，默认 1
): number
```

计算逻辑：
```
subtotal = dailyRate × tier + Math.round(dailyRate × tier × 0.2 × max(0, babyCount - 1))
total = Math.round(subtotal × discountRate)
```

新增辅助函数：
```typescript
/** 计算折前总额（subtotal） */
function estimateSubtotal(dailyRate: number, tier: StayDurationTier, babyCount: number): number

/** 验证折扣率是否合法（0.5-1 范围） */
function isValidDiscountRate(rate: number): boolean
```

### 2. useAdmissionQuote.ts — 状态管理扩展

新增响应式状态：
```typescript
const discountRate = ref(1)  // 默认无折扣
```

修改 computed：
```typescript
const estimatedSubtotal = computed(() =>
  estimateSubtotal(dailyRate.value, selectedTier.value, selectedBabyIds.value.length)
)

const estimatedCost = computed(() =>
  estimateCost(dailyRate.value, selectedTier.value, selectedBabyIds.value.length, discountRate.value)
)

const discountAmount = computed(() =>
  estimatedSubtotal.value - estimatedCost.value
)
```

修改 `confirmSubmit()`：在创建入住后，调用 `generateQuote` API 时传入 `discountRate`。

新增返回值：`discountRate`, `estimatedSubtotal`, `discountAmount`

### 3. QuoteSummary.vue — UI 扩展

新增 props：
```typescript
interface Props {
  // ...existing props
  discountRate: number
  subtotal: number        // 折前总额（分）
  discountAmount: number  // 优惠金额（分）
}
```

新增 emits：
```typescript
interface Emits {
  submit: []
  'update:discountRate': [rate: number]
}
```

UI 结构：

```
┌─────────────────────────────────────────┐
│ 💰 费用预估                              │
│                                         │
│ ┌─ 折扣设置 ──────────────────────────┐ │
│ │  折扣率: [  1  ] (0-1)              │ │
│ │  快捷: [九折] [八五折] [八折]        │ │
│ │        [七五折] [七折]              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 床位费    ¥500 × 28天 = ¥14,000.00     │
│ 宝宝加收  1个额外宝宝      ¥2,800.00   │
│ ─────────────────────────────────────── │
│ 折前总额                  ¥16,800.00    │
│ 折扣 (八折)               -¥3,360.00   │
│ ─────────────────────────────────────── │
│ 折后总额                  ¥13,440.00    │
│                                         │
│ [        确认提交        ]              │
└─────────────────────────────────────────┘
```

折扣率输入控件设计：
- 使用 `<input type="number">` + Tailwind 样式，`step="0.01"`, `min="0"`, `max="1"`
- 快捷按钮使用粉色系 pill 样式（`rounded-full bg-pink-50 text-pink-600`），点击时高亮选中态
- 当 `discountRate === 1` 时，折扣相关行（折前总额、折扣、折后总额）隐藏，仅显示"预估总费用"
- 当 `discountRate !== 1` 时，显示完整折扣明细，折后总额用粉色加粗

验证规则：
- 前端：`v-model` 绑定 + `watch` 校验范围，超出 0-1 时显示红色提示文字
- 后端：`GenerateQuoteSchema` 已有 `z.coerce.number().min(0).max(1)` 验证

### 4. quote.vue — 页面接线

将 `discountRate` 从 composable 传递到 QuoteSummary：
```vue
<QuoteSummary
  v-model:discount-rate="discountRate"
  :subtotal="estimatedSubtotal"
  :discount-amount="discountAmount"
  ...existing props
/>
```

## 数据模型

本功能不涉及数据库 schema 变更。`Quote` 表已有 `discountRate` 字段（Float，默认 1）。

### 已有数据模型（无需修改）

**Quote 表**：
| 字段 | 类型 | 说明 |
|------|------|------|
| discountRate | Float | 折扣率，0-1，默认 1 |
| totalAmount | Int | 折后总额（分） |
| bedFee | Int | 床位费（分） |
| babySurcharge | Int | 宝宝加收费（分） |
| packageFee | Int | 套餐费（分） |

**GenerateQuoteDto**（已有）：
```typescript
discountRate: z.coerce.number().min(0).max(1).default(1)
```

### 前端状态模型

```typescript
// useAdmissionQuote 新增状态
{
  discountRate: Ref<number>        // 0-1，默认 1
  estimatedSubtotal: ComputedRef<number>  // 折前总额（分）
  estimatedCost: ComputedRef<number>      // 折后总额（分）
  discountAmount: ComputedRef<number>     // 优惠金额（分）
}
```


## 正确性属性

*属性（Property）是在系统所有合法执行中都应成立的特征或行为——本质上是对系统行为的形式化陈述。属性是人类可读规格与机器可验证正确性保证之间的桥梁。*

### Property 1: 折扣计算公式正确性

*For any* 非负整数 `dailyRate`、有效天数档位 `tier`（28 或 42）、非负整数 `babyCount`、以及 [0, 1] 范围内的 `discountRate`，调用 `estimateCost(dailyRate, tier, babyCount, discountRate)` 的返回值应等于 `Math.round(estimateSubtotal(dailyRate, tier, babyCount) × discountRate)`，且结果为非负整数。

**Validates: Requirements 2.2, 2.4**

### Property 2: 折扣率验证范围

*For any* 数值 `rate`，`isValidDiscountRate(rate)` 返回 `true` 当且仅当 `rate >= 0 && rate <= 1`。等价地，后端 `GenerateQuoteSchema` 的 `discountRate` 字段对 [0, 1] 范围内的值验证通过，对范围外的值验证失败。

**Validates: Requirements 1.3, 6.1**

### Property 3: 优惠金额等于折前总额减折后总额

*For any* 有效的费用参数（dailyRate, tier, babyCount）和 [0, 1] 范围内的 `discountRate`，`discountAmount` 应等于 `estimateSubtotal(args) - estimateCost(args, discountRate)`，且 `discountAmount >= 0`。

**Validates: Requirements 3.3**

### Property 4: 前后端计算一致性

*For any* 有效的费用参数（dailyRate, tier, babyCount, discountRate），前端 `estimateCost` 计算的折后总额应与后端 `BillingEngineService.calculateQuote` 在相同输入下计算的 `totalAmount` 一致。即两端使用相同公式 `Math.round(subtotal × discountRate)`。

**Validates: Requirements 5.4, 6.4**

### Property 5: 折扣明细条件展示

*For any* `discountRate` 值不等于 1，QuoteSummary 组件渲染结果应包含折前总额、折扣率、优惠金额和折后总额四个信息项。当 `discountRate` 等于 1 时，不应显示折扣相关行。

**Validates: Requirements 3.1, 3.2**

## 安全设计：报价单不可篡改

### 核心原则

护士在创建报价单时自由设置所有参数（包括折扣率 0-1），报价单一旦生成，整个 Quote 记录完全不可变（immutable）。收费员只能查看已有报价单，无法修改任何字段。

### 不可变性保障

1. **后端不提供修改 Quote 的 API**：Quote 记录创建后，没有任何端点可以更新其任何字段（discountRate、totalAmount、bedFee、babySurcharge、packageFee 等）
2. **前端只读展示**：报价单已生成后，所有信息以只读方式展示，不提供编辑入口
3. **计费引擎使用存储值**：后续计费流程直接读取 Quote 记录中的已存储数据，不接受外部覆盖

### 角色隔离

| 角色 | 创建报价单时 | 报价单已生成后 |
|------|-------------|---------------|
| 护士（创建者） | 自由设置所有参数 | 只读查看 |
| 收费员 | 不参与报价单创建 | 只读查看，无法修改任何字段 |

### 安全设计总结

| 防护层 | 措施 |
|--------|------|
| 前端 UI | 报价单已生成后全部只读 |
| 前端验证 | 折扣率范围 [0, 1] |
| 后端 API | 不提供修改 Quote 记录的任何端点 |
| 后端验证 | Zod schema 范围 [0, 1] |
| 数据层 | Quote 记录创建后所有字段不可更新 |

## 错误处理

| 场景 | 前端处理 | 后端处理 |
|------|----------|----------|
| 折扣率超出 [0, 1] | 输入控件显示红色错误提示，`canSubmit` 为 false，阻止提交 | `GenerateQuoteSchema` 验证失败，返回 422 |
| 折扣率为空 | 使用默认值 1（无折扣） | `z.coerce.number().default(1)` 自动填充 |
| 折扣率非数字 | `type="number"` 阻止非数字输入 | `z.coerce.number()` 尝试转换，失败返回 422 |
| 折前总额为 0 | 正常计算，折后总额也为 0 | 正常计算 |

前端验证策略：
- 输入时实时校验（`watch` + `isValidDiscountRate`）
- 提交前再次校验（`canSubmit` computed 中包含折扣率合法性检查）
- 双重保障：后端 Zod schema 兜底验证

## 测试策略

### 属性测试（Property-Based Testing）

使用 **fast-check** 库进行属性测试，每个属性至少运行 100 次迭代。

| 属性 | 测试文件 | 生成器 |
|------|----------|--------|
| Property 1: 折扣计算公式 | `frontend/src/utils/estimateCost.spec.ts` | `fc.nat()` (dailyRate), `fc.constantFrom(28, 42)` (tier), `fc.nat({max: 5})` (babyCount), `fc.double({min: 0, max: 1, noNaN: true})` (discountRate) |
| Property 2: 折扣率验证范围 | `frontend/src/utils/estimateCost.spec.ts` + `backend/src/modules/admission-unit/dto/generate-quote.dto.spec.ts` | `fc.double({noNaN: true})` (全范围数值) |
| Property 3: 优惠金额一致性 | `frontend/src/utils/estimateCost.spec.ts` | 同 Property 1 |
| Property 4: 前后端一致性 | `backend/src/modules/admission-unit/billing-engine.service.spec.ts` | `fc.nat()` (dailyRate), `fc.constantFrom(28, 42)` (stayDays), `fc.nat({max: 5})` (babyCount), `fc.double({min: 0, max: 1, noNaN: true})` (discountRate) |
| Property 5: 条件展示 | `frontend/src/components/quote/QuoteSummary.spec.ts` | `fc.double({min: 0, max: 0.99, noNaN: true})` (discountRate != 1) |

每个属性测试必须包含注释标签：
```typescript
// Feature: admission-quote-discount, Property 1: 折扣计算公式正确性
```

### 单元测试

| 测试目标 | 测试文件 | 关注点 |
|----------|----------|--------|
| `estimateCost` 折扣计算 | `estimateCost.spec.ts` | discountRate=1 返回原值、discountRate=0 返回 0、边界值 |
| `isValidDiscountRate` | `estimateCost.spec.ts` | 0、1、0.5 合法；-0.1、1.1、NaN 非法 |
| `QuoteSummary` 渲染 | `QuoteSummary.spec.ts` | discountRate=1 隐藏折扣行、discountRate=0.8 显示折扣明细 |
| `useAdmissionQuote` 状态 | `useAdmissionQuote.spec.ts` | discountRate 默认值、传递给 estimateCost、包含在提交参数中 |
| `GenerateQuoteSchema` 验证 | `generate-quote.dto.spec.ts` | 边界值 0/1 通过、-1/2 拒绝、缺省默认 1 |

### 测试配置

- 前端：Vitest + fast-check（`bun add -d fast-check`）
- 后端：Jest + fast-check（已安装）
- 属性测试最少 100 次迭代
- 单元测试覆盖边界值和错误条件
