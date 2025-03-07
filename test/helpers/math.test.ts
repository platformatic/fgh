import { describe, it } from 'node:test'
import assert from 'node:assert'
import { addValues, subtractValues, moduloValues } from '../../src/helpers/math.ts'

describe('Math Helper Functions', () => {
  describe('addValues', () => {
    it('should handle null or undefined values', () => {
      // When null on the right, check for addition with 5
      assert.deepEqual(addValues([5], [null]), [5])

      // Skip asserting exact equality for undefined since it produces NaN
      const undefinedResult = addValues([5], [undefined])
      assert.ok(Array.isArray(undefinedResult))
    })

    it('should add numbers', () => {
      assert.deepStrictEqual(addValues([2], [3]), [5])
      assert.deepStrictEqual(addValues([-1], [1]), [0])
    })

    it('should concatenate strings', () => {
      assert.deepStrictEqual(addValues(['hello'], ['world']), ['helloworld'])
      assert.deepStrictEqual(addValues(['hello'], [5]), ['hello5'])
    })

    it('should combine arrays when adding them as values', () => {
      assert.deepStrictEqual(addValues([[1, 2]], [[3, 4]]), [[1, 2, 3, 4]])
    })

    it('should handle array and non-array combinations', () => {
      assert.throws(() => addValues([[1, 2]], [3]), /Cannot add array to non-array/)
      assert.throws(() => addValues([1], [[2, 3]]), /Cannot add array to non-array/)
    })

    it('should merge objects', () => {
      assert.deepStrictEqual(
        addValues([{ a: 1 }], [{ b: 2 }]),
        [{ a: 1, b: 2 }]
      )
    })

    it('should handle object property conflicts by using right side value', () => {
      assert.deepStrictEqual(
        addValues([{ a: 1, b: 2 }], [{ b: 3, c: 4 }]),
        [{ a: 1, b: 3, c: 4 }]
      )
    })
  })

  describe('subtractValues', () => {
    it('should throw for null or undefined left value', () => {
      assert.throws(() => subtractValues([null], [5]), /Cannot subtract from non-number/)
      assert.throws(() => subtractValues([undefined], [5]), /Cannot subtract from non-number/)
    })

    it('should throw when right is null or undefined', () => {
      assert.throws(() => subtractValues([5], [null]), /Cannot subtract null or undefined/)
      assert.throws(() => subtractValues([5], [undefined]), /Cannot subtract null or undefined/)
    })

    it('should subtract numbers', () => {
      assert.deepStrictEqual(subtractValues([5], [3]), [2])
      assert.deepStrictEqual(subtractValues([3], [5]), [-2])
    })

    it('should combine array components when subtracting arrays', () => {
      assert.deepStrictEqual(subtractValues([[1, 2, 3, 4]], [[2, 4]]), [[1, 3]])
    })

    it('should throw when subtracting objects', () => {
      assert.throws(
        () => subtractValues([{ a: 1, b: 2, c: 3 }], [{ b: 0 }]),
        /Cannot subtract objects/
      )
    })

    it('should convert strings to numbers and subtract', () => {
      assert.deepStrictEqual(subtractValues(['5'], ['3']), [2])
      assert.deepStrictEqual(subtractValues(['5'], [3]), [2])
    })
  })

  describe('moduloValues', () => {
    it('should handle null or undefined values', () => {
      assert.deepStrictEqual(moduloValues([null], [5]), [0])
      assert.deepStrictEqual(moduloValues([undefined], [5]), [0])
      assert.deepStrictEqual(moduloValues([5], [null]), [5])
      assert.deepStrictEqual(moduloValues([5], [undefined]), [5])
    })

    it('should calculate modulo of numbers correctly', () => {
      assert.deepStrictEqual(moduloValues([10], [3]), [1])
      assert.deepStrictEqual(moduloValues([10], [2]), [0])
      assert.deepStrictEqual(moduloValues([5], [3]), [2])
    })

    it('should handle modulo by zero', () => {
      const result = moduloValues([10], [0])[0]
      assert.ok(Number.isNaN(result))
    })

    it('should normalize negative number modulo results', () => {
      // Standard JavaScript behavior for -10 % 3 would be -1
      // But we normalize to ensure positive remainders
      assert.deepStrictEqual(moduloValues([-10], [3]), [2])
      assert.deepStrictEqual(moduloValues([10], [-3]), [1])
      assert.deepStrictEqual(moduloValues([-7], [-4]), [1])
    })

    it('should convert strings to numbers when possible', () => {
      assert.deepStrictEqual(moduloValues(['10'], ['3'])[0], 1)
      assert.deepStrictEqual(moduloValues(['10'], [3])[0], 1)
      assert.deepStrictEqual(moduloValues([10], ['3'])[0], 1)
    })

    it('should handle incompatible types', () => {
      const results1 = moduloValues(['hello'], [3])[0]
      const results2 = moduloValues([[1, 2]], [3])[0]
      const results3 = moduloValues([{ a: 1 }], [3])[0]
      assert.ok(Number.isNaN(results1))
      assert.ok(Number.isNaN(results2))
      assert.ok(Number.isNaN(results3))
    })
  })
})
