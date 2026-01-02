/**
 * @fileoverview Composite 模式 - 区块嵌套
 * @module renderer/composite
 * 
 * @description
 * 使用 Composite 模式统一处理单个区块和嵌套区块。
 * SectionComponent 接口定义统一的渲染方法，
 * LeafSection 处理叶子节点，ContainerSection 处理容器节点。
 */

import type { 
  PrintSection, 
  FormData, 
  ContainerConfig,
  InlineRowConfig,
  SectionType,
  SectionConfig,
  ContainerChild,
} from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderSection } from '../section-renderers'

/**
 * 区块组件接口（Composite 模式的 Component）
 * 定义统一的渲染方法，叶子节点和容器节点都实现此接口
 */
export interface SectionComponent {
  /** 渲染组件 */
  render(data: FormData, options?: RenderOptions): string
  /** 获取组件类型 */
  getType(): SectionType
  /** 是否为容器节点 */
  isContainer(): boolean
}

/**
 * 叶子区块（Composite 模式的 Leaf）
 * 处理不包含子节点的区块类型：info-grid、table、checkbox-grid 等
 */
export class LeafSection implements SectionComponent {
  constructor(
    private type: SectionType,
    private config: SectionConfig
  ) {}

  render(data: FormData, options?: RenderOptions): string {
    return renderSection(this.type, this.config, data, options)
  }

  getType(): SectionType {
    return this.type
  }

  isContainer(): boolean {
    return false
  }

  getConfig(): SectionConfig {
    return this.config
  }
}

/**
 * 容器区块（Composite 模式的 Composite）
 * 处理包含子节点的区块类型：container、inline-row
 */
export class ContainerSection implements SectionComponent {
  private children: SectionComponent[] = []

  constructor(
    private type: SectionType,
    private config: ContainerConfig | InlineRowConfig
  ) {
    // 递归创建子组件
    const children = (config as ContainerConfig).children || []
    for (const child of children) {
      this.children.push(createSectionComponentFromChild(child))
    }
  }

  render(data: FormData, options?: RenderOptions): string {
    // 容器本身的渲染由 renderSection 处理
    return renderSection(this.type, this.config, data, options)
  }

  getType(): SectionType {
    return this.type
  }

  isContainer(): boolean {
    return true
  }

  getConfig(): ContainerConfig | InlineRowConfig {
    return this.config
  }

  getChildren(): SectionComponent[] {
    return this.children
  }

  addChild(child: SectionComponent): void {
    this.children.push(child)
  }

  removeChild(child: SectionComponent): void {
    const index = this.children.indexOf(child)
    if (index !== -1) {
      this.children.splice(index, 1)
    }
  }

  /**
   * 递归渲染所有子节点
   * @param data - 表单数据
   * @param options - 渲染选项
   * @returns 子节点 HTML 字符串数组
   */
  renderChildren(data: FormData, options?: RenderOptions): string[] {
    return this.children.map(child => child.render(data, options))
  }
}

/**
 * 从 ContainerChild 创建区块组件
 */
function createSectionComponentFromChild(child: ContainerChild): SectionComponent {
  if (child.type === 'container' || child.type === 'inline-row') {
    return new ContainerSection(child.type, child.config as ContainerConfig | InlineRowConfig)
  }
  return new LeafSection(child.type, child.config)
}

/**
 * 从 PrintSection 创建区块组件
 * @param section - 打印区块配置
 * @returns 区块组件实例
 */
export function createSectionComponent(section: PrintSection): SectionComponent {
  if (section.type === 'container' || section.type === 'inline-row') {
    return new ContainerSection(section.type, section.config as ContainerConfig | InlineRowConfig)
  }
  return new LeafSection(section.type, section.config)
}

/**
 * 区块树遍历器
 * 提供深度优先遍历区块树的能力
 */
export class SectionTreeTraverser {
  /**
   * 深度优先遍历
   * @param root - 根组件
   * @param visitor - 访问函数
   */
  traverse(root: SectionComponent, visitor: (component: SectionComponent, depth: number) => void): void {
    this.traverseInternal(root, visitor, 0)
  }

  private traverseInternal(
    component: SectionComponent,
    visitor: (component: SectionComponent, depth: number) => void,
    depth: number
  ): void {
    visitor(component, depth)
    if (component.isContainer()) {
      const container = component as ContainerSection
      for (const child of container.getChildren()) {
        this.traverseInternal(child, visitor, depth + 1)
      }
    }
  }

  /**
   * 收集所有叶子节点
   * @param root - 根组件
   * @returns 叶子节点数组
   */
  collectLeaves(root: SectionComponent): LeafSection[] {
    const leaves: LeafSection[] = []
    this.traverse(root, (component) => {
      if (!component.isContainer()) {
        leaves.push(component as LeafSection)
      }
    })
    return leaves
  }

  /**
   * 计算树的深度
   * @param root - 根组件
   * @returns 树的最大深度
   */
  getDepth(root: SectionComponent): number {
    let maxDepth = 0
    this.traverse(root, (_, depth) => {
      if (depth > maxDepth) {
        maxDepth = depth
      }
    })
    return maxDepth
  }
}

/**
 * 从 PrintSection 数组创建区块组件树
 * @param sections - 打印区块配置数组
 * @returns 区块组件数组
 */
export function createSectionTree(sections: PrintSection[]): SectionComponent[] {
  return sections.map(section => createSectionComponent(section))
}

/**
 * 渲染区块组件树
 * @param components - 区块组件数组
 * @param data - 表单数据
 * @param options - 渲染选项
 * @returns HTML 字符串
 */
export function renderSectionTree(
  components: SectionComponent[],
  data: FormData,
  options?: RenderOptions
): string {
  return components.map(component => component.render(data, options)).join('\n')
}
