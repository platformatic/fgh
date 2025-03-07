// Test for array construction

import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('array construction', async (t) => {
  test('simple array construction', () => {
    const result = query('[1, 2, 3]', null)
    assert.deepStrictEqual(result, [[1, 2, 3]])
  })

  test('should handle array construction with multiple elements', () => {
    const input = { a: 1, b: 2, c: 3 }
    const result = query('[.a, .b, .c]', input)

    assert.deepStrictEqual(result, [[1, 2, 3]])
  })

  test('should handle simple array construction', () => {
    const input = { user: 'stedolan', projects: ['jq', 'wikiflow'] }
    const result = query('[.user, .projects[]]', input)

    assert.deepStrictEqual(result, [['stedolan', 'jq', 'wikiflow']])
  })

  test('should handle nested array construction', () => {
    const input = { a: [1, 2], b: [3, 4], c: 5 }
    const result = query('[.a[], .b[], .c]', input)

    assert.deepStrictEqual(result, [[1, 2, 3, 4, 5]])
  })

  test('should handle empty array construction', () => {
    const input = { a: 1 }
    const result = query('[]', input)

    assert.deepStrictEqual(result, [[]])
  })

  test('should handle property access within array elements', () => {
    const input = {
      user: { name: 'John', age: 30 },
      settings: { theme: 'dark', notifications: true }
    }
    const result = query('[.user.name, .settings.theme]', input)

    assert.deepStrictEqual(result, [['John', 'dark']])
  })
})
