# Implementation Plan: 医疗表单打印渲染库

## Overview

实现一个与框架无关的 TypeScript 库，用于将结构化表单数据渲染为可打印的 HTML/PDF，支持智能分页。

## Tasks

- [x] 1. 项目初始化
  - [x] 1.1 创建项目结构
    - package.json、tsconfig.json、tsup.config.ts、vitest.config.ts
    - _Requirements: 1.3, 1.4, 1.5_
  
  - [x] 1.2 定义核心类型
    - PrintSchema、FormData、RenderOptions、Theme 类型定义
    - _Requirements: 1.1, 1.5_

- [x] 2. 样式系统
  - [x] 2.1 实现默认主题
    - 字体、颜色、间距、字号配置
    - _Requirements: 4.1, 4.4_
  
  - [x] 2.2 实现 CSS 生成器
    - 根据主题生成完整 CSS
    - 打印优化样式
    - _Requirements: 4.2, 4.3, 4.5_

- [x] 2.5 基准单位系统重构（新增）
  - [x] 2.5.1 定义基准单位常量
    - 创建 `src/styles/base-unit.ts`
    - 定义 BASE_UNIT 常量（如 1mm 或 10pt）
    - 所有尺寸值都是 BASE_UNIT 的倍数
    - _Requirements: 4.1, 4.4_
  
  - [x] 2.5.2 重构主题配置为倍数系统
    - fontSize: BASE_UNIT * 1（正文）、BASE_UNIT * 1.4（标题）
    - lineHeight: BASE_UNIT * 1.8
    - padding: BASE_UNIT * 0.8（内边距）
    - margin: BASE_UNIT * 0.6（外边距）
    - gap: BASE_UNIT * 0.5（间距）
    - borderWidth: BASE_UNIT * 0.05（边框）
    - _Requirements: 4.1, 4.4_
  
  - [x] 2.5.3 实现缩放函数
    - createScaledTheme(baseUnit: number) - 根据基准值生成完整主题
    - scaleValue(multiplier: number, baseUnit: number) - 计算缩放后的值
    - 支持 mm、pt、px 单位输出
    - _Requirements: 4.1_
  
  - [x] 2.5.4 更新 CSS 生成器使用基准单位
    - 所有 CSS 值从基准单位计算
    - 支持通过修改 BASE_UNIT 实现整体放大/缩小
    - 保持比例关系不变
    - _Requirements: 4.2, 4.3_
  
  - [x] 2.5.5 编写基准单位系统测试和 strory
    - 验证所有尺寸值都是基准单位的倍数
    - 验证缩放后比例关系保持不变
    - **Property 14: 缩放比例一致性** - 任意两个尺寸值的比例在缩放前后保持不变
    - _Requirements: 4.1, 4.4_

- [x] 3. 数据格式化器
  - [x] 3.1 实现格式化函数
    - formatDate、formatBoolean、formatNumber、formatValue
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4. 区块渲染器（基础）
  - [x] 4.1 实现 info-grid 渲染器（基础版）
    - 信息网格布局，支持 text/checkbox/date/number/signature 类型
    - _Requirements: 2.1_
  
  - [x] 4.2 实现 table 渲染器
    - 数据表格布局
    - _Requirements: 2.2_
  
  - [x] 4.3 实现 checkbox-grid 渲染器（基础版）
    - 勾选框网格布局，options 模式
    - _Requirements: 2.3_
  
  - [x] 4.4 实现 signature-area 渲染器
    - 签名区域布局
    - _Requirements: 2.4_
  
  - [x] 4.5 实现 notes 渲染器
    - 备注区域布局
    - _Requirements: 2.5_
  
  - [x] 4.6 实现 free-text 渲染器
    - 自由文本布局
    - _Requirements: 2.6_
  
  - [x] 4.7 实现渲染器注册机制
    - registerSectionRenderer、getSectionRenderer
    - _Requirements: 2.7_

- [x] 5. HTML 渲染核心
  - [x] 5.1 实现 renderToHtml 函数
    - 页眉、区块、页脚渲染
    - 水印支持
    - _Requirements: 1.1, 1.2, 3.3, 3.4_

- [x] 6. PDF 生成（Node.js）
  - [x] 6.1 实现 renderToPdf 函数
    - Puppeteer HTML 转 PDF
    - _Requirements: 6.1, 6.5_
  
  - [x] 6.2 实现 mergePdfs 函数
    - pdf-lib 合并多个 PDF
    - _Requirements: 6.4, 7.1, 7.2_

- [x] 7. 测试
  - [x] 7.1 编写单元测试
    - HTML 渲染测试
    - _Requirements: 1.1, 1.2_
  
  - [x] 7.2 编写格式化器测试
    - formatDate、formatBoolean、formatNumber、formatValue、isChecked
    - 属性测试：日期格式化一致性、布尔值符号、数字解析
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 7.3 编写区块渲染器测试
    - info-grid、table、checkbox-grid、signature-area、notes、free-text
    - 渲染器注册机制测试
    - 属性测试：标签完整性、行数一致性、选中数量
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [x] 7.4 编写样式系统测试
    - defaultTheme、mergeTheme、generateCss
    - 属性测试：主题完整性、CSS 类选择器
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 7.5 编写属性测试
    - HTML 结构完整性
    - XSS 防护
    - 数据完整性
    - 水印功能
    - 主题一致性
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.2, 3.4, 4.1, 4.4, 8.1_

- [x] 8. Checkpoint - 核心功能完成
  - [x] 运行所有测试确保通过 (92 tests passed)
  - 如有问题请询问用户

- [x] 9. 区块渲染器（扩展）
  - [x] 9.1 实现 section-title 渲染器
    - 创建 `src/renderer/section-renderers/section-title.ts`
    - 区块标题渲染，支持 align 配置（left/center/right）
    - 更新 SectionType 类型定义
    - 创建 `stories/SectionTitle.stories.ts` - 展示不同对齐方式
    - _Requirements: 2.1_
  
  - [x] 9.2 实现 medical-checkbox-row 渲染器
    - 创建 `src/renderer/section-renderers/medical-checkbox-row.ts`
    - 医疗勾选行，支持复杂格式：
      - 前缀标签（如"排便情况："）
      - 选项列表（□有/□无）
      - inputFormat 模板格式（如 "{input}次/日"）
      - inputLabel 简单格式（如 "疾病名称"）
      - extraInputs 额外输入项
    - 添加 MedicalCheckboxRowConfig 类型定义
    - 创建 `stories/MedicalCheckboxRow.stories.ts` - 展示各种医疗勾选行格式
    - _Requirements: 2.3_
  
  - [x] 9.3 扩展 info-grid 单元格类型
    - 添加 `checkbox-inline` 类型（内联勾选框，如 ['无', '有']）
    - 添加 `compound` 类型（复合字段，如 '{systolic}/{diastolic}mmHg'）
    - 添加 `textarea` 类型（多行文本，支持 minHeight）
    - 添加 `checkbox-text` 类型（勾选框+文本）
    - 支持 suffix 后缀（如 '℃', 'kg'）
    - 支持 width 自定义宽度
    - 创建 `stories/InfoGridExtended.stories.ts` - 展示所有扩展单元格类型
    - _Requirements: 2.1_
  
  - [x] 9.4 扩展 checkbox-grid 配置
    - 添加 items 模式（CheckboxItem[]）
    - 支持 layout 选项（grid/flex）
    - 支持 prefixLabel 前缀标签
    - 支持 type: 'text-input' 纯文本输入项
    - 创建 `stories/CheckboxGridExtended.stories.ts` - 展示 items 模式和 flex 布局
    - _Requirements: 2.3_
  
  - [x] 9.5 实现 inline-row 渲染器（行内分列）
    - 创建 `src/renderer/section-renderers/inline-row.ts`
    - 支持一行分多份布局（inline-flex）
    - 支持 columns 配置（如 [1, 2, 1] 表示 1:2:1 比例）
    - 支持 gap 间距配置
    - 子元素可以是任意区块类型
    - 创建 `stories/InlineRow.stories.ts` - 展示不同分列比例
    - _Requirements: 2.1_
  
  - [x] 9.6 实现 container 渲染器（区块嵌套）
    - 创建 `src/renderer/section-renderers/container.ts`
    - 支持 children 子区块数组
    - 支持 direction 布局方向（row/column）
    - 支持 border 边框配置
    - 支持 padding 内边距配置
    - 递归渲染子区块
    - 创建 `stories/Container.stories.ts` - 展示嵌套布局
    - _Requirements: 2.7_
  
  - [x] 9.7 编写扩展区块渲染器测试
    - section-title 渲染测试
    - medical-checkbox-row 渲染测试
    - info-grid 扩展类型测试
    - checkbox-grid items 模式测试
    - inline-row 分列布局测试
    - container 嵌套渲染测试
    - _Requirements: 2.1, 2.3, 2.7_

- [x] 9.8 Storybook Stories 汇总
  - [x] 9.8.1 基础区块 Stories
    - `stories/sections/InfoGrid.stories.ts` - 信息网格（基础 + 扩展类型）
    - `stories/sections/Table.stories.ts` - 数据表格
    - `stories/sections/CheckboxGrid.stories.ts` - 勾选框网格（options + items 模式）
    - `stories/sections/SignatureArea.stories.ts` - 签名区域
    - `stories/sections/Notes.stories.ts` - 备注区域
    - `stories/sections/FreeText.stories.ts` - 自由文本
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [x] 9.8.2 扩展区块 Stories
    - `stories/sections/SectionTitle.stories.ts` - 区块标题
    - `stories/sections/MedicalCheckboxRow.stories.ts` - 医疗勾选行
    - `stories/sections/InlineRow.stories.ts` - 行内分列
    - `stories/sections/Container.stories.ts` - 区块嵌套
    - _Requirements: 2.1, 2.3, 2.7_
  
  - [x] 9.8.3 页面级 Stories
    - `stories/pages/SinglePage.stories.ts` - 单页表单
    - `stories/pages/PaginatedPage.stories.ts` - 分页表单
    - `stories/pages/HeaderFooter.stories.ts` - 页眉页脚展示
    - `stories/pages/Watermark.stories.ts` - 水印效果
    - _Requirements: 1.1, 3.3, 3.4, 11.1_
  
  - [x] 9.8.4 样式系统 Stories
    - `stories/styles/BaseUnit.stories.ts` - 基准单位缩放效果
    - `stories/styles/Theme.stories.ts` - 主题配置
    - `stories/styles/Typography.stories.ts` - 字体排版
    - _Requirements: 4.1, 4.4_
  
  - [x] 9.8.5 真实表单 Stories ✅
    - `stories/forms/MaternalAdmission.stories.ts` - 产妇入院评估单 ✅
    - `stories/forms/NewbornNursing.stories.ts` - 新生儿护理记录单 ✅
    - `stories/forms/DailyLog.stories.ts` - 每日记录表 ✅
    - `stories/forms/DischargeAssessment.stories.ts` - 出院评估单 ✅
    - _Requirements: 1.1, 1.2_

- [x] 10. HTML 生成器重构
  - [x] 10.1 引入 HTML 生成库
    - 评估并选择 HTML 生成库（如 `common-tags`、`htm`、`hyperscript` 或自定义 builder）
    - 创建 `src/utils/html-builder.ts` 封装 HTML 生成
    - 支持类型安全的标签生成
    - _Requirements: 1.1_
  
  - [x] 10.2 重构现有渲染器使用 HTML builder
    - 替换字符串拼接为 builder 调用
    - 统一 HTML 转义处理
    - 保持输出一致性
    - _Requirements: 1.1, 1.2_
  
  - [x] 10.3 CSS 内置化
    - 将所有样式内联到生成的 HTML 中
    - 创建 `src/styles/inline-styles.ts` 定义内联样式映射
    - 支持 style 属性直接注入
    - 确保样式不依赖外部 CSS 文件
    - _Requirements: 4.3_

- [x] 10.5 GoF 设计模式重构
  - [x] 10.5.1 Strategy 模式 - 区块渲染策略
    - 创建 `src/renderer/strategies/` 目录
    - 定义 `SectionRenderStrategy` 接口
    - 每种区块类型实现独立的 Strategy 类
    - `StrategyContext` 根据 section.type 选择策略
    - 替换现有的 switch/if-else 分支
    - _Requirements: 2.7_
  
  - [x] 10.5.2 Factory 模式 - 渲染器工厂
    - 创建 `src/renderer/factory/` 目录
    - `SectionRendererFactory` - 创建区块渲染器实例
    - `FormatterFactory` - 创建格式化器实例
    - 支持注册自定义渲染器
    - _Requirements: 2.7_
  
  - [x] 10.5.3 Builder 模式 - HTML 构建器
    - 创建 `src/renderer/builders/` 目录
    - `HtmlBuilder` - 链式构建 HTML 元素
    - `PageBuilder` - 构建完整页面结构
    - `TableBuilder` - 构建表格结构
    - 支持 fluent API：`builder.tag('div').class('foo').child(...).build()`
    - _Requirements: 1.1_
  
  - [x] 10.5.4 Composite 模式 - 区块嵌套
    - `SectionComponent` 接口（render 方法）
    - `LeafSection` - 叶子节点（info-grid、table 等）
    - `ContainerSection` - 容器节点（children 数组）
    - 统一处理单个区块和嵌套区块
    - _Requirements: 2.7_
  
  - [x] 10.5.5 Template Method 模式 - 页面渲染流程
    - `AbstractPageRenderer` 基类
    - 定义渲染骨架：renderHeader → renderBody → renderFooter
    - 子类实现具体步骤：`SinglePageRenderer`、`PaginatedPageRenderer`
    - _Requirements: 1.1, 11.1_
  
  - [x] 10.5.6 Visitor 模式 - 数据格式化
    - `FormDataVisitor` 接口
    - `FormatVisitor` - 格式化数据用于显示
    - `ValidationVisitor` - 验证数据完整性
    - `MeasureVisitor` - 测量内容高度
    - 分离数据遍历和操作逻辑
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 10.5.7 编写设计模式重构测试
    - 验证 Strategy 模式正确选择渲染策略
    - 验证 Factory 模式创建正确实例
    - 验证 Builder 模式生成正确 HTML
    - 验证 Composite 模式递归渲染
    - _Requirements: 1.1, 2.7_

- [x] 11. 智能分页模块
  - [x] 11.1 定义分页相关类型
    - 创建 `src/pagination/types.ts`
    - PageDimensions、MeasurableItem、MeasurableItemType、PageContent、PageBreakResult
    - OverflowFieldConfig（溢出字段配置）
    - PaginationConfig（分页配置：showHeaderOnEachPage、showFooterOnEachPage、showSignatureOnEachPage）
    - PageHeaderConfig、PageFooterConfig（每页页眉页脚配置）
    - 从前端 `usePrintPagination.ts` 迁移类型定义
    - _Requirements: 9.1, 9.5, 9.7_
  
  - [x] 11.2 实现页面尺寸配置
    - 创建 `src/pagination/page-dimensions.ts`
    - PAGE_16K (185mm × 260mm)、PAGE_A4、PAGE_A5 预设配置
    - mmToPx、pxToMm 单位转换函数
    - calculateUsableHeight、calculateUsableWidth 计算函数
    - _Requirements: 3.1, 3.6, 9.5_
  
  - [x] 11.3 实现分页算法核心
    - 创建 `src/pagination/page-break-calculator.ts`
    - calculatePageBreaks 函数
    - buildTableHeaderMap、findTableHeader 辅助函数
    - 确保表格行不被分割
    - 续页自动重复表头
    - 预留表头高度计算
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6_
  
  - [x] 11.4 实现溢出字段分页（Textarea 分页）
    - 创建 `src/pagination/overflow-handler.ts`
    - 支持 overflowFields 配置（指定哪些字段溢出时分页）
    - 支持 overflowFirstLineChars 配置（第一页显示的最大字符数，默认 60）
    - getOverflowFirstLine(fieldName, value, maxChars) - 获取第一页显示内容
    - getOverflowRest(fieldName, value, maxChars) - 获取续页显示内容
    - hasOverflowContent(fieldName, value, maxChars) - 判断是否有溢出内容
    - 参考前端 `PrintModeForm.vue` 第 130-175 行实现
    - _Requirements: 9.1, 9.7_
  
  - [x] 11.5 创建分页模块入口
    - 创建 `src/pagination/index.ts`
    - 导出所有分页相关类型和函数
    - 更新 `src/index.ts` 导出分页模块
    - _Requirements: 9.1_
  
  - [x] 11.6 编写分页算法属性测试
    - 创建 `test/pagination.test.ts`
    - **Property 8: 分页内容完整性** - 所有项分配到恰好一个页面
    - **Property 9: 表格行不分割** - 单行不跨页
    - **Property 10: 续页表头重复** - 有表格行的续页包含表头
    - **Property 11: 页面高度约束** - 页面内容不超过可用高度
    - **Property 12: 单位转换可逆性** - mmToPx(pxToMm(x)) ≈ x
    - **Property 13: 溢出字段分割正确性** - firstLine + rest = original
    - _Requirements: 9.1, 9.2, 9.3, 9.6, 9.7_

- [x] 12. Checkpoint - 分页算法完成
  - [x] 运行所有测试确保通过
  - [x] 验证分页算法正确性
  - 如有问题请询问用户

- [x] 13. 内容测量器（浏览器环境）
  - [x] 13.1 定义测量器类型
    - 创建 `src/pagination/measurer-types.ts`
    - MeasureConfig、MeasureResult、MeasureElementOptions
    - _Requirements: 10.1_
  
  - [x] 13.2 实现测量容器创建
    - 创建 `src/pagination/content-measurer.ts`
    - createMeasureContainer 函数
    - destroyMeasureContainer 函数
    - 隐藏容器，模拟打印样式
    - _Requirements: 10.1_
  
  - [x] 13.3 实现元素高度测量
    - measureElementHeight 函数
    - 包含 line-height、padding、margin
    - _Requirements: 10.2_
  
  - [x] 13.4 实现表格行批量测量
    - measureTableRows 函数
    - 处理可变高度的表格行
    - _Requirements: 10.3, 10.5_
  
  - [x] 13.5 实现文本高度估算
    - estimateTextHeight 函数
    - 用于无 DOM 环境的降级方案
    - _Requirements: 10.4_
  
  - [x] 13.6 实现 measureAll 函数
    - 测量整个内容容器的所有元素
    - 返回 MeasurableItem[] 数组
    - _Requirements: 10.5, 10.6_

- [x] 14. 分页渲染器
  - [x] 14.1 实现分页 HTML 渲染
    - 创建 `src/pagination/paginated-renderer.ts`
    - renderPaginatedHtml 函数
    - 每页独立的 .print-page 元素
    - _Requirements: 11.1_
  
  - [x] 14.2 实现每页页眉渲染
    - 每页顶部渲染页眉（医院名、科室、标题）
    - 续页标题添加 "(续)" 标记
    - 支持 showHeaderOnEachPage 配置
    - _Requirements: 3.3, 11.4_
  
  - [x] 14.3 实现每页页脚渲染
    - 每页底部渲染页脚
    - 支持 showFooterOnEachPage 配置
    - 支持 showSignatureOnEachPage 配置（签名区域作为页脚一部分）
    - _Requirements: 3.4, 11.3_
  
  - [x] 14.4 实现表头重复渲染
    - 续页自动插入表格表头
    - _Requirements: 11.2_
  
  - [x] 14.5 实现页码显示
    - "第 X 页 / 共 Y 页" 格式
    - 支持自定义页码格式
    - _Requirements: 11.3_
  
  - [x] 14.6 添加 CSS 分页规则
    - page-break-before、page-break-after
    - 更新 css-generator.ts 添加分页样式
    - _Requirements: 11.5, 11.6_

- [ ] 15. Checkpoint - 分页功能完成
  - [ ] 运行所有测试确保通过
  - [ ] 验证前端集成
  - 如有问题请询问用户

## Notes

- 项目基础结构已创建完成
- 核心渲染逻辑已实现（92 tests passed）
- 测试覆盖率：
  - formatters: 99.13%
  - renderer: 98.77%
  - section-renderers: 100%
  - styles: 100%
- PDF 生成需要 Puppeteer 环境，未包含在单元测试中
- 分页算法从前端 `usePrintPagination.ts` 迁移，保持逻辑一致
- 内容测量器从前端 `useContentMeasurer.ts` 迁移，移除 Vue 依赖
- 内容测量器仅在浏览器环境可用，Node.js 环境需要 Puppeteer 测量

## 基准单位系统设计

整页使用单一基准常量（BASE_UNIT）控制所有尺寸，实现一键放大/缩小：

```typescript
// 基准单位（默认 1mm）
const BASE_UNIT = 1 // mm

// 所有尺寸都是 BASE_UNIT 的倍数
const theme = {
  fontSize: {
    body: BASE_UNIT * 3.5,      // 3.5mm ≈ 10pt
    title: BASE_UNIT * 5,       // 5mm ≈ 14pt
    small: BASE_UNIT * 3,       // 3mm ≈ 8.5pt
  },
  lineHeight: BASE_UNIT * 1.8,  // 1.8 倍行高
  spacing: {
    xs: BASE_UNIT * 0.5,        // 0.5mm
    sm: BASE_UNIT * 1,          // 1mm
    md: BASE_UNIT * 2,          // 2mm
    lg: BASE_UNIT * 4,          // 4mm
  },
  padding: {
    cell: BASE_UNIT * 0.8,      // 0.8mm
    section: BASE_UNIT * 2,     // 2mm
    page: BASE_UNIT * 10,       // 10mm
  },
  border: BASE_UNIT * 0.1,      // 0.1mm
}

// 放大 20%：只需修改 BASE_UNIT = 1.2
// 缩小 10%：只需修改 BASE_UNIT = 0.9
```

## 迁移参考

前端已有实现可作为迁移参考：
- `international-postpartum-frontend/src/composables/usePrintPagination.ts` - 分页算法
- `international-postpartum-frontend/src/composables/usePrintPagination.test.ts` - 分页测试
- `international-postpartum-frontend/src/composables/useContentMeasurer.ts` - 内容测量器
- `international-postpartum-frontend/src/components/form/print/PrintModeForm.vue` - 溢出字段处理（第 130-175 行）
- `international-postpartum-frontend/src/types/form/print.ts` - PrintPaginationConfig 类型定义（overflowFields、overflowFirstLineChars）
