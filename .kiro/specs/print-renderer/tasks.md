# Implementation Plan: 医疗表单打印渲染库

## Overview

实现一个与框架无关的 TypeScript 库，用于将结构化表单数据渲染为可打印的 HTML/PDF。

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

- [x] 3. 数据格式化器
  - [x] 3.1 实现格式化函数
    - formatDate、formatBoolean、formatNumber、formatValue
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4. 区块渲染器
  - [x] 4.1 实现 info-grid 渲染器
    - 信息网格布局
    - _Requirements: 2.1_
  
  - [x] 4.2 实现 table 渲染器
    - 数据表格布局
    - _Requirements: 2.2_
  
  - [x] 4.3 实现 checkbox-grid 渲染器
    - 勾选框网格布局
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
  - [ ] 验证前端集成
  - [ ] 验证后端集成
  - 如有问题请询问用户

## Notes

- 项目基础结构已创建完成
- 核心渲染逻辑已实现
- 测试覆盖率：
  - formatters: 99.13%
  - renderer: 98.77%
  - section-renderers: 100%
  - styles: 100%
- PDF 生成需要 Puppeteer 环境，未包含在单元测试中
