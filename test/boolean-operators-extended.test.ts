import { test, describe } from 'node:test'
import assert from 'node:assert'
import {
  logicalAnd,
  logicalOr,
  logicalNot,
  isTruthy
} from '../src/helpers/boolean.ts'

describe('Extended Boolean Operator Tests', async (t) => {
  test('isTruthy function handles different value types', () => {
    // Falsy values
    assert.equal(isTruthy(null), false)
    assert.equal(isTruthy(undefined), false)
    assert.equal(isTruthy(false), false)

    // Truthy values
    assert.equal(isTruthy(true), true)
    assert.equal(isTruthy(0), true) // In JQ, 0 is truthy
    assert.equal(isTruthy(''), true) // In JQ, empty string is truthy
    assert.equal(isTruthy([]), true) // In JQ, empty array is truthy
    assert.equal(isTruthy({}), true) // In JQ, empty object is truthy
  })

  // Test for edge cases with null/undefined values
  test('logicalAnd should handle null/undefined values', () => {
    // Test with null/undefined on left side
    assert.deepEqual(logicalAnd(null, true), [false])
    assert.deepEqual(logicalAnd(undefined, true), [false])

    // Test with null/undefined on right side
    assert.deepEqual(logicalAnd(true, null), [false])
    assert.deepEqual(logicalAnd(true, undefined), [false])

    // Test with null/undefined on both sides
    assert.deepEqual(logicalAnd(null, null), [false])
    assert.deepEqual(logicalAnd(undefined, undefined), [false])
    assert.deepEqual(logicalAnd(null, undefined), [false])
  })

  test('logicalOr should handle null/undefined values', () => {
    // Test with null/undefined on left side
    assert.deepEqual(logicalOr(null, true), [true])
    assert.deepEqual(logicalOr(undefined, true), [true])
    assert.deepEqual(logicalOr(null, false), [false])
    assert.deepEqual(logicalOr(undefined, false), [false])

    // Test with null/undefined on right side
    assert.deepEqual(logicalOr(true, null), [true])
    assert.deepEqual(logicalOr(true, undefined), [true])

    // Test with null/undefined on both sides
    assert.deepEqual(logicalOr(null, null), [false])
    assert.deepEqual(logicalOr(undefined, undefined), [false])
    assert.deepEqual(logicalOr(null, undefined), [false])
  })

  test('logicalNot should handle null/undefined values', () => {
    assert.deepEqual(logicalNot(null), [true])
    assert.deepEqual(logicalNot(undefined), [true])
  })

  // Test for array inputs
  test('logicalAnd should handle array inputs', () => {
    // First test: empty array on left side with non-array on right
    assert.deepEqual(logicalAnd([], true), [true])
    assert.deepEqual(logicalAnd(true, []), [true])

    // Non-empty arrays are truthy - need to test each value individually
    assert.deepEqual(logicalAnd([1, 2, 3], true), [true, true, true])
    assert.deepEqual(logicalAnd(true, [1, 2, 3]), [true, true, true])
  })

  test('logicalOr should handle array inputs', () => {
    // Empty arrays are truthy in JQ
    assert.deepEqual(logicalOr([], false), [true])
    assert.deepEqual(logicalOr(false, []), [true])

    // Non-empty arrays are truthy
    assert.deepEqual(logicalOr([1, 2, 3], false), [true, true, true])
    assert.deepEqual(logicalOr(false, [1, 2, 3]), [true, true, true])
  })

  test('logicalNot should handle array inputs', () => {
    assert.deepEqual(logicalNot([]), [false]) // Empty arrays are truthy in JQ, so ![] is false
    assert.deepEqual(logicalNot([1, 2, 3]), [false, false, false])
  })

  // Test for object inputs
  test('logicalAnd should handle object inputs', () => {
    assert.deepEqual(logicalAnd({}, true), [true])
    assert.deepEqual(logicalAnd(true, {}), [true])
    assert.deepEqual(logicalAnd({ a: 1 }, { b: 2 }), [true])
  })

  test('logicalOr should handle object inputs', () => {
    assert.deepEqual(logicalOr({}, false), [true])
    assert.deepEqual(logicalOr(false, {}), [true])
    assert.deepEqual(logicalOr({ a: 1 }, { b: 2 }), [true])
  })

  test('logicalNot should handle object inputs', () => {
    assert.deepEqual(logicalNot({}), [false])
    assert.deepEqual(logicalNot({ a: 1 }), [false])
  })

  // Test edge cases for string values
  test('logicalAnd should handle string values', () => {
    // Empty string is truthy in JQ
    assert.deepEqual(logicalAnd('', true), [true])
    assert.deepEqual(logicalAnd(true, ''), [true])

    // Non-empty string is truthy
    assert.deepEqual(logicalAnd('hello', true), [true])
    assert.deepEqual(logicalAnd(true, 'hello'), [true])
  })

  test('logicalOr should handle string values', () => {
    // Empty string is truthy in JQ
    assert.deepEqual(logicalOr('', false), [true])
    assert.deepEqual(logicalOr(false, ''), [true])

    // Non-empty string is truthy
    assert.deepEqual(logicalOr('hello', false), [true])
    assert.deepEqual(logicalOr(false, 'hello'), [true])
  })

  test('logicalNot should handle string values', () => {
    assert.deepEqual(logicalNot(''), [false]) // Empty string is truthy in JQ, so !'' is false
    assert.deepEqual(logicalNot('hello'), [false])
  })

  // Test for number inputs
  test('logicalAnd should handle number values', () => {
    // 0 is truthy in JQ (unlike JavaScript)
    assert.deepEqual(logicalAnd(0, true), [true])
    assert.deepEqual(logicalAnd(true, 0), [true])

    // Non-zero numbers are truthy
    assert.deepEqual(logicalAnd(1, true), [true])
    assert.deepEqual(logicalAnd(true, 1), [true])
    assert.deepEqual(logicalAnd(-1, true), [true])
  })

  test('logicalOr should handle number values', () => {
    // 0 is truthy in JQ (unlike JavaScript)
    assert.deepEqual(logicalOr(0, false), [true])
    assert.deepEqual(logicalOr(false, 0), [true])

    // Non-zero numbers are truthy
    assert.deepEqual(logicalOr(1, false), [true])
    assert.deepEqual(logicalOr(false, 1), [true])
    assert.deepEqual(logicalOr(-1, false), [true])
  })

  test('logicalNot should handle number values', () => {
    assert.deepEqual(logicalNot(0), [false]) // 0 is truthy in JQ, so !0 is false
    assert.deepEqual(logicalNot(1), [false])
    assert.deepEqual(logicalNot(-1), [false])
  })

  // Test for boolean inputs
  test('logicalAnd should handle boolean values', () => {
    assert.deepEqual(logicalAnd(true, true), [true])
    assert.deepEqual(logicalAnd(false, true), [false])
    assert.deepEqual(logicalAnd(true, false), [false])
    assert.deepEqual(logicalAnd(false, false), [false])
  })

  test('logicalOr should handle boolean values', () => {
    assert.deepEqual(logicalOr(true, true), [true])
    assert.deepEqual(logicalOr(false, true), [true])
    assert.deepEqual(logicalOr(true, false), [true])
    assert.deepEqual(logicalOr(false, false), [false])
  })

  test('logicalNot should handle boolean values', () => {
    assert.deepEqual(logicalNot(true), [false])
    assert.deepEqual(logicalNot(false), [true])
  })
})
