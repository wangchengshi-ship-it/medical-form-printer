import type { Meta, StoryObj } from '@storybook/html'
import { defaultTheme, mergeTheme, generateIsolatedCss, ISOLATION_ROOT_CLASS, CSS_NAMESPACE } from '../../src/styles'

// 命名空间前缀
const ns = CSS_NAMESPACE

const meta: Meta = {
  title: 'PrintRenderer/Styles/Typography',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 字体展示
export const FontFamily: Story = {
  name: '字体系列',
  render: () => {
    const theme = mergeTheme()
    const css = generateIsolatedCss()
    
    const container = document.createElement('div')
    container.innerHTML = `
      <div class="${ISOLATION_ROOT_CLASS}">
        <style>${css}</style>
        <div style="padding: 20px; background: #fff;">
          <h3 style="margin-top: 0;">字体系列</h3>
          
          <div style="margin-bottom: 24px;">
            <h4>正文字体 (body)</h4>
            <p style="font-size: 14px;">
              Sample Hospital - Postpartum Care Center
            </p>
            <p style="font-size: 14px;">
              The quick brown fox jumps over the lazy dog. 0123456789
            </p>
            <code style="font-size: 12px; color: #666;">Source Han Serif SC (内嵌思源宋体)</code>
          </div>
          
          <div style="margin-bottom: 24px;">
            <h4>标题字体 (heading)</h4>
            <p style="font-size: 18px; font-weight: bold;">
              Maternal Admission Assessment
            </p>
            <code style="font-size: 12px; color: #666;">Source Han Serif SC (内嵌思源宋体)</code>
          </div>
          
          <div style="margin-bottom: 24px;">
            <h4>等宽字体 (mono)</h4>
            <p style="font-family: ${theme.fonts.mono}; font-size: 14px;">
              住院号: 2024010001 | 房号: 301
            </p>
            <code style="font-size: 12px; color: #666;">${theme.fonts.mono}</code>
          </div>
        </div>
      </div>
    `
    
    return container
  },
}

// 字号展示
export const FontSize: Story = {
  name: '字号层级',
  render: () => {
    const theme = mergeTheme()
    const css = generateIsolatedCss()
    
    const container = document.createElement('div')
    container.innerHTML = `
      <div class="${ISOLATION_ROOT_CLASS}">
        <style>${css}</style>
        <div style="padding: 20px; background: #fff;">
          <h3 style="margin-top: 0;">字号层级</h3>
          
          <div style="margin-bottom: 16px; padding: 8px; border-bottom: 1px solid #eee;">
            <span style="font-size: ${theme.fontSize.hospitalName}; font-weight: bold;">
              医院名称 (hospitalName)
            </span>
            <code style="margin-left: 16px; font-size: 12px; color: #666;">${theme.fontSize.hospitalName}</code>
          </div>
          
          <div style="margin-bottom: 16px; padding: 8px; border-bottom: 1px solid #eee;">
            <span style="font-size: ${theme.fontSize.formTitle}; font-weight: bold;">
              表单标题 (formTitle)
            </span>
            <code style="margin-left: 16px; font-size: 12px; color: #666;">${theme.fontSize.formTitle}</code>
          </div>
          
          <div style="margin-bottom: 16px; padding: 8px; border-bottom: 1px solid #eee;">
            <span style="font-size: ${theme.fontSize.sectionTitle}; font-weight: bold;">
              区块标题 (sectionTitle)
            </span>
            <code style="margin-left: 16px; font-size: 12px; color: #666;">${theme.fontSize.sectionTitle}</code>
          </div>
          
          <div style="margin-bottom: 16px; padding: 8px; border-bottom: 1px solid #eee;">
            <span style="font-size: ${theme.fontSize.body};">
              正文内容 (body)
            </span>
            <code style="margin-left: 16px; font-size: 12px; color: #666;">${theme.fontSize.body}</code>
          </div>
          
          <div style="margin-bottom: 16px; padding: 8px; border-bottom: 1px solid #eee;">
            <span style="font-size: ${theme.fontSize.small};">
              小字说明 (small)
            </span>
            <code style="margin-left: 16px; font-size: 12px; color: #666;">${theme.fontSize.small}</code>
          </div>
        </div>
      </div>
    `
    
    return container
  },
}

// 颜色展示
export const Colors: Story = {
  name: '颜色系统',
  render: () => {
    const theme = mergeTheme()
    const css = generateIsolatedCss()
    
    const container = document.createElement('div')
    container.innerHTML = `
      <div class="${ISOLATION_ROOT_CLASS}">
        <style>${css}</style>
        <div style="padding: 20px; background: #fff;">
          <h3 style="margin-top: 0;">颜色系统</h3>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            ${Object.entries(theme.colors).map(([name, color]) => `
              <div style="padding: 16px; border: 1px solid #eee; border-radius: 4px;">
                <div style="width: 100%; height: 40px; background: ${color}; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 8px;"></div>
                <div style="font-weight: bold;">${name}</div>
                <code style="font-size: 12px; color: #666;">${color}</code>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `
    
    return container
  },
}

// 间距展示
export const Spacing: Story = {
  name: '间距系统',
  render: () => {
    const theme = mergeTheme()
    const css = generateIsolatedCss()
    
    const container = document.createElement('div')
    container.innerHTML = `
      <div class="${ISOLATION_ROOT_CLASS}">
        <style>${css}</style>
        <div style="padding: 20px; background: #fff;">
          <h3 style="margin-top: 0;">间距系统</h3>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            ${Object.entries(theme.spacing).map(([name, value]) => `
              <div style="padding: 16px; border: 1px solid #eee; border-radius: 4px;">
                <div style="font-weight: bold; margin-bottom: 8px;">${name}</div>
                <div style="background: #e3f2fd; height: 20px; width: ${value}; border: 1px solid #90caf9;"></div>
                <code style="font-size: 12px; color: #666; margin-top: 8px; display: block;">${value}</code>
              </div>
            `).join('')}
          </div>
          
          <div style="margin-top: 24px; padding: 16px; border: 1px solid #eee; border-radius: 4px;">
            <div style="font-weight: bold; margin-bottom: 8px;">边框宽度 (borderWidth)</div>
            <div style="background: #000; height: ${theme.borderWidth}; width: 100px;"></div>
            <code style="font-size: 12px; color: #666; margin-top: 8px; display: block;">${theme.borderWidth}</code>
          </div>
        </div>
      </div>
    `
    
    return container
  },
}

// 中文排版示例
export const ChineseTypography: Story = {
  name: '中文排版示例',
  render: () => {
    const theme = mergeTheme()
    const css = generateIsolatedCss()
    
    const container = document.createElement('div')
    container.innerHTML = `
      <div class="${ISOLATION_ROOT_CLASS}">
        <style>${css}</style>
        <div style="padding: 20px; background: #fff;">
          <h3 style="margin-top: 0;">中文排版示例</h3>
          
          <div style="margin-bottom: 24px;">
            <h4 style="font-size: ${theme.fontSize.sectionTitle};">一、产妇基本信息</h4>
            <p style="font-size: ${theme.fontSize.body}; line-height: 1.8;">
              患者张三，女，28岁，于2024年1月15日入院。主诉：产后3天，乳房胀痛2天。
              患者于3天前顺产一女婴，产后第2天开始出现双侧乳房胀痛，伴有轻度发热，体温37.5℃。
              无明显红肿，无脓性分泌物。
            </p>
          </div>
          
          <div style="margin-bottom: 24px;">
            <h4 style="font-size: ${theme.fontSize.sectionTitle};">二、既往病史</h4>
            <p style="font-size: ${theme.fontSize.body}; line-height: 1.8;">
              既往体健，否认高血压、糖尿病、心脏病等慢性病史。否认肝炎、结核等传染病史。
              否认手术、外伤史。否认药物、食物过敏史。否认输血史。
            </p>
          </div>
          
          <div style="font-size: ${theme.fontSize.small}; color: ${theme.colors.textSecondary};">
            * 以上信息由护士填写，入院24小时内完成
          </div>
        </div>
      </div>
    `
    
    return container
  },
}
