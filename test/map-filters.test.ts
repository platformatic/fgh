// Test for map and map_values filters

import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('map filter', async (t) => {
  test('should apply a filter to each value in an array', () => {
    assert.deepEqual(
      query('map(.+1)', [1, 2, 3]),
      [[2, 3, 4]]
    )
  })

  test('should handle filters that produce multiple values per input', () => {
    assert.deepEqual(
      query('map(., .)', [1, 2]),
      [[1, 1, 2, 2]]
    )
  })

  test('should handle filters that produce no values', () => {
    assert.deepEqual(
      query('map(empty)', [1, 2, 3]),
      [[]]
    )
  })

  test('should apply filter to values of an object', () => {
    assert.deepEqual(
      query('map(.+1)', { a: 1, b: 2, c: 3 }),
      [[2, 3, 4]]
    )
  })
})

describe('map_values filter', async (t) => {
  test('should apply a filter to each value in an array and use only the first result', () => {
    assert.deepEqual(
      query('map_values(.+1)', [1, 2, 3]),
      [[2, 3, 4]]
    )
  })

  test('should handle filters that produce multiple values and only use the first', () => {
    assert.deepEqual(
      query('map_values(., .)', [1, 2]),
      [[1, 2]]
    )
  })

  test('should handle filters that produce no values', () => {
    assert.deepEqual(
      query('map_values(empty)', [1, 2, 3]),
      [[]]
    )
  })

  test('should apply filter to values of an object and maintain the object structure', () => {
    assert.deepEqual(
      query('map_values(.+1)', { a: 1, b: 2, c: 3 }),
      [{ a: 2, b: 3, c: 4 }]
    )
  })

  // This test requires conditionals with comparison operators to be implemented
  test('should drop keys from objects when filter produces no values', () => {
    assert.deepEqual(
      query('map_values(if . > 1 then . else empty end)', { a: 1, b: 2, c: 3 }),
      [{ b: 2, c: 3 }]
    )

    assert.deepEqual(
      query('map_values(if . > 1 then . else empty end)', { b: 2, c: 3 }),
      [{ b: 2, c: 3 }]
    )
  })

  // A simpler alternative test
  test('should drop keys from objects when filter produces no values', () => {
    assert.deepEqual(
      query('map_values(empty)', { a: 1, b: 2, c: 3 }),
      [{}]
    )
  })
})
