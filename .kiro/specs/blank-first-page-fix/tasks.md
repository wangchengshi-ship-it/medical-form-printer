# Implementation Plan: Blank First Page Fix

## Overview

修复 Smart Pagination 第一页空白问题，通过统一 `measureAll` 函数的 section ID 格式与 `buildSectionMap` 保持一致。

## Tasks

- [x] 1. 更新 measureAll 函数的 ID 生成逻辑
  - [x] 1.1 修改 `src/pagination/content-measurer.ts` 中的 `measureAll` 函数
    - 将 info-grid、checkbox-grid 等 section 类型的 ID 格式从 `{type}-{index}` 改为 `section-{index}`
    - 使用统一的 section 索引计数器
    - 添加代码注释说明 ID 格式规范
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_
  - [x] 1.2 编写属性测试验证 Section ID 格式一致性
    - **Property 1: Section ID 格式一致性**
    - **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2**

- [x] 2. 验证 table 项 ID 向后兼容
  - [x] 2.1 确认 table-header 和 table-row 的 ID 格式不变
    - 检查现有代码确保 table 相关 ID 格式保持不变
    - _Requirements: 2.3, 2.4, 4.5_
  - [x] 2.2 编写属性测试验证 Table 项 ID 向后兼容
    - **Property 2: Table 项 ID 向后兼容**
    - **Validates: Requirements 2.3, 2.4, 4.5**

- [ ] 3. Checkpoint - 确保测量逻辑正确
  - 运行现有测试确保不破坏现有功能
  - 确保所有测试通过，如有问题请询问用户

- [x] 4. 验证渲染正确性
  - [x] 4.1 验证 Storybook 中 Smart Pagination 示例正常工作
    - 测试 "14 Rows (2 Pages)" 示例，确认第一页不再空白
    - 测试 "21 Rows (3 Pages)" 示例，确认多页分页正常
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 4.2 编写属性测试验证 Section 渲染正确性
    - **Property 3: Section 渲染正确性**
    - **Validates: Requirements 3.1, 3.2, 3.3**

- [ ] 5. 回归测试
  - [ ] 5.1 运行完整测试套件
    - 确保所有现有测试通过
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 6. Final checkpoint - 确保所有测试通过
  - 运行所有测试包括新的属性测试
  - 验证 Storybook 示例正确渲染
  - 确保所有测试通过，如有问题请询问用户

## Notes

- 所有任务都是必需的，确保全面测试
- 每个任务都引用了具体的需求以便追溯
- Checkpoint 确保增量验证
- 属性测试验证通用正确性属性
- 现有的 `buildSectionMap` 函数不需要修改，因为它已经使用正确的格式

