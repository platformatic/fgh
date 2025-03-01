// Test for Default operator: //

import { test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

test('default operator', async (t) => {
  await t.test('should return default when left produces no values', () => {
    // Test examples from requirements
    assert.equal(query('empty // 42', null), 42)
    assert.equal(query('.foo // 42', {}), 42)
  })

  await t.test('should return left side when it produces non-false/null values', () => {
    // Test examples from requirements
    assert.equal(query('.foo // 42', { foo: 19 }), 19)
    assert.equal(query('(false, null, 1) // 42', null), 1)
  })

  await t.test('should handle more complex expressions on both sides', () => {
    assert.equal(query('.a.b // "missing"', { a: {} }), 'missing')
    assert.equal(query('.a.b // .a.c', { a: { c: 'fallback' } }), 'fallback')
    assert.equal(query('.a.b // .a.c', { a: { b: 'value', c: 'ignored' } }), 'value')
  })

  await t.test('should work with pipe operator correctly', () => {
    assert.deepEqual(
      query('(false, null, 1) | . // 42', null),
      [42, 42, 1]
    )
  })

  await t.test('should handle arrays and objects', () => {
    assert.deepEqual(
      query('.items // [1, 2, 3]', {}),
      [1, 2, 3]
    )

    assert.deepEqual(
      query('.config // {default: true}', {}),
      { default: true }
    )
  })

  await t.test('should handle falsy values correctly', () => {
    // false and null should trigger the default
    assert.equal(query('false // "default"', null), 'default')
    assert.equal(query('null // "default"', null), 'default')

    // Other values (even falsy like 0 or "") should not trigger the default
    assert.equal(query('0 // "default"', null), 0)
    assert.equal(query('"" // "default"', null), '')
    // For arrays, we need to use a slightly different syntax
    const emptyArrayResult = query('[] // "default"', null)
    assert.ok(Array.isArray(emptyArrayResult), 'Result should be an array')
    assert.equal(emptyArrayResult.length, 0, 'Array should be empty')
    assert.deepEqual(query('{} // "default"', null), {})
  })
})
