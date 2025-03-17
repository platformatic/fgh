import { describe, test } from 'node:test'
import assert from 'node:assert'
import { compile, query } from '../src/fgh.ts'

describe('length function', () => {
  test('should return length of strings as number of Unicode codepoints', () => {
    const result = compile('length')('string value')
    assert.deepStrictEqual(result, [12])

    // Unicode string test
    const unicodeString = 'café' // 4 codepoints
    const unicodeResult = compile('length')(unicodeString)
    assert.deepStrictEqual(unicodeResult, [4])
  })

  test('should return absolute value of numbers', () => {
    const positiveResult = compile('length')(42)
    assert.deepStrictEqual(positiveResult, [42])

    const negativeResult = compile('length')(-42)
    assert.deepStrictEqual(negativeResult, [42])

    const zeroResult = compile('length')(0)
    assert.deepStrictEqual(zeroResult, [0])

    const floatResult = compile('length')(3.14)
    assert.deepStrictEqual(floatResult, [3.14])

    const negativeFloatResult = compile('length')(-3.14)
    assert.deepStrictEqual(negativeFloatResult, [3.14])
  })

  test('should return number of elements in an array', () => {
    const emptyArray = compile('length')([])
    assert.deepStrictEqual(emptyArray, [0])

    const nonEmptyArray = compile('length')([1, 2, 3, 4, 5])
    assert.deepStrictEqual(nonEmptyArray, [5])
  })

  test('should return number of key-value pairs in an object', () => {
    const emptyObject = compile('length')({})
    assert.deepStrictEqual(emptyObject, [0])

    const simpleObject = compile('length')({ a: 1, b: 2, c: 3 })
    assert.deepStrictEqual(simpleObject, [3])
  })

  test('should return zero for null and undefined', () => {
    const nullResult = compile('length')(null)
    assert.deepStrictEqual(nullResult, [0])

    // undefined is normalized to null in JSON
    const undefinedResult = compile('length')(undefined)
    assert.deepStrictEqual(undefinedResult, [0])
  })

  test('should throw an error for boolean values', () => {
    assert.throws(() => {
      compile('length')(true)
    }, /Cannot calculate length of boolean value/)

    assert.throws(() => {
      compile('length')(false)
    }, /Cannot calculate length of boolean value/)
  })

  test('should work with array iteration', () => {
    const result = compile('.[] | length')([
      [1, 2, 3],
      'hello',
      { a: 1, b: 2 },
      null,
      -5
    ])
    assert.deepStrictEqual(result, [3, 5, 2, 0, 5])
  })

  test('matches example from JQ documentation', () => {
    // Based on the example from the JQ docs: .[] | length
    const result = query('.[] | length', [
      [1, 2],
      'string',
      { a: 2 },
      null,
      -5
    ])
    assert.deepStrictEqual(result, [2, 6, 1, 0, 5])
  })
})
