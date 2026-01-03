# Implementation Plan: Test Coverage Improvement

## Overview

本实现计划将系统性地为 `medical-print-renderer` 项目添加测试，目标是将覆盖率从 53.71% 提升至 75%+。采用增量方式，每个模块完成后验证覆盖率提升。

## Tasks

- [x] 1. Visitor 模式测试
  - [x] 1.1 创建 visitors.test.ts 基础结构
    - 创建测试文件 `test/visitors.test.ts`
    - 导入所有 Visitor 相关模块
    - 设置 fast-check 生成器
    - _Requirements: 1.1-1.11_

  - [x] 1.2 实现 FormatVisitor 单元测试
    - 测试 visitString 方法
    - 测试 visitNumber 方法
    - 测试 visitBoolean 方法（☑/☐ 符号）
    - 测试 visitDate 方法
    - 测试 visitArray 方法
    - 测试 visitNull 方法
    - 测试 visitObject 方法
    - 测试自定义选项（dateFormat, booleanSymbols）
    - _Requirements: 1.1-1.6_

  - [x] 1.3 实现 FormatVisitor 属性测试
    - **Property 1: FormatVisitor 格式化正确性**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

  - [x] 1.4 实现 ValidationVisitor 单元测试
    - 测试必填字段验证
    - 测试数字字段验证
    - 测试日期字段验证
    - 测试 reset 方法
    - _Requirements: 1.7-1.9_

  - [x] 1.5 实现 ValidationVisitor 属性测试
    - **Property 2: ValidationVisitor 错误检测**
    - **Validates: Requirements 1.7, 1.8, 1.9**

  - [x] 1.6 实现 MeasureVisitor 单元测试
    - 测试文本测量
    - 测试高度计算
    - 测试 getTotalHeight 方法
    - 测试自定义选项（lineHeight, charsPerLine）
    - _Requirements: 1.10_

  - [x] 1.7 实现 MeasureVisitor 属性测试
    - **Property 3: MeasureVisitor 高度计算**
    - **Validates: Requirements 1.10**

  - [x] 1.8 实现 FormDataTraverser 单元测试
    - 测试基本遍历
    - 测试类型推断
    - 测试 extractFieldTypes 方法
    - _Requirements: 1.11_

  - [x] 1.9 实现 FormDataTraverser 属性测试
    - **Property 4: FormDataTraverser 遍历完整性**
    - **Validates: Requirements 1.11**

- [ ] 2. Checkpoint - Visitor 测试验证
  - 运行测试确保所有 Visitor 测试通过
  - 验证 visitors 模块覆盖率提升至 80%+

- [ ] 3. Composite 模式测试
  - [ ] 3.1 创建 composite.test.ts 基础结构
    - 创建测试文件 `test/composite.test.ts`
    - 导入所有 Composite 相关模块
    - 设置 fast-check 生成器
    - _Requirements: 2.1-2.7_

  - [ ] 3.2 实现 LeafSection 单元测试
    - 测试 isContainer() 返回 false
    - 测试 getType() 返回正确类型
    - 测试 render() 方法
    - 测试 getConfig() 方法
    - _Requirements: 2.1_

  - [ ] 3.3 实现 ContainerSection 单元测试
    - 测试 isContainer() 返回 true
    - 测试子节点管理（addChild, removeChild）
    - 测试 renderChildren() 方法
    - 测试递归子组件创建
    - _Requirements: 2.2, 2.3_

  - [ ] 3.4 实现 SectionTreeTraverser 单元测试
    - 测试 traverse() 深度优先遍历
    - 测试 collectLeaves() 方法
    - 测试 getDepth() 方法
    - _Requirements: 2.4, 2.5, 2.6_

  - [ ] 3.5 实现 Composite 属性测试
    - **Property 5: Composite 模式树操作**
    - **Validates: Requirements 2.4, 2.5, 2.6**

  - [ ] 3.6 实现 Section Tree 渲染属性测试
    - **Property 6: Section Tree 渲染**
    - **Validates: Requirements 2.7**

- [ ] 4. Checkpoint - Composite 测试验证
  - 运行测试确保所有 Composite 测试通过
  - 验证 composite 模块覆盖率提升至 80%+

- [ ] 5. Template Method 模式测试
  - [ ] 5.1 创建 templates.test.ts 基础结构
    - 创建测试文件 `test/templates.test.ts`
    - 导入所有 Template 相关模块
    - 设置测试数据
    - _Requirements: 3.1-3.7_

  - [ ] 5.2 实现 SinglePageRenderer 单元测试
    - 测试 render() 方法
    - 测试 renderHeader() 方法
    - 测试 renderBody() 方法
    - 测试 renderFooter() 方法
    - 测试水印渲染
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 5.3 实现 PaginatedPageRenderer 单元测试
    - 测试 setPages() 方法
    - 测试 setOptions() 方法
    - 测试 renderAll() 方法
    - 测试页码渲染
    - 测试续页标题后缀
    - _Requirements: 3.4, 3.5_

  - [ ] 5.4 实现 Template 属性测试
    - **Property 7: Template 渲染器内容包含**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.6, 3.7**

- [ ] 6. Checkpoint - Template 测试验证
  - 运行测试确保所有 Template 测试通过
  - 验证 templates 模块覆盖率提升至 80%+

- [ ] 7. Pagination 扩展测试
  - [ ] 7.1 创建 pagination-extended.test.ts
    - 创建测试文件 `test/pagination-extended.test.ts`
    - 导入 pagination 模块
    - _Requirements: 4.1-4.5_

  - [ ] 7.2 实现 ContentMeasurer 测试
    - 测试文本内容测量
    - 测试 section 测量
    - _Requirements: 4.1_

  - [ ] 7.3 实现 PageBreakCalculator 测试
    - 测试分页点计算
    - 测试边界情况
    - _Requirements: 4.2_

  - [ ] 7.4 实现 OverflowHandler 测试
    - 测试溢出处理
    - 测试内容分布
    - _Requirements: 4.3_

  - [ ] 7.5 实现 PageDimensions 测试
    - 测试可用空间计算
    - 测试边距处理
    - _Requirements: 4.4_

  - [ ] 7.6 实现 Pagination 属性测试
    - **Property 8: Pagination 高度约束**
    - **Validates: Requirements 4.5**

- [ ] 8. Checkpoint - Pagination 测试验证
  - 运行测试确保所有 Pagination 测试通过
  - 验证 pagination 模块覆盖率提升至 70%+

- [ ] 9. Builder 扩展测试
  - [ ] 9.1 扩展 builders.test.ts
    - 添加更多 HtmlElementBuilder 测试
    - 添加属性测试
    - _Requirements: 5.1-5.6_

  - [ ] 9.2 实现 Builder 属性测试
    - **Property 9: Builder HTML 结构**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.6**

- [ ] 10. Types 模块测试
  - [ ] 10.1 创建 types.test.ts
    - 创建测试文件 `test/types.test.ts`
    - 导入类型定义和类型守卫
    - _Requirements: 6.1-6.4_

  - [ ] 10.2 实现类型守卫单元测试
    - 测试 PrintSchema 验证
    - 测试 SectionConfig 验证
    - 测试 RenderOptions 验证
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 10.3 实现 Type Guard 属性测试
    - **Property 10: Type Guard 正确性**
    - **Validates: Requirements 6.1, 6.3, 6.4**

- [ ] 11. Utils 扩展测试
  - [ ] 11.1 创建 utils-extended.test.ts
    - 创建测试文件 `test/utils-extended.test.ts`
    - 导入 utils 模块
    - _Requirements: 7.1-7.4_

  - [ ] 11.2 实现 escapeHtml 测试
    - 测试特殊字符转义
    - 测试边界情况
    - _Requirements: 7.1_

  - [ ] 11.3 实现 watermark 工具测试
    - 测试 renderWatermarkHtml
    - 测试 extractWatermarkOptions
    - _Requirements: 7.2, 7.3_

  - [ ] 11.4 实现 HTML Escape 属性测试
    - **Property 11: HTML Escape Round-Trip**
    - **Validates: Requirements 7.1, 7.4**

- [ ] 12. Final Checkpoint - 整体覆盖率验证
  - 运行完整测试套件
  - 验证整体覆盖率达到 75%+
  - 确保所有测试通过

## Notes

- All tasks are required for comprehensive test coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases

