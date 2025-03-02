// Test for equality operators: ==, !=

import { test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

test('equality operator ==', async (t) => {
  await t.test('should compare primitive values', () => {
    // Basic comparisons
    assert.deepEqual(query('5 == 5', null), [true])
    assert.deepEqual(query('5 == 6', null), [false])
    assert.deepEqual(query('true == true', null), [true])
    assert.deepEqual(query('false == false', null), [true])
    assert.deepEqual(query('true == false', null), [false])
    assert.deepEqual(query('"hello" == "hello"', null), [true])
    assert.deepEqual(query('"hello" == "world"', null), [false])

    // Type-specific comparisons (strings are not equal to numbers)
    assert.deepEqual(query('5 == "5"', null), [false])
    assert.deepEqual(query('true == 1', null), [false])
    assert.deepEqual(query('false == 0', null), [false])

    // Null comparisons
    assert.deepEqual(query('null == null', null), [true])
    assert.deepEqual(query('null == 0', null), [false])
    assert.deepEqual(query('null == false', null), [false])
    assert.deepEqual(query('null == ""', null), [false])
  })

  await t.test('should work with property access', () => {
    assert.deepEqual(query('.a == 5', { a: 5 }), [true])
    assert.deepEqual(query('.a == 5', { a: 10 }), [false])
    assert.deepEqual(query('.a == .b', { a: 7, b: 7 }), [true])
    assert.deepEqual(query('.a == .b', { a: 7, b: 5 }), [false])
  })

  await t.test('should work as a filter', () => {
    // Filter usage as shown in examples
    assert.deepEqual(
      query('. == false', null),
      [false]
    )
  })
})

test('inequality operator !=', async (t) => {
  await t.test('should compare primitive values', () => {
    // Basic comparisons
    assert.deepEqual(query('5 != 5', null), [false])
    assert.deepEqual(query('5 != 6', null), [true])
    assert.deepEqual(query('true != true', null), [false])
    assert.deepEqual(query('true != false', null), [true])
    assert.deepEqual(query('"hello" != "hello"', null), [false])
    assert.deepEqual(query('"hello" != "world"', null), [true])

    // Type-specific comparisons
    assert.deepEqual(query('5 != "5"', null), [true])
    assert.deepEqual(query('true != 1', null), [true])

    // Null comparisons
    assert.deepEqual(query('null != null', null), [false])
    assert.deepEqual(query('null != 0', null), [true])
  })

  await t.test('should work with property access', () => {
    assert.deepEqual(query('.a != 5', { a: 10 }), [true])
    assert.deepEqual(query('.a != 5', { a: 5 }), [false])
    assert.deepEqual(query('.a != .b', { a: 7, b: 5 }), [true])
    assert.deepEqual(query('.a != .b', { a: 7, b: 7 }), [false])
  })
})
