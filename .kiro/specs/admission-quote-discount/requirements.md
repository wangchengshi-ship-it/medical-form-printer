# 需求文档：入住报价单打折功能

## 简介

在入住报价单工作台中增加打折功能，允许操作人员在生成报价时设置折扣，实时预览折后价格，并将折扣信息持久化到报价单记录中。后端计费引擎已支持 `discountRate`（0-1 的折扣率），本需求主要补齐前端折扣交互、前端费用预估中的折扣计算，以及前后端折扣数据的完整传递链路。

## 术语表

- **Quote_Page**：入住报价单工作台页面（`quote.vue`）
- **QuoteSummary**：费用预估区块组件，展示费用明细和提交按钮
- **EstimateCost**：前端费用预估纯函数模块（`estimateCost.ts`）
- **AdmissionQuote_Composable**：报价单工作台核心 Composable（`useAdmissionQuote.ts`）
- **BillingEngine**：后端计费引擎服务，负责报价计算
- **Discount_Rate**：折扣率，取值范围 0-1 的小数，1 表示无折扣，0.8 表示八折
- **Subtotal**：折前总额（床位费 + 宝宝加收费 + 套餐费）
- **Total_Amount**：折后总额 = Subtotal × Discount_Rate

## 需求

### 需求 1：折扣率输入控件

**用户故事：** 作为操作人员，我想在报价单工作台中设置折扣率，以便为客户提供优惠价格。

#### 验收标准

1. THE Quote_Page SHALL 在费用预估区块中提供折扣率输入控件
2. THE Quote_Page SHALL 将折扣率输入控件的默认值设为 1（即无折扣）
3. WHEN 操作人员输入折扣率时，THE Quote_Page SHALL 仅接受 0 到 1 之间（含边界）的数值
4. IF 操作人员输入超出 0-1 范围的折扣率，THEN THE Quote_Page SHALL 显示验证错误提示并阻止提交
5. THE Quote_Page SHALL 提供常用折扣快捷按钮（九折 0.9、八五折 0.85、八折 0.8、七五折 0.75、七折 0.7）

### 需求 2：前端折扣费用预估

**用户故事：** 作为操作人员，我想在设置折扣后实时看到折后价格，以便确认最终报价。

#### 验收标准

1. WHEN 折扣率发生变化时，THE EstimateCost SHALL 重新计算并返回折后总额
2. THE EstimateCost SHALL 按以下公式计算折后总额：折后总额 = Math.round(折前总额 × 折扣率)
3. WHEN 折扣率为 1 时，THE EstimateCost SHALL 返回与折前总额相同的值
4. THE EstimateCost SHALL 保证折后总额为非负整数（单位：分）
5. FOR ALL 有效的费用参数和折扣率，先计算折前总额再应用折扣 SHALL 产生与直接调用带折扣的 estimateCost 相同的结果（幂等性）

### 需求 3：折扣费用明细展示

**用户故事：** 作为操作人员，我想清楚地看到折前价、折扣金额和折后价的明细，以便向客户解释报价。

#### 验收标准

1. WHILE 折扣率不等于 1 时，THE QuoteSummary SHALL 显示折前总额、折扣率、优惠金额和折后总额
2. WHILE 折扣率等于 1 时，THE QuoteSummary SHALL 仅显示总费用，不显示折扣相关行
3. THE QuoteSummary SHALL 将优惠金额显示为折前总额与折后总额的差值
4. THE QuoteSummary SHALL 以元为单位展示所有金额（分转元，保留两位小数）

### 需求 4：折扣率状态管理

**用户故事：** 作为操作人员，我想在报价单工作台中的折扣设置能与其他选项联动，以便流畅地完成报价流程。

#### 验收标准

1. THE AdmissionQuote_Composable SHALL 管理折扣率的响应式状态，默认值为 1
2. THE AdmissionQuote_Composable SHALL 将折扣率传递给 EstimateCost 进行费用预估计算
3. THE AdmissionQuote_Composable SHALL 在提交入住时将折扣率包含在请求参数中

### 需求 5：后端折扣数据传递

**用户故事：** 作为系统，我需要将前端设置的折扣率正确传递到后端报价生成流程，以便生成准确的报价单记录。

#### 验收标准

1. WHEN 前端提交报价请求时，THE BillingEngine SHALL 接收并使用前端传入的折扣率进行报价计算
2. THE BillingEngine SHALL 将折扣率存储到 Quote 记录的 discountRate 字段中
3. IF 前端未传入折扣率，THEN THE BillingEngine SHALL 使用默认值 1（无折扣）
4. THE BillingEngine SHALL 确保折后总额 = Math.round(折前总额 × 折扣率)，与前端预估一致

### 需求 6：折扣率输入验证

**用户故事：** 作为系统，我需要在前后端同时验证折扣率的合法性，以防止无效数据进入系统。

#### 验收标准

1. THE GenerateQuote_DTO SHALL 验证折扣率为 0 到 1 之间的数值（含边界）
2. IF 后端收到超出 0-1 范围的折扣率，THEN THE BillingEngine SHALL 返回 400 错误
3. THE Quote_Page SHALL 在前端提交前验证折扣率的合法性
4. FOR ALL 合法的折扣率值，前端 EstimateCost 计算结果 SHALL 与后端 BillingEngine 计算结果一致（前后端一致性）

### 需求 7：报价单不可篡改

**用户故事：** 作为管理员，我需要确保报价单一旦生成后所有内容不可被任何人修改，以防止收费环节的数据篡改。

#### 验收标准

1. THE Quote_Page SHALL 允许护士（报价单创建者）在 0 到 1 范围内自由设置折扣率，无需额外权限
2. WHEN 报价单已生成（Quote 记录已创建），THEN 后端 SHALL 不提供任何修改 Quote 记录的 API 端点
3. THE Quote 记录的所有字段（discountRate、totalAmount、bedFee、babySurcharge、packageFee 等）SHALL 在创建后不可更新（immutable）
4. THE Quote_Page SHALL 在报价单已生成后，以只读方式展示所有报价信息，不提供任何编辑入口
5. THE BillingEngine SHALL 在后续计费流程中直接使用 Quote 记录中已存储的数据，不接受外部覆盖
