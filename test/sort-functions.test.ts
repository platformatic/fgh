// Test for sort and sort_by functions

import { test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

test('sort function', async (t) => {
  await t.test('should sort an array of numbers', () => {
    assert.deepEqual(
      query('sort', [8, 3, null, 6]),
      [[null, 3, 6, 8]]
    )
  })

  await t.test('should sort an array of mixed types', () => {
    assert.deepEqual(
      query('sort', [null, true, false, 42, 'foo', [1, 2], { a: 1 }]),
      [[null, false, true, 42, 'foo', [1, 2], { a: 1 }]]
    )
  })

  await t.test('should sort objects by keys first, then values', () => {
    assert.deepEqual(
      query('sort', [
        { b: 1, a: 2 },
        { a: 1, b: 2 },
        { a: 1, b: 1 }
      ]),
      [[
        { a: 1, b: 1 },
        { a: 1, b: 2 },
        { b: 1, a: 2 }
      ]]
    )
  })

  await t.test('should return null for null input', () => {
    assert.deepEqual(
      query('sort', null),
      [null]
    )
  })

  await t.test('should return undefined for non-array input', () => {
    assert.deepEqual(
      query('sort', 42),
      []
    )
  })
})

test('sort_by function', async (t) => {
  await t.test('should sort objects by specified property', () => {
    assert.deepEqual(
      query('sort_by(.foo)', [
        { foo: 4, bar: 10 },
        { foo: 3, bar: 10 },
        { foo: 2, bar: 1 }
      ]),
      [[
        { foo: 2, bar: 1 },
        { foo: 3, bar: 10 },
        { foo: 4, bar: 10 }
      ]]
    )
  })

  await t.test('should sort by multiple properties', () => {
    assert.deepEqual(
      query('sort_by(.foo, .bar)', [
        { foo: 4, bar: 10 },
        { foo: 3, bar: 20 },
        { foo: 2, bar: 1 },
        { foo: 3, bar: 10 }
      ]),
      [[
        { foo: 2, bar: 1 },
        { foo: 3, bar: 10 },
        { foo: 3, bar: 20 },
        { foo: 4, bar: 10 }
      ]]
    )
  })

  await t.test('should handle missing properties by treating them as null', () => {
    assert.deepEqual(
      query('sort_by(.foo)', [
        { foo: 4, bar: 10 },
        { bar: 10 },
        { foo: 2, bar: 1 }
      ]),
      [[
        { bar: 10 },
        { foo: 2, bar: 1 },
        { foo: 4, bar: 10 }
      ]]
    )
  })

  await t.test('should return null for null input', () => {
    assert.deepEqual(
      query('sort_by(.foo)', null),
      [null]
    )
  })

  await t.test('should return undefined for non-array input', () => {
    assert.deepEqual(
      query('sort_by(.foo)', 42),
      []
    )
  })
})
