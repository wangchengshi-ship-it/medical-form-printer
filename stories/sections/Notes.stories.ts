/**
 * @fileoverview 备注区块 Story
 * @module stories/sections/Notes
 * @description Notes 用于显示静态文本内容
 */

import type { Meta, StoryObj } from '@storybook/html'
import type { NotesConfig } from '../../src/types/print-schema'
import { createSectionStory, createMultiSectionStory } from './_story-utils'

const meta: Meta = {
  title: 'PrintRenderer/Sections/Notes',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// 基础备注
export const Basic: Story = {
  name: '基础备注',
  render: createSectionStory(
    {
      type: 'notes',
      config: {
        content: '这是一段备注内容，用于显示静态文本信息。',
      } as NotesConfig,
    },
    {},
    { title: '基础备注', description: '简单的文本备注', height: '280px' }
  ),
}

// 带边框
export const WithBorder: Story = {
  name: '带边框',
  render: createSectionStory(
    {
      type: 'notes',
      config: {
        content: '这是带边框的备注内容，边框可以帮助区分不同区域。',
        showBorder: true,
      } as NotesConfig,
    },
    {},
    { title: '带边框备注', description: '显示边框的备注区域', height: '280px' }
  ),
}

// 多行文本
export const MultiLine: Story = {
  name: '多行文本',
  render: createSectionStory(
    {
      type: 'notes',
      config: {
        content: `08:00 晨间护理，测量生命体征正常
10:00 协助母乳喂养，指导正确哺乳姿势
12:00 午餐后观察，患者精神状态良好
14:00 产后康复操指导
16:00 观察恶露情况，颜色量正常
18:00 晚间护理，患者无不适主诉`,
        showBorder: true,
      } as NotesConfig,
    },
    {},
    { title: '多行文本', description: '支持多行文本显示', height: '350px' }
  ),
}

// 医嘱说明（真实场景）
export const MedicalOrders: Story = {
  name: '医嘱说明',
  render: createMultiSectionStory(
    [
      {
        type: 'section-title',
        config: { text: '出院医嘱', align: 'left' },
      },
      {
        type: 'notes',
        config: {
          content: `1. 继续口服益母草颗粒，每日3次，每次1袋
2. 保持会阴部清洁干燥，每日温水清洗
3. 产后42天复查，如有异常及时就诊
4. 坚持母乳喂养，注意乳房护理
5. 适当活动，避免重体力劳动`,
          showBorder: true,
        } as NotesConfig,
      },
    ],
    {},
    { title: '出院医嘱', description: '真实医疗场景：出院医嘱说明', height: '380px' }
  ),
}

// 注意事项
export const Cautions: Story = {
  name: '注意事项',
  render: createSectionStory(
    {
      type: 'notes',
      config: {
        content: '注意：本表单仅供医护人员内部使用，请妥善保管患者隐私信息。',
        showBorder: true,
      } as NotesConfig,
    },
    {},
    { title: '注意事项', description: '警示性备注', height: '280px' }
  ),
}
