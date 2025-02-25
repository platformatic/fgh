// Test for sum/difference operators

import { test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

test('sum operator', async (t) => {
  await t.test('should add numeric values', () => {
    assert.equal(query('.a + 1', { a: 7 }), 8)
    assert.equal(query('.a + 1', {}), 1) // When .a is undefined, the result should be 1
  })

  await t.test('should concatenate arrays', () => {
    assert.deepEqual(
      query('.a + .b', { a: [1, 2], b: [3, 4] }),
      [1, 2, 3, 4]
    )
  })

  await t.test('should handle null values', () => {
    assert.equal(query('.a + null', { a: 1 }), 1)
    assert.equal(query('null + .a', { a: 1 }), 1)
  })

  await t.test('should merge objects', () => {
    assert.deepEqual(
      query('{a: 1} + {b: 2}', null),
      { a: 1, b: 2 }
    )

    // Right object properties should override left object properties
    assert.deepEqual(
      query('{a: 1, b: 1} + {a: 2}', null),
      { a: 2, b: 1 }
    )
  })

  await t.test('should mix arrays and non-arrays', () => {
    assert.deepEqual(
      query('.a + 1', { a: [1, 2] }),
      [1, 2, 1]
    )

    assert.deepEqual(
      query('1 + .a', { a: [1, 2] }),
      [1, 1, 2]
    )
  })
})

test('difference operator', async (t) => {
  await t.test('should subtract numeric values', () => {
    assert.equal(query('4 - 3', {}), 1)
    assert.equal(query('4 - .a', { a: 3 }), 1)
    assert.equal(query('.a - 1', { a: 7 }), 6)
  })

  await t.test('should subtract arrays (remove elements)', () => {
    // Test with array literal subtraction
    assert.deepEqual(
      query('. - ["xml", "yaml"]', ['xml', 'yaml', 'json']),
      ['json']
    )

    assert.deepEqual(
      query('.languages - ["xml"]', { languages: ['xml', 'yaml', 'json'] }),
      ['yaml', 'json']
    )
  })

  await t.test('should handle chained operations', () => {
    assert.equal(query('.a + .b - .c', { a: 5, b: 10, c: 7 }), 8)
    assert.equal(query('10 - 2 - 3', {}), 5)
  })

  await t.test('should handle null or undefined values', () => {
    assert.equal(query('.missing - 5', {}), -5)
    assert.equal(query('10 - .missing', {}), 10)
    assert.equal(query('null - 5', {}), -5)
  })
})
