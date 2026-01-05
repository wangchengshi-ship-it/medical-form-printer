# Implementation Plan: Table Header Merge

## Overview

实现表格表头单元格合并功能，采用 GoF 设计模式（策略模式、建造者模式、装饰器模式）。实现分为类型定义、核心策略、建造者、装饰器、集成和测试六个阶段。

## Tasks

- [x] 1. 类型定义和接口
  - [x] 1.1 在 `src/types/print-schema.ts` 中添加 HeaderCell 和 HeaderRow 类型
    - 添加 HeaderCell 接口 (text, colspan, rowspan, width, field)
    - 添加 HeaderRow 接口 (cells: HeaderCell[])
    - 扩展 TableConfig 添加可选的 headerRows 属性
    - 添加 @since v2.0.0 注释
    - _Requirements: 3.1, 4.1_

- [x] 2. 策略模式实现
  - [x] 2.1 创建 `src/renderer/section-renderers/table/header-strategy.ts`
    - 定义 HeaderRenderStrategy 接口
    - 实现 SimpleHeaderStrategy (从 columns 生成单行表头)
    - 实现 MultiRowHeaderStrategy (使用 headerRows 配置)
    - 添加 calculateCellMatrix 函数处理 rowspan 位置计算
    - 添加设计模式 JSDoc 注释
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 3.1, 3.2_

  - [x] 2.2 编写策略模式属性测试
    - **Property 1: Colspan/Rowspan 属性正确渲染**
    - **Property 3: 多行表头渲染**
    - **Validates: Requirements 1.1, 1.2, 2.1, 2.2, 3.1, 3.2**

- [x] 3. 建造者模式实现
  - [x] 3.1 创建 `src/renderer/section-renderers/table/header-builder.ts`
    - 实现 HeaderCellBuilder 类
    - 实现 HeaderRowBuilder 类
    - 实现 TableHeaderBuilder 类
    - 提供流畅的链式 API
    - 添加设计模式 JSDoc 注释
    - _Requirements: 4.1, 4.2_

  - [x] 3.2 编写建造者模式属性测试
    - **Property 4: 配置序列化往返**
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 4. 装饰器模式实现
  - [x] 4.1 创建 `src/renderer/section-renderers/table/header-renderer.ts`
    - 定义 HeaderRenderer 接口
    - 实现 BaseHeaderRenderer 类 (使用策略模式)
    - 实现 RowNumberHeaderDecorator 类
    - 添加设计模式 JSDoc 注释
    - _Requirements: 5.4_

  - [x] 4.2 编写装饰器模式属性测试
    - **Property 5: 有效 HTML 输出**
    - **Validates: Requirements 5.1, 5.3, 5.4**

- [x] 5. 集成和重构
  - [x] 5.1 重构 `src/renderer/section-renderers/table.ts`
    - 使用新的 HeaderRenderer 替换原有表头渲染逻辑
    - 保持向后兼容性
    - 添加 @deprecated 注释到旧代码
    - 添加 @migration 文件头注释
    - _Requirements: 3.2, 5.1_

  - [x] 5.2 创建模块导出 `src/renderer/section-renderers/table/index.ts`
    - 导出所有公共接口和类
    - 导出 TableHeaderBuilder 供外部使用
    - _Requirements: 4.1_

  - [x] 5.3 编写集成属性测试
    - **Property 2: 单元格位置正确性**
    - **Validates: Requirements 2.3, 3.3, 5.2**

- [ ] 6. Checkpoint - 确保所有测试通过
  - 运行所有单元测试和属性测试
  - 确保向后兼容性测试通过
  - 如有问题请询问用户

- [x] 7. Storybook 示例
  - [x] 7.1 更新 `stories/sections/Table.stories.ts`
    - 添加多行表头示例 (血压分收缩压/舒张压)
    - 添加建造者模式使用示例
    - 添加复杂三行表头示例
    - _Requirements: 1.1, 2.1, 3.1_

- [ ] 8. Final Checkpoint - 确保所有测试通过
  - 运行完整测试套件
  - 验证 Storybook 示例正常显示
  - 如有问题请询问用户

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- 所有新代码需要添加 @since v2.0.0 注释
- 废弃代码需要添加 @deprecated 注释

