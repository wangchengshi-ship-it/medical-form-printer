/**
 * @fileoverview 勾选框网格区块 Story
 * @module stories/sections/CheckboxGrid
 * @version 2.0.0
 * @author Kiro
 * @created 2023-11-20
 * @modified 2026-01-04
 * 
 * @description
 * 展示 checkbox-grid 区块的各种用法：
 * - options 模式：简单勾选框列表，共享 field
 * - items 模式：支持 per-item field 绑定、prefixLabel、text-input 类型
 */

import type { Meta, StoryObj } from '@storybook/html'
import type { CheckboxGridConfig } from '../../src/types/print-schema'
import { createSectionStory } from './_story-utils'

const meta: Meta = {
  title: 'PrintRenderer/Sections/CheckboxGrid',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// ============================================================================
// Options 模式 - 基础用法
// ============================================================================

// 基础勾选框网格
export const Basic: Story = {
  name: '基础勾选框网格 (Options 模式)',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        field: 'symptoms',
        layout: 'grid',
        columns: 4,
        options: [
          { value: 'fever', label: '发热' },
          { value: 'cough', label: '咳嗽' },
          { value: 'headache', label: '头痛' },
          { value: 'fatigue', label: '乏力' },
          { value: 'nausea', label: '恶心' },
          { value: 'vomiting', label: '呕吐' },
          { value: 'diarrhea', label: '腹泻' },
          { value: 'other', label: '其他' },
        ],
      } as CheckboxGridConfig,
    },
    { symptoms: ['fever', 'fatigue'] },
    { title: '勾选框网格 (Options 模式)', description: '4列网格布局，多选，共享 field' }
  ),
}

// Flex 布局
export const FlexLayout: Story = {
  name: 'Flex 布局',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        field: 'deliveryMethod',
        layout: 'flex',
        prefixLabel: '分娩方式：',
        options: [
          { value: 'natural', label: '顺产' },
          { value: 'cesarean', label: '剖宫产' },
          { value: 'forceps', label: '产钳助产' },
          { value: 'vacuum', label: '吸引器助产' },
        ],
      } as CheckboxGridConfig,
    },
    { deliveryMethod: ['natural'] },
    { title: 'Flex布局', description: '带前缀标签的弹性布局', height: '280px' }
  ),
}

// 单选模式
export const SingleSelect: Story = {
  name: '单选模式',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        field: 'feedingMethod',
        layout: 'flex',
        prefixLabel: '喂养方式：',
        options: [
          { value: 'breast', label: '纯母乳' },
          { value: 'formula', label: '配方奶' },
          { value: 'mixed', label: '混合喂养' },
        ],
      } as CheckboxGridConfig,
    },
    { feedingMethod: 'breast' },
    { title: '单选模式', description: '单选值（非数组）', height: '280px' }
  ),
}

// 带前缀标签
export const WithPrefixLabel: Story = {
  name: '带前缀标签',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        field: 'consciousness',
        layout: 'flex',
        prefixLabel: '意识状态：',
        options: [
          { value: 'clear', label: '清醒' },
          { value: 'drowsy', label: '嗜睡' },
          { value: 'confused', label: '意识模糊' },
          { value: 'coma', label: '昏迷' },
        ],
      } as CheckboxGridConfig,
    },
    { consciousness: ['clear'] },
    { title: '带前缀标签', description: '前缀标签 + 选项', height: '280px' }
  ),
}

// 无选中项
export const NoSelection: Story = {
  name: '无选中项',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        field: 'allergies',
        layout: 'flex',
        prefixLabel: '过敏史：',
        options: [
          { value: 'penicillin', label: '青霉素' },
          { value: 'sulfa', label: '磺胺类' },
          { value: 'food', label: '食物过敏' },
          { value: 'other', label: '其他' },
        ],
      } as CheckboxGridConfig,
    },
    { allergies: [] },
    { title: '无选中项', description: '所有选项均未选中', height: '280px' }
  ),
}

// 产后评估（真实场景）
export const PostpartumAssessment: Story = {
  name: '产后评估 (Options 模式)',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        field: 'postpartumSymptoms',
        layout: 'grid',
        columns: 3,
        options: [
          { value: 'lochia_normal', label: '恶露正常' },
          { value: 'lochia_abnormal', label: '恶露异常' },
          { value: 'uterus_normal', label: '子宫复旧良好' },
          { value: 'breast_engorgement', label: '乳房胀痛' },
          { value: 'nipple_crack', label: '乳头皲裂' },
          { value: 'wound_healing', label: '伤口愈合良好' },
        ],
      } as CheckboxGridConfig,
    },
    { postpartumSymptoms: ['lochia_normal', 'uterus_normal', 'wound_healing'] },
    { title: '产后评估', description: '真实医疗场景：产后症状评估' }
  ),
}

// ============================================================================
// Items 模式 - 高级用法
// ============================================================================

// Items 模式：Per-item field 绑定
export const ItemsWithPerItemField: Story = {
  name: 'Items 模式 - Per-item Field',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        layout: 'flex',
        items: [
          { type: 'checkbox', field: 'hasAllergy', value: true, label: '有' },
          { type: 'checkbox', field: 'hasAllergy', value: false, label: '无' },
        ],
      } as CheckboxGridConfig,
    },
    { hasAllergy: true },
    { 
      title: 'Items 模式 - Per-item Field', 
      description: '每个 item 独立绑定 field，适用于是/否选择',
      height: '280px'
    }
  ),
}

// Items 模式：带 prefixLabel
export const ItemsWithPrefixLabel: Story = {
  name: 'Items 模式 - 带 prefixLabel',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        layout: 'flex',
        items: [
          { type: 'checkbox', field: 'hasAllergy', value: true, label: '有', prefixLabel: '过敏史：' },
          { type: 'checkbox', field: 'hasAllergy', value: false, label: '无' },
        ],
      } as CheckboxGridConfig,
    },
    { hasAllergy: false },
    { 
      title: 'Items 模式 - 带 prefixLabel', 
      description: '第一个 item 带前缀标签，后续 item 无前缀',
      height: '280px'
    }
  ),
}

// Items 模式：混合类型（checkbox + text-input）
export const ItemsMixedTypes: Story = {
  name: 'Items 模式 - 混合类型',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        layout: 'flex',
        items: [
          { type: 'checkbox', field: 'hasDisease', value: true, label: '有', prefixLabel: '既往病史：' },
          { type: 'checkbox', field: 'hasDisease', value: false, label: '无' },
          { type: 'text-input', label: '病名', inputField: 'diseaseName' },
        ],
      } as CheckboxGridConfig,
    },
    { hasDisease: true, diseaseName: '高血压' },
    { 
      title: 'Items 模式 - 混合类型', 
      description: 'checkbox 和 text-input 混合使用',
      height: '280px'
    }
  ),
}

// Items 模式：checkbox 带 hasInput
export const ItemsCheckboxWithInput: Story = {
  name: 'Items 模式 - Checkbox 带输入框',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        field: 'allergyTypes',
        layout: 'flex',
        items: [
          { type: 'checkbox', value: 'drug', label: '药物过敏' },
          { type: 'checkbox', value: 'food', label: '食物过敏' },
          { type: 'checkbox', value: 'other', label: '其他', hasInput: true, inputField: 'otherAllergy' },
        ],
      } as CheckboxGridConfig,
    },
    { allergyTypes: ['drug', 'other'], otherAllergy: '花粉' },
    { 
      title: 'Items 模式 - Checkbox 带输入框', 
      description: '选中"其他"时显示输入内容',
      height: '280px'
    }
  ),
}

// Items 模式：纯 text-input
export const ItemsTextInputOnly: Story = {
  name: 'Items 模式 - 纯文本输入',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        layout: 'flex',
        items: [
          { type: 'text-input', label: '体温', inputField: 'temperature', prefixLabel: '生命体征：' },
          { type: 'text-input', label: '脉搏', inputField: 'pulse' },
          { type: 'text-input', label: '呼吸', inputField: 'respiration' },
        ],
      } as CheckboxGridConfig,
    },
    { temperature: '36.5℃', pulse: '72次/分', respiration: '18次/分' },
    { 
      title: 'Items 模式 - 纯文本输入', 
      description: '多个 text-input 组合，适用于生命体征等场景',
      height: '280px'
    }
  ),
}

// Items 模式：Grid 布局
export const ItemsGridLayout: Story = {
  name: 'Items 模式 - Grid 布局',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        layout: 'grid',
        columns: 3,
        items: [
          { type: 'checkbox', field: 'symptom1', value: true, label: '发热' },
          { type: 'checkbox', field: 'symptom2', value: true, label: '咳嗽' },
          { type: 'checkbox', field: 'symptom3', value: true, label: '头痛' },
          { type: 'checkbox', field: 'symptom4', value: true, label: '乏力' },
          { type: 'checkbox', field: 'symptom5', value: true, label: '恶心' },
          { type: 'checkbox', field: 'symptom6', value: true, label: '其他' },
        ],
      } as CheckboxGridConfig,
    },
    { symptom1: true, symptom3: true, symptom5: true },
    { 
      title: 'Items 模式 - Grid 布局', 
      description: '3列网格布局，每个 item 独立 field'
    }
  ),
}

// 真实场景：产妇入院评估 - 过敏史
export const RealWorldAllergyHistory: Story = {
  name: '真实场景 - 过敏史',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        layout: 'flex',
        items: [
          { type: 'checkbox', field: 'hasAllergy', value: true, label: '有', prefixLabel: '过敏史：' },
          { type: 'checkbox', field: 'hasAllergy', value: false, label: '无' },
          { type: 'text-input', label: '', inputField: 'allergyDetail' },
        ],
      } as CheckboxGridConfig,
    },
    { hasAllergy: true, allergyDetail: '青霉素、磺胺类药物' },
    { 
      title: '真实场景 - 过敏史', 
      description: '产妇入院评估表中的过敏史字段',
      height: '280px'
    }
  ),
}

// 真实场景：产妇入院评估 - 既往病史
export const RealWorldMedicalHistory: Story = {
  name: '真实场景 - 既往病史',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        layout: 'flex',
        items: [
          { type: 'checkbox', field: 'hasMedicalHistory', value: true, label: '有', prefixLabel: '既往病史：' },
          { type: 'checkbox', field: 'hasMedicalHistory', value: false, label: '无' },
          { type: 'text-input', label: '病名', inputField: 'medicalHistoryDetail' },
        ],
      } as CheckboxGridConfig,
    },
    { hasMedicalHistory: true, medicalHistoryDetail: '高血压、糖尿病' },
    { 
      title: '真实场景 - 既往病史', 
      description: '产妇入院评估表中的既往病史字段',
      height: '280px'
    }
  ),
}
