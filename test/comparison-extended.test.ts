import { test, describe } from 'node:test'
import assert from 'node:assert'
import {
  greaterThan,
  greaterThanOrEqual,
  lessThan,
  lessThanOrEqual,
  equal,
  notEqual
} from '../src/helpers/comparison.ts'

describe('Extended Comparison Operator Tests', async (t) => {
  // More extensive tests for greaterThan operator
  test('greaterThan should handle undefined values', () => {
    // undefined vs undefined
    assert.deepEqual(greaterThan([undefined], [undefined]), [false])

    // undefined vs null
    assert.deepEqual(greaterThan([undefined], [null]), [false])

    // undefined vs other values
    assert.deepEqual(greaterThan([undefined], [true]), [false])
    assert.deepEqual(greaterThan([undefined], [42]), [false])
    assert.deepEqual(greaterThan([undefined], ['string']), [false])

    // other values vs undefined
    assert.deepEqual(greaterThan([null], [undefined]), [true])
    assert.deepEqual(greaterThan([true], [undefined]), [true])
    assert.deepEqual(greaterThan([42], [undefined]), [true])
    assert.deepEqual(greaterThan(['string'], [undefined]), [true])
  })

  test('greaterThan should handle boolean vs number comparison', () => {
    // Boolean vs number (boolean > number according to JQ rules)
    assert.deepEqual(greaterThan([true], [42]), [true])
    assert.deepEqual(greaterThan([false], [42]), [true])

    // Number vs boolean
    assert.deepEqual(greaterThan([42], [true]), [false])
    assert.deepEqual(greaterThan([42], [false]), [false])
  })

  test('greaterThan should handle array inputs properly', () => {
    // Multidimensional comparisons - each left compared with each right
    assert.deepEqual(greaterThan([1, 2], [0, 3]), [true, false, true, false])
  })

  test('greaterThan should handle complex objects', () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = { a: 1, b: 1 }

    // obj1 > obj2 because b:2 > b:1
    assert.deepEqual(greaterThan([obj1], [obj2]), [true])
  })

  // More extensive tests for greaterThanOrEqual operator
  test('greaterThanOrEqual should handle undefined values', () => {
    // undefined vs undefined
    assert.deepEqual(greaterThanOrEqual([undefined], [undefined]), [false])

    // undefined vs null
    assert.deepEqual(greaterThanOrEqual([undefined], [null]), [false])

    // undefined vs other values
    assert.deepEqual(greaterThanOrEqual([undefined], [true]), [false])
    assert.deepEqual(greaterThanOrEqual([undefined], [42]), [false])
    assert.deepEqual(greaterThanOrEqual([undefined], ['string']), [false])

    // other values vs undefined
    assert.deepEqual(greaterThanOrEqual([null], [undefined]), [true])
    assert.deepEqual(greaterThanOrEqual([true], [undefined]), [true])
    assert.deepEqual(greaterThanOrEqual([42], [undefined]), [true])
    assert.deepEqual(greaterThanOrEqual(['string'], [undefined]), [true])
  })

  test('greaterThanOrEqual should handle null values', () => {
    // null vs null (equality)
    assert.deepEqual(greaterThanOrEqual([null], [null]), [true])

    // null vs other values
    assert.deepEqual(greaterThanOrEqual([null], [true]), [false])
    assert.deepEqual(greaterThanOrEqual([null], [42]), [false])

    // other values vs null
    assert.deepEqual(greaterThanOrEqual([true], [null]), [true])
    assert.deepEqual(greaterThanOrEqual([42], [null]), [true])
  })

  test('greaterThanOrEqual should handle boolean vs number comparison', () => {
    // Boolean vs number (boolean > number according to JQ rules)
    assert.deepEqual(greaterThanOrEqual([true], [42]), [true])
    assert.deepEqual(greaterThanOrEqual([false], [42]), [true])

    // Number vs boolean
    assert.deepEqual(greaterThanOrEqual([42], [true]), [false])
    assert.deepEqual(greaterThanOrEqual([42], [false]), [false])
  })

  test('greaterThanOrEqual should handle equality case', () => {
    assert.deepEqual(greaterThanOrEqual([5], [5]), [true])
    assert.deepEqual(greaterThanOrEqual(['abc'], ['abc']), [true])
  })

  // More extensive tests for lessThan operator
  test('lessThan should handle undefined values', () => {
    // undefined vs undefined -> not less than itself
    assert.deepEqual(lessThan([undefined], [undefined]), [false])

    // Everything else vs undefined -> not less than undefined (JQ specific ordering)
    assert.deepEqual(lessThan([null], [undefined]), [true])
    assert.deepEqual(lessThan([true], [undefined]), [true])
    assert.deepEqual(lessThan([42], [undefined]), [true])

    // undefined vs everything else -> undefined should be less than everything
    assert.deepEqual(lessThan([undefined], [null]), [false])
    assert.deepEqual(lessThan([undefined], [true]), [false])
    assert.deepEqual(lessThan([undefined], [42]), [false])
  })

  test('lessThan should handle null values', () => {
    // null vs null -> not less than itself
    assert.deepEqual(lessThan([null], [null]), [false])

    // null vs other values
    assert.deepEqual(lessThan([null], [true]), [true])
    assert.deepEqual(lessThan([null], [42]), [true])

    // other values vs null
    assert.deepEqual(lessThan([true], [null]), [false])
    assert.deepEqual(lessThan([42], [null]), [false])
  })

  test('lessThan should handle boolean vs number comparison', () => {
    // Boolean vs number (expected: boolean > number)
    assert.deepEqual(lessThan([true], [42]), [true])
    assert.deepEqual(lessThan([false], [42]), [true])

    // Number vs boolean
    assert.deepEqual(lessThan([42], [true]), [false])
    assert.deepEqual(lessThan([42], [false]), [false])
  })

  // More extensive tests for lessThanOrEqual operator
  test('lessThanOrEqual should handle undefined values', () => {
    // undefined vs undefined
    assert.deepEqual(lessThanOrEqual([undefined], [undefined]), [false])

    // undefined vs null
    assert.deepEqual(lessThanOrEqual([undefined], [null]), [false])

    // undefined vs other values
    assert.deepEqual(lessThanOrEqual([undefined], [true]), [false])
    assert.deepEqual(lessThanOrEqual([undefined], [42]), [false])

    // other values vs undefined
    assert.deepEqual(lessThanOrEqual([null], [undefined]), [true])
    assert.deepEqual(lessThanOrEqual([true], [undefined]), [true])
    assert.deepEqual(lessThanOrEqual([42], [undefined]), [true])
  })

  test('lessThanOrEqual should handle null values', () => {
    // null vs null (equality)
    assert.deepEqual(lessThanOrEqual([null], [null]), [true])

    // null vs other values
    assert.deepEqual(lessThanOrEqual([null], [true]), [true])
    assert.deepEqual(lessThanOrEqual([null], [42]), [true])

    // other values vs null
    assert.deepEqual(lessThanOrEqual([true], [null]), [false])
    assert.deepEqual(lessThanOrEqual([42], [null]), [false])
  })

  test('lessThanOrEqual should handle boolean vs number comparison', () => {
    // Boolean vs number (boolean > number according to JQ rules)
    assert.deepEqual(lessThanOrEqual([true], [42]), [true])
    assert.deepEqual(lessThanOrEqual([false], [42]), [true])

    // Number vs boolean
    assert.deepEqual(lessThanOrEqual([42], [true]), [false])
    assert.deepEqual(lessThanOrEqual([42], [false]), [false])
  })

  test('lessThanOrEqual should handle equality case', () => {
    assert.deepEqual(lessThanOrEqual([5], [5]), [true])
    assert.deepEqual(lessThanOrEqual(['abc'], ['abc']), [true])
  })

  // More extensive tests for equal operator
  test('equal should handle array comparisons', () => {
    // Compare arrays with arrays
    assert.deepEqual(equal([[1, 2, 3]], [[1, 2, 3]]), [true])
    assert.deepEqual(equal([[1, 2, 3]], [[1, 2, 4]]), [false])

    // Compare array with scalar
    assert.deepEqual(equal([[1, 2, 3, 1]], [1]), [[true, false, false, true]])

    // Compare scalar with array (should be different behavior)
    assert.deepEqual(equal([1], [[1, 2, 3, 1]]), [false])
  })

  test('equal should handle null and undefined', () => {
    assert.deepEqual(equal([null], [null]), [true])
    assert.deepEqual(equal([undefined], [undefined]), [true])
    assert.deepEqual(equal([null], [undefined]), [false])
  })

  test('equal should handle objects with nested structures', () => {
    assert.deepEqual(equal([{ a: 1, b: [1, 2] }], [{ a: 1, b: [1, 2] }]), [true])
    assert.deepEqual(equal([{ a: 1, b: [1, 2] }], [{ a: 1, b: [1, 3] }]), [false])
  })

  // More extensive tests for notEqual operator
  test('notEqual should handle array comparisons', () => {
    // Compare arrays with arrays
    assert.deepEqual(notEqual([[1, 2, 3]], [[1, 2, 3]]), [false])
    assert.deepEqual(notEqual([[1, 2, 3]], [[1, 2, 4]]), [true])

    // Compare array with scalar
    assert.deepEqual(notEqual([[1, 2, 3, 1]], [1]), [[false, true, true, false]])

    // Compare scalar with array
    assert.deepEqual(notEqual([1], [[1, 2, 3, 1]]), [true])
  })

  test('notEqual should handle null and undefined', () => {
    assert.deepEqual(notEqual([null], [null]), [false])
    assert.deepEqual(notEqual([undefined], [undefined]), [false])
    assert.deepEqual(notEqual([null], [undefined]), [true])
  })

  test('notEqual should handle objects with nested structures', () => {
    assert.deepEqual(notEqual([{ a: 1, b: [1, 2] }], [{ a: 1, b: [1, 2] }]), [false])
    assert.deepEqual(notEqual([{ a: 1, b: [1, 2] }], [{ a: 1, b: [1, 3] }]), [true])
  })
})
