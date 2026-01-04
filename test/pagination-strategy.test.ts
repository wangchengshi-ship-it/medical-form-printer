/**
 * @fileoverview Pagination Strategy Pattern Property Tests
 * @module test/pagination-strategy
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-04
 *
 * @description
 * Property-based tests for the pagination strategy pattern implementation.
 * Tests the PaginationContext class and strategy selection consistency.
 *
 * @requirements
 * - 4.3: Context provides getApplicableStrategies method
 *
 * @dependencies
 * - fast-check - Property-based testing library
 * - vitest - Test runner
 * - ../src/pagination/strategies/pagination-strategy - Strategy interface and context
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  PaginationContext,
  type PaginationStrategy,
  type PrintSchemaWithPagination,
  type PaginationRenderOptions,
} from '../src/pagination/strategies/pagination-strategy'
import { SmartPaginationStrategy } from '../src/pagination/strategies/smart/smart-pagination-strategy'
import { OverflowPaginationStrategy } from '../src/pagination/strategies/overflow/overflow-pagination-strategy'
import type { FormData } from '../src/types/print-schema'

// ==================== Property 1: Strategy Interface Compliance ====================

describe('Property 1: Strategy Interface Compliance', () => {
  /**
   * Property 1: Strategy Interface Compliance
   *
   * *For any* class implementing `PaginationStrategy`, the `name` property SHALL be a non-empty string,
   * `shouldApply` SHALL return a boolean, and `render` SHALL return a non-empty string when given valid inputs.
   *
   * **Feature: pagination-strategy-pattern, Property 1: Strategy Interface Compliance**
   * **Validates: Requirements 1.2, 1.3, 1.4**
   */

  const strategies: PaginationStrategy[] = [
    new SmartPaginationStrategy(),
    new OverflowPaginationStrategy(),
  ]

  /**
   * Arbitrary for valid PrintSchemaWithPagination that enables smart pagination
   */
  const validSmartPaginationSchemaArb: fc.Arbitrary<PrintSchemaWithPagination> = fc.record({
    pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
    orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
    header: fc.record({
      hospital: fc.string({ minLength: 1, maxLength: 50 }),
      department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
    }),
    sections: fc.constant([]),
    footer: fc.option(
      fc.record({
        notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        showPageNumber: fc.boolean(),
      }),
      { nil: undefined }
    ),
    pagination: fc.record({
      enabled: fc.constant(true),
      mode: fc.option(fc.constantFrom('auto', 'manual') as fc.Arbitrary<'auto' | 'manual'>, { nil: undefined }),
      smartPagination: fc.record({
        enabled: fc.constant(true),
        minRowHeight: fc.option(fc.integer({ min: 4, max: 20 }), { nil: undefined }),
      }),
    }),
  })

  /**
   * Arbitrary for valid PrintSchemaWithPagination that enables overflow pagination
   */
  const validOverflowPaginationSchemaArb: fc.Arbitrary<PrintSchemaWithPagination> = fc.record({
    pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
    orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
    header: fc.record({
      hospital: fc.string({ minLength: 1, maxLength: 50 }),
      department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
    }),
    sections: fc.constant([]),
    footer: fc.option(
      fc.record({
        notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        showPageNumber: fc.boolean(),
      }),
      { nil: undefined }
    ),
    pagination: fc.record({
      enabled: fc.constant(true),
      mode: fc.option(fc.constantFrom('auto', 'manual') as fc.Arbitrary<'auto' | 'manual'>, { nil: undefined }),
      overflow: fc.record({
        fields: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        firstLineChars: fc.option(fc.integer({ min: 10, max: 200 }), { nil: undefined }),
      }),
    }),
  })

  /**
   * Arbitrary for valid FormData
   */
  const validFormDataArb: fc.Arbitrary<FormData> = fc.dictionary(
    fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_]*$/.test(s)),
    fc.oneof(
      fc.string({ maxLength: 100 }),
      fc.integer(),
      fc.boolean(),
      fc.constant(null),
      fc.constant(undefined)
    )
  )

  /**
   * Test: name property is a non-empty string
   * **Validates: Requirements 1.2**
   */
  it('should have name property as non-empty string for all strategies', () => {
    for (const strategy of strategies) {
      expect(typeof strategy.name).toBe('string')
      expect(strategy.name.length).toBeGreaterThan(0)
      expect(strategy.name.trim()).toBe(strategy.name) // No leading/trailing whitespace
    }
  })

  /**
   * Test: shouldApply returns boolean for any schema
   * **Validates: Requirements 1.3**
   */
  it('should return boolean from shouldApply for any schema', () => {
    const anySchemaArb: fc.Arbitrary<PrintSchemaWithPagination> = fc.record({
      pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
      orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
      header: fc.record({
        hospital: fc.string({ minLength: 1, maxLength: 50 }),
        department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
        title: fc.string({ minLength: 1, maxLength: 50 }),
      }),
      sections: fc.constant([]),
      footer: fc.option(
        fc.record({
          notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
          showPageNumber: fc.boolean(),
        }),
        { nil: undefined }
      ),
      pagination: fc.option(
        fc.record({
          enabled: fc.boolean(),
          mode: fc.option(fc.constantFrom('auto', 'manual') as fc.Arbitrary<'auto' | 'manual'>, { nil: undefined }),
          overflow: fc.option(
            fc.record({
              fields: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }), { nil: undefined }),
              firstLineChars: fc.option(fc.integer({ min: 10, max: 200 }), { nil: undefined }),
            }),
            { nil: undefined }
          ),
          smartPagination: fc.option(
            fc.record({
              enabled: fc.boolean(),
              minRowHeight: fc.option(fc.integer({ min: 4, max: 20 }), { nil: undefined }),
            }),
            { nil: undefined }
          ),
        }),
        { nil: undefined }
      ),
    })

    fc.assert(
      fc.property(anySchemaArb, (schema) => {
        for (const strategy of strategies) {
          const result = strategy.shouldApply(schema)
          expect(typeof result).toBe('boolean')
        }
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Test: SmartPaginationStrategy.render returns non-empty string for valid inputs
   * **Validates: Requirements 1.4**
   */
  it('SmartPaginationStrategy.render should return non-empty string for valid inputs', () => {
    const smartStrategy = new SmartPaginationStrategy()

    fc.assert(
      fc.property(validSmartPaginationSchemaArb, validFormDataArb, (schema, data) => {
        // Only test when strategy applies
        if (!smartStrategy.shouldApply(schema)) {
          return true // Skip this case
        }

        const result = smartStrategy.render(schema, data)
        
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
        // Should contain HTML structure
        expect(result).toContain('<')
        expect(result).toContain('>')
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Test: OverflowPaginationStrategy.render returns non-empty string for valid inputs
   * **Validates: Requirements 1.4**
   */
  it('OverflowPaginationStrategy.render should return non-empty string for valid inputs', () => {
    const overflowStrategy = new OverflowPaginationStrategy()

    fc.assert(
      fc.property(validOverflowPaginationSchemaArb, validFormDataArb, (schema, data) => {
        // Only test when strategy applies
        if (!overflowStrategy.shouldApply(schema)) {
          return true // Skip this case
        }

        const result = overflowStrategy.render(schema, data)
        
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
        // Should contain HTML structure
        expect(result).toContain('<')
        expect(result).toContain('>')
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Test: Both strategies implement all required interface methods
   * **Validates: Requirements 1.2, 1.3, 1.4**
   */
  it('should implement all required interface methods', () => {
    for (const strategy of strategies) {
      // Check name property exists and is string
      expect(strategy).toHaveProperty('name')
      expect(typeof strategy.name).toBe('string')
      
      // Check shouldApply method exists and is function
      expect(strategy).toHaveProperty('shouldApply')
      expect(typeof strategy.shouldApply).toBe('function')
      
      // Check render method exists and is function
      expect(strategy).toHaveProperty('render')
      expect(typeof strategy.render).toBe('function')
    }
  })

  /**
   * Test: Strategy names are unique
   * **Validates: Requirements 1.2**
   */
  it('should have unique strategy names', () => {
    const names = strategies.map(s => s.name)
    const uniqueNames = new Set(names)
    
    expect(uniqueNames.size).toBe(names.length)
  })

  /**
   * Test: Strategy names follow naming convention
   * **Validates: Requirements 1.2**
   */
  it('should have strategy names following kebab-case convention', () => {
    const kebabCaseRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
    
    for (const strategy of strategies) {
      expect(strategy.name).toMatch(kebabCaseRegex)
    }
  })
})

// ==================== Mock Strategy Factory ====================

/**
 * Create a mock strategy that applies based on a predicate
 */
function createMockStrategy(
  name: string,
  shouldApplyFn: (schema: PrintSchemaWithPagination) => boolean
): PaginationStrategy {
  return {
    name,
    shouldApply: shouldApplyFn,
    render: (_schema: PrintSchemaWithPagination, _data: FormData, _options?: PaginationRenderOptions): string => {
      return `<div>Rendered by ${name}</div>`
    },
  }
}

// ==================== Arbitraries ====================

/**
 * Generate a random PrintSchemaWithPagination
 */
const printSchemaWithPaginationArb: fc.Arbitrary<PrintSchemaWithPagination> = fc.record({
  pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
  orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
  header: fc.record({
    hospital: fc.string({ minLength: 1, maxLength: 50 }),
    department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
    title: fc.string({ minLength: 1, maxLength: 50 }),
  }),
  sections: fc.constant([]),
  footer: fc.option(
    fc.record({
      notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
      showPageNumber: fc.boolean(),
    }),
    { nil: undefined }
  ),
  pagination: fc.option(
    fc.record({
      enabled: fc.boolean(),
      mode: fc.option(fc.constantFrom('auto', 'manual') as fc.Arbitrary<'auto' | 'manual'>, { nil: undefined }),
      overflow: fc.option(
        fc.record({
          fields: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }), { nil: undefined }),
          firstLineChars: fc.option(fc.integer({ min: 10, max: 200 }), { nil: undefined }),
        }),
        { nil: undefined }
      ),
      smartPagination: fc.option(
        fc.record({
          enabled: fc.boolean(),
          minRowHeight: fc.option(fc.integer({ min: 4, max: 20 }), { nil: undefined }),
        }),
        { nil: undefined }
      ),
    }),
    { nil: undefined }
  ),
})

/**
 * Generate a list of strategy configurations (name + shouldApply predicate index)
 */
const strategyConfigArb = fc.array(
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z][a-zA-Z0-9-]*$/.test(s)),
    predicateType: fc.constantFrom('always', 'never', 'smartEnabled', 'overflowFields') as fc.Arbitrary<
      'always' | 'never' | 'smartEnabled' | 'overflowFields'
    >,
  }),
  { minLength: 0, maxLength: 5 }
)

// ==================== Property Tests ====================

describe('Property 4: Context Strategy Selection Consistency', () => {
  /**
   * Property 4: Context Strategy Selection Consistency
   *
   * *For any* schema and set of strategies, `PaginationContext.getApplicableStrategies()`
   * SHALL return exactly those strategies whose `shouldApply()` returns `true` for that schema,
   * in the same order they were registered.
   *
   * **Feature: pagination-strategy-pattern, Property 4: Context Strategy Selection Consistency**
   * **Validates: Requirements 4.3**
   */
  it('should return exactly those strategies whose shouldApply returns true, in registration order', () => {
    fc.assert(
      fc.property(printSchemaWithPaginationArb, strategyConfigArb, (schema, strategyConfigs) => {
        // Create predicate functions based on type
        const createPredicate = (type: string): ((s: PrintSchemaWithPagination) => boolean) => {
          switch (type) {
            case 'always':
              return () => true
            case 'never':
              return () => false
            case 'smartEnabled':
              return (s) => s.pagination?.smartPagination?.enabled === true
            case 'overflowFields':
              return (s) => {
                const fields = s.pagination?.overflow?.fields
                return Array.isArray(fields) && fields.length > 0
              }
            default:
              return () => false
          }
        }

        // Create mock strategies with unique names
        const uniqueNames = new Set<string>()
        const strategies: PaginationStrategy[] = []
        for (const config of strategyConfigs) {
          // Ensure unique names
          let name = config.name
          let counter = 1
          while (uniqueNames.has(name)) {
            name = `${config.name}-${counter++}`
          }
          uniqueNames.add(name)

          const predicate = createPredicate(config.predicateType)
          strategies.push(createMockStrategy(name, predicate))
        }

        // Create context with strategies
        const context = new PaginationContext(strategies)

        // Get applicable strategies from context
        const applicableStrategies = context.getApplicableStrategies(schema)

        // Manually compute expected applicable strategies
        const expectedApplicable = strategies.filter((s) => s.shouldApply(schema))

        // Verify: same length
        expect(applicableStrategies.length).toBe(expectedApplicable.length)

        // Verify: same strategies in same order
        for (let i = 0; i < applicableStrategies.length; i++) {
          expect(applicableStrategies[i].name).toBe(expectedApplicable[i].name)
          expect(applicableStrategies[i]).toBe(expectedApplicable[i]) // Same reference
        }

        // Verify: all returned strategies actually apply
        for (const strategy of applicableStrategies) {
          expect(strategy.shouldApply(schema)).toBe(true)
        }

        // Verify: no applicable strategy was missed
        for (const strategy of strategies) {
          const isApplicable = strategy.shouldApply(schema)
          const isInResult = applicableStrategies.includes(strategy)
          expect(isInResult).toBe(isApplicable)
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Additional property: Empty strategy list returns empty applicable list
   * **Validates: Requirements 4.3**
   */
  it('should return empty array when no strategies are registered', () => {
    fc.assert(
      fc.property(printSchemaWithPaginationArb, (schema) => {
        const context = new PaginationContext([])
        const applicableStrategies = context.getApplicableStrategies(schema)

        expect(applicableStrategies).toEqual([])
        expect(applicableStrategies.length).toBe(0)

        return true
      }),
      { numRuns: 50 }
    )
  })

  /**
   * Additional property: Order preservation
   * Strategies should be returned in the same order they were registered
   * **Validates: Requirements 4.3**
   */
  it('should preserve registration order in applicable strategies', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s)), {
          minLength: 2,
          maxLength: 10,
        }),
        (names) => {
          // Ensure unique names
          const uniqueNames = [...new Set(names)]
          if (uniqueNames.length < 2) return true // Skip if not enough unique names

          // Create strategies that all apply (always return true)
          const strategies = uniqueNames.map((name) => createMockStrategy(name, () => true))

          const context = new PaginationContext(strategies)

          const schema: PrintSchemaWithPagination = {
            pageSize: 'A4',
            orientation: 'portrait',
            header: { hospital: 'Test', title: 'Test' },
            sections: [],
          }

          const applicableStrategies = context.getApplicableStrategies(schema)

          // All strategies should be applicable
          expect(applicableStrategies.length).toBe(strategies.length)

          // Order should be preserved
          for (let i = 0; i < applicableStrategies.length; i++) {
            expect(applicableStrategies[i].name).toBe(strategies[i].name)
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })
})


// ==================== Property 2: Smart Pagination Strategy Applicability ====================

describe('Property 2: Smart Pagination Strategy Applicability', () => {
  /**
   * Property 2: Smart Pagination Strategy Applicability
   *
   * *For any* schema with `pagination.smartPagination.enabled === true`,
   * `SmartPaginationStrategy.shouldApply()` SHALL return `true`.
   * *For any* schema without this config or with `enabled === false`,
   * it SHALL return `false`.
   *
   * **Feature: pagination-strategy-pattern, Property 2: Smart Pagination Strategy Applicability**
   * **Validates: Requirements 2.5**
   */

  const strategy = new SmartPaginationStrategy()

  /**
   * Arbitrary for schemas with smartPagination.enabled === true
   */
  const schemaWithSmartPaginationEnabledArb: fc.Arbitrary<PrintSchemaWithPagination> = fc.record({
    pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
    orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
    header: fc.record({
      hospital: fc.string({ minLength: 1, maxLength: 50 }),
      department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
    }),
    sections: fc.constant([]),
    footer: fc.option(
      fc.record({
        notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        showPageNumber: fc.boolean(),
      }),
      { nil: undefined }
    ),
    pagination: fc.record({
      enabled: fc.boolean(),
      mode: fc.option(fc.constantFrom('auto', 'manual') as fc.Arbitrary<'auto' | 'manual'>, { nil: undefined }),
      overflow: fc.option(
        fc.record({
          fields: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }), { nil: undefined }),
          firstLineChars: fc.option(fc.integer({ min: 10, max: 200 }), { nil: undefined }),
        }),
        { nil: undefined }
      ),
      smartPagination: fc.record({
        enabled: fc.constant(true), // Always true for this arbitrary
        minRowHeight: fc.option(fc.integer({ min: 4, max: 20 }), { nil: undefined }),
      }),
    }),
  })

  /**
   * Arbitrary for schemas with smartPagination.enabled === false
   */
  const schemaWithSmartPaginationDisabledArb: fc.Arbitrary<PrintSchemaWithPagination> = fc.record({
    pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
    orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
    header: fc.record({
      hospital: fc.string({ minLength: 1, maxLength: 50 }),
      department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
    }),
    sections: fc.constant([]),
    footer: fc.option(
      fc.record({
        notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        showPageNumber: fc.boolean(),
      }),
      { nil: undefined }
    ),
    pagination: fc.record({
      enabled: fc.boolean(),
      mode: fc.option(fc.constantFrom('auto', 'manual') as fc.Arbitrary<'auto' | 'manual'>, { nil: undefined }),
      overflow: fc.option(
        fc.record({
          fields: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }), { nil: undefined }),
          firstLineChars: fc.option(fc.integer({ min: 10, max: 200 }), { nil: undefined }),
        }),
        { nil: undefined }
      ),
      smartPagination: fc.record({
        enabled: fc.constant(false), // Always false for this arbitrary
        minRowHeight: fc.option(fc.integer({ min: 4, max: 20 }), { nil: undefined }),
      }),
    }),
  })

  /**
   * Arbitrary for schemas without smartPagination config
   */
  const schemaWithoutSmartPaginationArb: fc.Arbitrary<PrintSchemaWithPagination> = fc.record({
    pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
    orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
    header: fc.record({
      hospital: fc.string({ minLength: 1, maxLength: 50 }),
      department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
    }),
    sections: fc.constant([]),
    footer: fc.option(
      fc.record({
        notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        showPageNumber: fc.boolean(),
      }),
      { nil: undefined }
    ),
    pagination: fc.option(
      fc.record({
        enabled: fc.boolean(),
        mode: fc.option(fc.constantFrom('auto', 'manual') as fc.Arbitrary<'auto' | 'manual'>, { nil: undefined }),
        overflow: fc.option(
          fc.record({
            fields: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }), { nil: undefined }),
            firstLineChars: fc.option(fc.integer({ min: 10, max: 200 }), { nil: undefined }),
          }),
          { nil: undefined }
        ),
        // No smartPagination field
      }),
      { nil: undefined }
    ),
  })

  /**
   * Arbitrary for schemas without pagination config at all
   */
  const schemaWithoutPaginationArb: fc.Arbitrary<PrintSchemaWithPagination> = fc.record({
    pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
    orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
    header: fc.record({
      hospital: fc.string({ minLength: 1, maxLength: 50 }),
      department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
    }),
    sections: fc.constant([]),
    footer: fc.option(
      fc.record({
        notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        showPageNumber: fc.boolean(),
      }),
      { nil: undefined }
    ),
    // No pagination field
  })

  it('should return true when smartPagination.enabled is true', () => {
    fc.assert(
      fc.property(schemaWithSmartPaginationEnabledArb, (schema) => {
        const result = strategy.shouldApply(schema)
        expect(result).toBe(true)
        return result === true
      }),
      { numRuns: 100 }
    )
  })

  it('should return false when smartPagination.enabled is false', () => {
    fc.assert(
      fc.property(schemaWithSmartPaginationDisabledArb, (schema) => {
        const result = strategy.shouldApply(schema)
        expect(result).toBe(false)
        return result === false
      }),
      { numRuns: 100 }
    )
  })

  it('should return false when smartPagination config is missing', () => {
    fc.assert(
      fc.property(schemaWithoutSmartPaginationArb, (schema) => {
        const result = strategy.shouldApply(schema)
        expect(result).toBe(false)
        return result === false
      }),
      { numRuns: 100 }
    )
  })

  it('should return false when pagination config is missing entirely', () => {
    fc.assert(
      fc.property(schemaWithoutPaginationArb, (schema) => {
        const result = strategy.shouldApply(schema)
        expect(result).toBe(false)
        return result === false
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Combined property: shouldApply returns true if and only if
   * pagination.smartPagination.enabled === true
   */
  it('should return true iff pagination.smartPagination.enabled === true', () => {
    fc.assert(
      fc.property(printSchemaWithPaginationArb, (schema) => {
        const result = strategy.shouldApply(schema)
        const expected = schema.pagination?.smartPagination?.enabled === true
        
        expect(result).toBe(expected)
        return result === expected
      }),
      { numRuns: 100 }
    )
  })
})


// ==================== Property 3: Overflow Pagination Strategy Applicability ====================

describe('Property 3: Overflow Pagination Strategy Applicability', () => {
  /**
   * Property 3: Overflow Pagination Strategy Applicability
   *
   * *For any* schema with `pagination.overflow.fields` containing at least one field name,
   * `OverflowPaginationStrategy.shouldApply()` SHALL return `true`.
   * *For any* schema with empty or missing overflow fields,
   * it SHALL return `false`.
   *
   * **Feature: pagination-strategy-pattern, Property 3: Overflow Pagination Strategy Applicability**
   * **Validates: Requirements 3.5**
   */

  const strategy = new OverflowPaginationStrategy()

  /**
   * Arbitrary for schemas with overflow.fields containing at least one field
   */
  const schemaWithOverflowFieldsArb: fc.Arbitrary<PrintSchemaWithPagination> = fc.record({
    pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
    orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
    header: fc.record({
      hospital: fc.string({ minLength: 1, maxLength: 50 }),
      department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
    }),
    sections: fc.constant([]),
    footer: fc.option(
      fc.record({
        notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        showPageNumber: fc.boolean(),
      }),
      { nil: undefined }
    ),
    pagination: fc.record({
      enabled: fc.boolean(),
      mode: fc.option(fc.constantFrom('auto', 'manual') as fc.Arbitrary<'auto' | 'manual'>, { nil: undefined }),
      overflow: fc.record({
        // At least one field name (minLength: 1 for array)
        fields: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        firstLineChars: fc.option(fc.integer({ min: 10, max: 200 }), { nil: undefined }),
      }),
      smartPagination: fc.option(
        fc.record({
          enabled: fc.boolean(),
          minRowHeight: fc.option(fc.integer({ min: 4, max: 20 }), { nil: undefined }),
        }),
        { nil: undefined }
      ),
    }),
  })

  /**
   * Arbitrary for schemas with overflow.fields as empty array
   */
  const schemaWithEmptyOverflowFieldsArb: fc.Arbitrary<PrintSchemaWithPagination> = fc.record({
    pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
    orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
    header: fc.record({
      hospital: fc.string({ minLength: 1, maxLength: 50 }),
      department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
    }),
    sections: fc.constant([]),
    footer: fc.option(
      fc.record({
        notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        showPageNumber: fc.boolean(),
      }),
      { nil: undefined }
    ),
    pagination: fc.record({
      enabled: fc.boolean(),
      mode: fc.option(fc.constantFrom('auto', 'manual') as fc.Arbitrary<'auto' | 'manual'>, { nil: undefined }),
      overflow: fc.record({
        fields: fc.constant([]), // Always empty array
        firstLineChars: fc.option(fc.integer({ min: 10, max: 200 }), { nil: undefined }),
      }),
      smartPagination: fc.option(
        fc.record({
          enabled: fc.boolean(),
          minRowHeight: fc.option(fc.integer({ min: 4, max: 20 }), { nil: undefined }),
        }),
        { nil: undefined }
      ),
    }),
  })

  /**
   * Arbitrary for schemas without overflow config
   */
  const schemaWithoutOverflowArb: fc.Arbitrary<PrintSchemaWithPagination> = fc.record({
    pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
    orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
    header: fc.record({
      hospital: fc.string({ minLength: 1, maxLength: 50 }),
      department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
    }),
    sections: fc.constant([]),
    footer: fc.option(
      fc.record({
        notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        showPageNumber: fc.boolean(),
      }),
      { nil: undefined }
    ),
    pagination: fc.option(
      fc.record({
        enabled: fc.boolean(),
        mode: fc.option(fc.constantFrom('auto', 'manual') as fc.Arbitrary<'auto' | 'manual'>, { nil: undefined }),
        // No overflow field
        smartPagination: fc.option(
          fc.record({
            enabled: fc.boolean(),
            minRowHeight: fc.option(fc.integer({ min: 4, max: 20 }), { nil: undefined }),
          }),
          { nil: undefined }
        ),
      }),
      { nil: undefined }
    ),
  })

  /**
   * Arbitrary for schemas without pagination config at all
   */
  const schemaWithoutPaginationArb: fc.Arbitrary<PrintSchemaWithPagination> = fc.record({
    pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
    orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
    header: fc.record({
      hospital: fc.string({ minLength: 1, maxLength: 50 }),
      department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
    }),
    sections: fc.constant([]),
    footer: fc.option(
      fc.record({
        notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        showPageNumber: fc.boolean(),
      }),
      { nil: undefined }
    ),
    // No pagination field
  })

  /**
   * Arbitrary for schemas with overflow.fields as undefined
   */
  const schemaWithUndefinedOverflowFieldsArb: fc.Arbitrary<PrintSchemaWithPagination> = fc.record({
    pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
    orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
    header: fc.record({
      hospital: fc.string({ minLength: 1, maxLength: 50 }),
      department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
    }),
    sections: fc.constant([]),
    footer: fc.option(
      fc.record({
        notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        showPageNumber: fc.boolean(),
      }),
      { nil: undefined }
    ),
    pagination: fc.record({
      enabled: fc.boolean(),
      mode: fc.option(fc.constantFrom('auto', 'manual') as fc.Arbitrary<'auto' | 'manual'>, { nil: undefined }),
      overflow: fc.record({
        fields: fc.constant(undefined), // Always undefined
        firstLineChars: fc.option(fc.integer({ min: 10, max: 200 }), { nil: undefined }),
      }),
      smartPagination: fc.option(
        fc.record({
          enabled: fc.boolean(),
          minRowHeight: fc.option(fc.integer({ min: 4, max: 20 }), { nil: undefined }),
        }),
        { nil: undefined }
      ),
    }),
  })

  it('should return true when overflow.fields contains at least one field', () => {
    fc.assert(
      fc.property(schemaWithOverflowFieldsArb, (schema) => {
        const result = strategy.shouldApply(schema)
        expect(result).toBe(true)
        return result === true
      }),
      { numRuns: 100 }
    )
  })

  it('should return false when overflow.fields is empty array', () => {
    fc.assert(
      fc.property(schemaWithEmptyOverflowFieldsArb, (schema) => {
        const result = strategy.shouldApply(schema)
        expect(result).toBe(false)
        return result === false
      }),
      { numRuns: 100 }
    )
  })

  it('should return false when overflow config is missing', () => {
    fc.assert(
      fc.property(schemaWithoutOverflowArb, (schema) => {
        const result = strategy.shouldApply(schema)
        expect(result).toBe(false)
        return result === false
      }),
      { numRuns: 100 }
    )
  })

  it('should return false when pagination config is missing entirely', () => {
    fc.assert(
      fc.property(schemaWithoutPaginationArb, (schema) => {
        const result = strategy.shouldApply(schema)
        expect(result).toBe(false)
        return result === false
      }),
      { numRuns: 100 }
    )
  })

  it('should return false when overflow.fields is undefined', () => {
    fc.assert(
      fc.property(schemaWithUndefinedOverflowFieldsArb, (schema) => {
        const result = strategy.shouldApply(schema)
        expect(result).toBe(false)
        return result === false
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Combined property: shouldApply returns true if and only if
   * pagination.overflow.fields is a non-empty array
   */
  it('should return true iff pagination.overflow.fields is a non-empty array', () => {
    fc.assert(
      fc.property(printSchemaWithPaginationArb, (schema) => {
        const result = strategy.shouldApply(schema)
        const fields = schema.pagination?.overflow?.fields
        const expected = Array.isArray(fields) && fields.length > 0
        
        expect(result).toBe(expected)
        return result === expected
      }),
      { numRuns: 100 }
    )
  })
})
