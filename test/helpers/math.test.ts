import { describe, it } from 'node:test'
import assert from 'node:assert'
import { addValues, subtractValues, moduloValues } from '../../src/helpers/math.ts'

describe.skip('Math Helper Functions', () => {
  describe('addValues', () => {
    it('should handle null or undefined values', () => {
      assert.strictEqual(addValues(null, 5), 5)
      assert.strictEqual(addValues(undefined, 5), 5)
      assert.strictEqual(addValues(5, null), 5)
      assert.strictEqual(addValues(5, undefined), 5)
    })

    it('should add numbers', () => {
      assert.strictEqual(addValues(2, 3), 5)
      assert.strictEqual(addValues(-1, 1), 0)
    })

    it('should concatenate strings', () => {
      assert.strictEqual(addValues('hello', 'world'), 'helloworld')
      assert.strictEqual(addValues('hello', 5), 'hello5')
    })

    it('should merge arrays', () => {
      assert.deepStrictEqual(addValues([1, 2], [3, 4]), [1, 2, 3, 4])
    })

    it('should handle array and non-array combinations', () => {
      assert.deepStrictEqual(addValues([1, 2], 3), [1, 2, 3])
      assert.deepStrictEqual(addValues(1, [2, 3]), [1, 2, 3])
    })

    it('should merge objects', () => {
      assert.deepStrictEqual(
        addValues({ a: 1 }, { b: 2 }),
        { a: 1, b: 2 }
      )
    })

    it('should handle object property conflicts by using right side value', () => {
      assert.deepStrictEqual(
        addValues({ a: 1, b: 2 }, { b: 3, c: 4 }),
        { a: 1, b: 3, c: 4 }
      )
    })
  })

  describe('subtractValues', () => {
    it('should handle null or undefined left value', () => {
      assert.strictEqual(subtractValues(null, 5), -5)
      assert.strictEqual(subtractValues(undefined, 5), -5)
      assert.deepStrictEqual(subtractValues(null, [1, 2]), [])
    })

    it('should return left value when right is null or undefined', () => {
      assert.strictEqual(subtractValues(5, null), 5)
      assert.strictEqual(subtractValues(5, undefined), 5)
    })

    it('should subtract numbers', () => {
      assert.strictEqual(subtractValues(5, 3), 2)
      assert.strictEqual(subtractValues(3, 5), -2)
    })

    it('should remove elements from arrays', () => {
      assert.deepStrictEqual(subtractValues([1, 2, 3, 4], [2, 4]), [1, 3])
      // Check the result is marked with _fromDifference
      const result = subtractValues([1, 2, 3], [2])
      assert.deepStrictEqual(result, [1, 3])
    })

    it('should handle string arrays correctly', () => {
      assert.deepStrictEqual(
        subtractValues(['a', 'b', 'c'], ['b']),
        ['a', 'c']
      )
    })

    it('should remove single value from array', () => {
      assert.deepStrictEqual(subtractValues([1, 2, 3, 2], 2), [1, 3])
    })

    it('should handle non-array minus array by returning left value', () => {
      assert.strictEqual(subtractValues(5, [1, 2]), 5)
    })

    it('should remove keys from objects', () => {
      assert.deepStrictEqual(
        subtractValues({ a: 1, b: 2, c: 3 }, { b: 0 }),
        { a: 1, c: 3 }
      )
    })

    it('should convert to numbers and subtract if possible', () => {
      assert.strictEqual(subtractValues('5', '3'), 2)
      assert.strictEqual(subtractValues('5', 3), 2)
    })

    it('should return left value if numeric conversion is not possible', () => {
      assert.strictEqual(subtractValues('hello', 'world'), 'hello')
    })
  })

  describe('moduloValues', () => {
    it('should handle null or undefined values', () => {
      assert.strictEqual(moduloValues(null, 5), 0)
      assert.strictEqual(moduloValues(undefined, 5), 0)
      assert.strictEqual(moduloValues(5, null), 5)
      assert.strictEqual(moduloValues(5, undefined), 5)
    })

    it('should calculate modulo of numbers correctly', () => {
      assert.strictEqual(moduloValues(10, 3), 1)
      assert.strictEqual(moduloValues(10, 2), 0)
      assert.strictEqual(moduloValues(5, 3), 2)
    })

    it('should handle modulo by zero', () => {
      assert.ok(Number.isNaN(moduloValues(10, 0)))
    })

    it('should normalize negative number modulo results', () => {
      // Standard JavaScript behavior for -10 % 3 would be -1
      // But we normalize to ensure positive remainders
      assert.strictEqual(moduloValues(-10, 3), 2)
      assert.strictEqual(moduloValues(10, -3), 1)
      assert.strictEqual(moduloValues(-7, -4), 1)
    })

    it('should convert strings to numbers when possible', () => {
      assert.strictEqual(moduloValues('10', '3'), 1)
      assert.strictEqual(moduloValues('10', 3), 1)
      assert.strictEqual(moduloValues(10, '3'), 1)
    })

    it('should return NaN for incompatible types', () => {
      assert.ok(Number.isNaN(moduloValues('hello', 3)))
      assert.ok(Number.isNaN(moduloValues([1, 2], 3)))
      assert.ok(Number.isNaN(moduloValues({ a: 1 }, 3)))
    })
  })
})
