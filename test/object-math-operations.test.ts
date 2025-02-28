// Test for mathematical operations inside object construction

import { test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

test('object construction with mathematical operations', async (t) => {
  await t.test('should support basic arithmetic in object values', () => {
    assert.deepEqual(
      query('{ sum: (2 + 3), difference: (10 - 5), product: (4 * 2), quotient: (10 / 2) }', null),
      { sum: 5, difference: 5, product: 8, quotient: 5 }
    )
  })

  await t.test('should support arithmetic with property values', () => {
    assert.deepEqual(
      query('{ doubled: (.value * 2), halved: (.value / 2) }', { value: 10 }),
      { doubled: 20, halved: 5 }
    )
  })

  await t.test('should handle nested objects with arithmetic', () => {
    assert.deepEqual(
      query('{ metrics: { total: (.price * .quantity), average: (.price / 2) } }',
        { price: 12, quantity: 5 }),
      { metrics: { total: 60, average: 6 } }
    )
  })

  await t.test('should work with array input and arithmetic', () => {
    assert.deepEqual(
      query('.[] | { name, total_value: (.price * .stock) }', [
        { name: 'apple', price: 1.20, stock: 50 },
        { name: 'banana', price: 0.80, stock: 25 }
      ]),
      [
        { name: 'apple', total_value: 60 },
        { name: 'banana', total_value: 20 }
      ]
    )
  })

  await t.test('should handle combined filters with arithmetic', () => {
    assert.deepEqual(
      query('.[] | select(.stock > 30) | { name, total_value: (.price * .stock) }', [
        { name: 'apple', type: 'fruit', price: 1.20, stock: 50 },
        { name: 'banana', type: 'fruit', price: 0.80, stock: 25 },
        { name: 'carrot', type: 'vegetable', price: 0.90, stock: 30 }
      ]),
      [
        { name: 'apple', total_value: 60 }
      ]
    )
  })

  await t.test('should handle multiple arithmetic operations', () => {
    assert.deepEqual(
      query('{ sum: (.a + .b + .c), weighted_avg: ((.a * 0.5) + (.b * 0.3) + (.c * 0.2)) }', { a: 10, b: 20, c: 30 }),
      {
        sum: 60,
        weighted_avg: 17
      }
    )
  })
})
