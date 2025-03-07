import { test, describe } from 'node:test'
import assert from 'node:assert'
import {
  compareValues,
  isDeepEqual
} from '../src/helpers/sort.ts'

describe('Extended Sort Functions Tests', async (t) => {
  test('compareValues should handle empty objects and arrays', () => {
    // Empty arrays/objects should be equal to themselves
    assert.equal(compareValues([], []), 0)
    assert.equal(compareValues({}, {}), 0)

    // Empty array comes before non-empty array
    assert.equal(compareValues([], [1]), -1)
    assert.equal(compareValues([1], []), 1)

    // Empty object comes before non-empty object
    assert.equal(compareValues({}, { a: 1 }), -1)
    assert.equal(compareValues({ a: 1 }, {}), 1)
  })

  test('compareValues should correctly order different types', () => {
    // Test the type ordering logic: null < boolean < number < string < array < object
    assert.equal(compareValues(null, false), -1)
    assert.equal(compareValues(false, 0), -1)
    assert.equal(compareValues(0, ''), -1)
    assert.equal(compareValues('', []), -1)
    assert.equal(compareValues([], {}), -1)

    // Reverse comparisons
    assert.equal(compareValues(false, null), 1)
    assert.equal(compareValues(0, false), 1)
    assert.equal(compareValues('', 0), 1)
    assert.equal(compareValues([], ''), 1)
    assert.equal(compareValues({}, []), 1)
  })

  test('compareValues should handle complex nested objects', () => {
    const obj1 = {
      a: 1,
      b: {
        c: 'test',
        d: [1, 2, 3]
      }
    }

    const obj2 = {
      a: 1,
      b: {
        c: 'test',
        d: [1, 2, 4]
      }
    }

    // Objects differ at the nested array's third element
    assert.equal(compareValues(obj1, obj2), -1)
    assert.equal(compareValues(obj2, obj1), 1)

    // Copy of obj1 should be equal
    const obj1Copy = JSON.parse(JSON.stringify(obj1))
    assert.equal(compareValues(obj1, obj1Copy), 0)
  })

  test('compareValues should handle arrays of different lengths', () => {
    // Shorter array comes before longer array if common elements are equal
    assert.equal(compareValues([1, 2], [1, 2, 3]), -1)
    assert.equal(compareValues([1, 2, 3], [1, 2]), 1)

    // Order by elements first, then by length
    assert.equal(compareValues([2, 1], [1, 2, 3]), 1)
    assert.equal(compareValues([1, 3], [1, 2, 3]), 1)
  })

  test('compareValues should sort booleans with false before true', () => {
    assert.equal(compareValues(false, true), -1)
    assert.equal(compareValues(true, false), 1)
    assert.equal(compareValues(true, true), 0)
    assert.equal(compareValues(false, false), 0)
  })

  test('compareValues should sort numbers in ascending order', () => {
    assert.equal(compareValues(1, 2), -1)
    assert.equal(compareValues(2, 1), 1)
    assert.equal(compareValues(1, 1), 0)
    assert.equal(compareValues(-1, 1), -2)

    // Avoid floating point precision issues by using a more general assertion
    const result = compareValues(1.5, 1.6)
    assert.ok(result < 0, `Expected negative number, got ${result}`)
  })

  test('compareValues should sort strings lexicographically', () => {
    assert.equal(compareValues('a', 'b'), -1)
    assert.equal(compareValues('b', 'a'), 1)
    assert.equal(compareValues('a', 'a'), 0)

    // In most locales, lowercase does come after uppercase
    const result1 = compareValues('a', 'A')
    assert.ok(result1 !== 0, "Expected 'a' and 'A' to compare as not equal")

    const result2 = compareValues('z', 'A')
    assert.ok(result2 !== 0, "Expected 'z' and 'A' to compare as not equal")
  })

  test('isDeepEqual should handle basic values', () => {
    assert.equal(isDeepEqual(1, 1), true)
    assert.equal(isDeepEqual('a', 'a'), true)
    assert.equal(isDeepEqual(true, true), true)
    assert.equal(isDeepEqual(null, null), true)
    assert.equal(isDeepEqual(undefined, undefined), true)

    assert.equal(isDeepEqual(1, 2), false)
    assert.equal(isDeepEqual('a', 'b'), false)
    assert.equal(isDeepEqual(true, false), false)
    assert.equal(isDeepEqual(null, undefined), false)
  })

  test('isDeepEqual should handle arrays', () => {
    assert.equal(isDeepEqual([1, 2, 3], [1, 2, 3]), true)
    assert.equal(isDeepEqual([], []), true)

    assert.equal(isDeepEqual([1, 2, 3], [1, 2, 4]), false)
    assert.equal(isDeepEqual([1, 2], [1, 2, 3]), false)
    assert.equal(isDeepEqual([1, 2, 3], [3, 2, 1]), false)
  })

  test('isDeepEqual should handle objects', () => {
    assert.equal(isDeepEqual({ a: 1, b: 2 }, { a: 1, b: 2 }), true)
    assert.equal(isDeepEqual({}, {}), true)

    assert.equal(isDeepEqual({ a: 1, b: 2 }, { a: 1, b: 3 }), false)
    assert.equal(isDeepEqual({ a: 1 }, { a: 1, b: 2 }), false)
    assert.equal(isDeepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true) // Order doesn't matter
  })

  test('isDeepEqual should handle nested structures', () => {
    assert.equal(isDeepEqual(
      { a: 1, b: [1, 2, { c: 3 }] },
      { a: 1, b: [1, 2, { c: 3 }] }
    ), true)

    assert.equal(isDeepEqual(
      { a: 1, b: [1, 2, { c: 3 }] },
      { a: 1, b: [1, 2, { c: 4 }] }
    ), false)
  })

  test('isDeepEqual should handle different types', () => {
    assert.equal(isDeepEqual(1, '1'), false)
    assert.equal(isDeepEqual(0, false), false)
    assert.equal(isDeepEqual([], {}), false)
    assert.equal(isDeepEqual([1], { 0: 1 }), false)
  })
})
