// Test for select filter

import { test } from 'node:test'
import assert from 'node:assert'
import { query, compile } from '../src/fgh.ts'

test('select filter', async (t) => {
  await t.test('should filter array elements that match a condition', () => {
    assert.deepEqual(
      query('map(select(. >= 2))', [1, 5, 3, 0, 7]),
      [[5, 3, 7]]
    )
  })

  await t.test('should handle multiple matches with array iteration', () => {
    assert.deepEqual(
      query('.[] | select(.val > 0)', [
        { id: 'first', val: 1 },
        { id: 'second', val: 2 }
      ]),
      [
        { id: 'first', val: 1 },
        { id: 'second', val: 2 }
      ]
    )
  })

  await t.test('should filter single match with array iteration', () => {
    assert.deepEqual(
      query('.[] | select(.id == "second")', [
        { id: 'first', val: 1 },
        { id: 'second', val: 2 }
      ]),
      [{ id: 'second', val: 2 }]
    )
  })

  await t.test('should return nothing for non-matching condition', () => {
    assert.deepEqual(
      query('map(select(. > 10))', [1, 5, 3, 0, 7]),
      [[]]
    )
  })

  await t.test('should work with property access in condition', () => {
    assert.deepEqual(
      query('map(select(.val > 1))', [
        { id: 'first', val: 1 },
        { id: 'second', val: 2 }
      ]),
      [[{ id: 'second', val: 2 }]]
    )
  })

  await t.test('should work with object input', () => {
    assert.deepEqual(
      query('select(.value > 10)', { name: 'test', value: 15 }),
      [{ name: 'test', value: 15 }]
    )
  })

  await t.test('should return nothing for object that does not match', () => {
    assert.deepEqual(
      query('select(.value < 10)', { name: 'test', value: 15 }),
      []
    )
  })

  await t.test('should work with compile for reuse', () => {
    const highValueFilter = compile('select(.value > 10)')
    assert.deepEqual(
      highValueFilter({ name: 'test', value: 15 }),
      [{ name: 'test', value: 15 }]
    )

    assert.deepEqual(
      highValueFilter({ name: 'test', value: 5 }),
      []
    )
  })

  await t.test('should work with additional operations in pipe', () => {
    const inventory = [
      { name: 'apple', type: 'fruit', price: 1.20, stock: 50 },
      { name: 'banana', type: 'fruit', price: 0.80, stock: 25 },
      { name: 'carrot', type: 'vegetable', price: 0.90, stock: 30 },
      { name: 'potato', type: 'vegetable', price: 1.10, stock: 10 }
    ]

    assert.deepEqual(
      query('.[] | select(.type == "fruit") | {name}', inventory),
      [
        { name: 'apple' },
        { name: 'banana' }
      ]
    )
  })
})
