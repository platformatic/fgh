// Test for sum/difference operators

import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('sum operator', async (t) => {
  test('should add numeric values', () => {
    assert.deepEqual(query('.a + 1', { a: 7 }), [8])
    assert.deepEqual(query('.a + 1', {}), [1]) // When .a is undefined, the result should be 1
  })

  test('should concatenate arrays', () => {
    assert.deepEqual(
      query('.a + .b', { a: [1, 2], b: [3, 4] }),
      [[1, 2, 3, 4]]
    )
  })

  test('should handle null values', () => {
    assert.deepEqual(query('.a + null', { a: 1 }), [1])
    assert.deepEqual(query('null + .a', { a: 1 }), [1])
  })

  test('should merge objects', () => {
    assert.deepEqual(
      query('{a: 1} + {b: 2}', null),
      [{ a: 1, b: 2 }]
    )

    // Right object properties should override left object properties
    assert.deepEqual(
      query('{a: 1, b: 1} + {a: 2}', null),
      [{ a: 2, b: 1 }]
    )
  })

  test('should mix arrays and non-arrays', () => {
    assert.deepEqual(
      query('.a + 1', { a: [1, 2] }),
      [[1, 2, 1]]
    )

    assert.deepEqual(
      query('1 + .a', { a: [1, 2] }),
      [[1, 1, 2]]
    )
  })
})

describe('difference operator', async (t) => {
  test('should subtract numeric values', () => {
    assert.deepEqual(query('4 - 3', {}), [1])
    assert.deepEqual(query('4 - .a', { a: 3 }), [1])
    assert.deepEqual(query('.a - 1', { a: 7 }), [6])
  })

  test('should subtract arrays (remove elements)', () => {
    // Test with array literal subtraction
    assert.deepEqual(
      query('. - ["xml", "yaml"]', ['xml', 'yaml', 'json']),
      [['json']]
    )

    assert.deepEqual(
      query('.languages - ["xml"]', { languages: ['xml', 'yaml', 'json'] }),
      [['yaml', 'json']]
    )
  })

  test('should handle chained operations', () => {
    assert.deepEqual(query('.a + .b - .c', { a: 5, b: 10, c: 7 }), [8])
    assert.deepEqual(query('10 - 2 - 3', {}), [5])
  })

  test('should handle null or undefined values', () => {
    assert.deepEqual(query('.missing - 5', {}), [-5])
    assert.deepEqual(query('10 - .missing', {}), [10])
    assert.deepEqual(query('null - 5', {}), [-5])
  })
})
