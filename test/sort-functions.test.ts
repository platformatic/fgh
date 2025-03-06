// Test for sort and sort_by functions

import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('sort function', async (t) => {
  test('should sort an array of numbers', () => {
    assert.deepEqual(
      query('sort', [8, 3, null, 6]),
      [[null, 3, 6, 8]]
    )
  })

  test('should sort an array of mixed types', () => {
    assert.deepEqual(
      query('sort', [null, true, false, 42, 'foo', [1, 2], { a: 1 }]),
      [[null, false, true, 42, 'foo', [1, 2], { a: 1 }]]
    )
  })

  test('should sort objects by keys first, then values', () => {
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

  test('throws for null input', () => {
    assert.throws(() => query('sort', null))
  })

  test('throw for non-array input', () => {
    assert.throws(() => query('sort', 42))
  })
})

describe('sort_by function', async (t) => {
  test('should sort objects by specified property', () => {
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

  test('should sort by multiple properties', () => {
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

  test('should handle missing properties by treating them as null', () => {
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

  test('should throw for null input', () => {
    assert.throws(() => query('sort_by(.foo)', null))
  })

  test('should throw for non-array input', () => {
    assert.throws(() => query('sort_by(.foo)', 42))
  })
})
