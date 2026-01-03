/**
 * @fileoverview Composite pattern - Section nesting
 * @module renderer/composite
 * 
 * @description
 * Uses Composite pattern to uniformly handle single sections and nested sections.
 * SectionComponent interface defines unified render method,
 * LeafSection handles leaf nodes, ContainerSection handles container nodes.
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
 * Section component interface (Composite pattern's Component)
 * Defines unified render method, both leaf and container nodes implement this interface
 */
export interface SectionComponent {
  /** Render component */
  render(data: FormData, options?: RenderOptions): string
  /** Get component type */
  getType(): SectionType
  /** Whether this is a container node */
  isContainer(): boolean
}

/**
 * Leaf section (Composite pattern's Leaf)
 * Handles section types without child nodes: info-grid, table, checkbox-grid, etc.
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
 * Container section (Composite pattern's Composite)
 * Handles section types with child nodes: container, inline-row
 */
export class ContainerSection implements SectionComponent {
  private children: SectionComponent[] = []

  constructor(
    private type: SectionType,
    private config: ContainerConfig | InlineRowConfig
  ) {
    // Recursively create child components
    const children = (config as ContainerConfig).children || []
    for (const child of children) {
      this.children.push(createSectionComponentFromChild(child))
    }
  }

  render(data: FormData, options?: RenderOptions): string {
    // Container rendering is handled by renderSection
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
   * Recursively render all child nodes
   * @param data - Form data
   * @param options - Render options
   * @returns Array of child node HTML strings
   */
  renderChildren(data: FormData, options?: RenderOptions): string[] {
    return this.children.map(child => child.render(data, options))
  }
}

/**
 * Create section component from ContainerChild
 */
function createSectionComponentFromChild(child: ContainerChild): SectionComponent {
  if (child.type === 'container' || child.type === 'inline-row') {
    return new ContainerSection(child.type, child.config as ContainerConfig | InlineRowConfig)
  }
  return new LeafSection(child.type, child.config)
}

/**
 * Create section component from PrintSection
 * @param section - Print section configuration
 * @returns Section component instance
 */
export function createSectionComponent(section: PrintSection): SectionComponent {
  if (section.type === 'container' || section.type === 'inline-row') {
    return new ContainerSection(section.type, section.config as ContainerConfig | InlineRowConfig)
  }
  return new LeafSection(section.type, section.config)
}

/**
 * Section tree traverser
 * Provides depth-first traversal capability for section tree
 */
export class SectionTreeTraverser {
  /**
   * Depth-first traversal
   * @param root - Root component
   * @param visitor - Visitor function
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
   * Collect all leaf nodes
   * @param root - Root component
   * @returns Array of leaf nodes
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
   * Calculate tree depth
   * @param root - Root component
   * @returns Maximum depth of tree
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
 * Create section component tree from PrintSection array
 * @param sections - Print section configuration array
 * @returns Section component array
 */
export function createSectionTree(sections: PrintSection[]): SectionComponent[] {
  return sections.map(section => createSectionComponent(section))
}

/**
 * Render section component tree
 * @param components - Section component array
 * @param data - Form data
 * @param options - Render options
 * @returns HTML string
 */
export function renderSectionTree(
  components: SectionComponent[],
  data: FormData,
  options?: RenderOptions
): string {
  return components.map(component => component.render(data, options)).join('\n')
}
