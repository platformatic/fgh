// Test for Default operator: //

import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('default operator', async (t) => {
  test('should return default when left produces no values', () => {
    // Test examples from requirements
    assert.deepEqual(query('empty // 42', null), [42])
    assert.deepEqual(query('.foo // 42', {}), [42])
  })

  test('should return left side when it produces non-false/null values', () => {
    // Test examples from requirements
    assert.deepEqual(query('.foo // 42', { foo: 19 }), [19])
    assert.deepEqual(query('(false, null, 1) // 42', null), [1])
  })

  test('should handle more complex expressions on both sides', () => {
    assert.deepEqual(query('.a.b // "missing"', { a: {} }), ['missing'])
    assert.deepEqual(query('.a.b // .a.c', { a: { c: 'fallback' } }), ['fallback'])
    assert.deepEqual(query('.a.b // .a.c', { a: { b: 'value', c: 'ignored' } }), ['value'])
  })

  test('should work with pipe operator correctly', () => {
    assert.deepEqual(
      query('(false, null, 1) | . // 42', null),
      [42, 42, 1]
    )
  })

  test('should handle arrays and objects', () => {
    assert.deepEqual(
      query('.items // [1, 2, 3]', {}),
      [[1, 2, 3]]
    )

    assert.deepEqual(
      query('.config // {default: true}', {}),
      [{ default: true }]
    )
  })

  test('should handle falsy values correctly', () => {
    // false and null should trigger the default
    assert.deepEqual(query('false // "default"', null), ['default'])
    assert.deepEqual(query('null // "default"', null), ['default'])

    // Other values (even falsy like 0 or "") should not trigger the default
    assert.deepEqual(query('0 // "default"', null), [0])
    assert.deepEqual(query('"" // "default"', null), [''])
    
    // Empty array should be preserved
    assert.deepEqual(query('[] // "default"', null), [[]])
    
    // Empty object should be preserved
    assert.deepEqual(query('{} // "default"', null), [{}])
  })
})
