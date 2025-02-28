// Test for equality operators: ==, !=

import { test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

test('equality operator ==', async (t) => {
  await t.test('should compare primitive values', () => {
    // Basic comparisons
    assert.equal(query('5 == 5', null), true)
    assert.equal(query('5 == 6', null), false)
    assert.equal(query('true == true', null), true)
    assert.equal(query('false == false', null), true)
    assert.equal(query('true == false', null), false)
    assert.equal(query('"hello" == "hello"', null), true)
    assert.equal(query('"hello" == "world"', null), false)

    // Type-specific comparisons (strings are not equal to numbers)
    assert.equal(query('5 == "5"', null), false)
    assert.equal(query('true == 1', null), false)
    assert.equal(query('false == 0', null), false)

    // Null comparisons
    assert.equal(query('null == null', null), true)
    assert.equal(query('null == 0', null), false)
    assert.equal(query('null == false', null), false)
    assert.equal(query('null == ""', null), false)
  })

  await t.test('should work with property access', () => {
    assert.equal(query('.a == 5', { a: 5 }), true)
    assert.equal(query('.a == 5', { a: 10 }), false)
    assert.equal(query('.a == .b', { a: 7, b: 7 }), true)
    assert.equal(query('.a == .b', { a: 7, b: 5 }), false)
  })

  await t.test('should work as a filter', () => {
    // Filter usage as shown in examples
    assert.equal(
      query('. == false', null),
      false
    )
  })
})

test('inequality operator !=', async (t) => {
  await t.test('should compare primitive values', () => {
    // Basic comparisons
    assert.equal(query('5 != 5', null), false)
    assert.equal(query('5 != 6', null), true)
    assert.equal(query('true != true', null), false)
    assert.equal(query('true != false', null), true)
    assert.equal(query('"hello" != "hello"', null), false)
    assert.equal(query('"hello" != "world"', null), true)

    // Type-specific comparisons
    assert.equal(query('5 != "5"', null), true)
    assert.equal(query('true != 1', null), true)

    // Null comparisons
    assert.equal(query('null != null', null), false)
    assert.equal(query('null != 0', null), true)
  })

  await t.test('should work with property access', () => {
    assert.equal(query('.a != 5', { a: 10 }), true)
    assert.equal(query('.a != 5', { a: 5 }), false)
    assert.equal(query('.a != .b', { a: 7, b: 5 }), true)
    assert.equal(query('.a != .b', { a: 7, b: 7 }), false)
  })
})
