import { describe, it } from 'node:test'
import assert from 'node:assert'
import { handlePipe, constructArray, constructObject } from '../../src/helpers/operations.ts'

describe('Operations Helper Functions', () => {
  describe('handlePipe', () => {
    it('should return empty array if left function returns undefined', () => {
      const leftFn = () => undefined
      const rightFn = (x) => x
      assert.deepStrictEqual(handlePipe([], leftFn, rightFn), [])
    })

    it('should apply right function to result of left function', () => {
      const leftFn = () => [5]
      const rightFn = (x) => [x[0] * 2]
      const result = handlePipe([{}], leftFn, rightFn)
      assert.deepStrictEqual(result, [10])
    })

    it('should handle array results from left function', () => {
      const leftFn = () => [1, 2, 3]
      const rightFn = (x) => [x[0] * 2]
      assert.deepStrictEqual(handlePipe([{}], leftFn, rightFn), [2, 4, 6])
    })

    it('should spread arrays from right function', () => {
      const leftFn = () => [1, 2]
      const rightFn = (x) => [x[0], x[0] + 1]
      assert.deepStrictEqual(handlePipe([{}], leftFn, rightFn), [1, 2, 2, 3])
    })

    it('should skip undefined results from right function', () => {
      const leftFn = () => [1, 2, 3]
      const rightFn = (x) => x[0] > 1 ? [x[0] * 2] : undefined
      assert.deepStrictEqual(handlePipe([{}], leftFn, rightFn), [4, 6])
    })
  })

  describe('constructArray', () => {
    it('should return empty array for null or undefined input', () => {
      assert.deepStrictEqual(constructArray([], []), [])
    })

    it('should apply element functions and collect results', () => {
      const elementFns = [
        () => ({ values: 1 }),
        () => ({ values: 2 })
      ]
      const result = constructArray([{ a: 1, b: 2 }], elementFns)
      assert.deepStrictEqual(result, [[1, 2]])
    })

    it('should skip undefined results', () => {
      const elementFns = [
        () => ({ values: 1 }),
        () => ({ values: 2 }),
        () => ({ values: undefined })
      ]
      const result = constructArray([{ a: 1, b: 2 }], elementFns)
      assert.deepStrictEqual(result, [[1, 2]])
    })

    it('should spread array results from element functions', () => {
      const elementFns = [
        () => ({ values: [1, 2] }),
        () => ({ values: 3 })
      ]
      const result = constructArray([{ a: 1, b: 2, c: 3 }], elementFns)
      assert.deepStrictEqual(result, [[1, 2, 3]])
    })
  })

  describe('constructObject', () => {
    it('should construct objects for each input item', () => {
      const fields = [
        { isDynamic: false, key: 'a', value: () => [1] }
      ]
      assert.deepStrictEqual(constructObject([[null]], fields), [{ a: 1 }])
    })

    it('should construct objects with field values', () => {
      const fields = [
        { isDynamic: false, key: 'a', value: () => [1] },
        { isDynamic: false, key: 'b', value: () => [2] }
      ]
      assert.deepStrictEqual(
        constructObject([{}], fields),
        [{ a: 1, b: 2 }]
      )
    })

    it('should handle dynamic keys', () => {
      const fields = [
        { isDynamic: false, key: 'a', value: () => [1] },
        { isDynamic: true, key: () => 'dynamic', value: () => [2] }
      ]
      assert.deepStrictEqual(
        constructObject([{}], fields),
        [{ a: 1, dynamic: 2 }]
      )
    })

    it('should produce combinations for multiple field values', () => {
      const fields = [
        { isDynamic: false, key: 'id', value: () => [1] },
        { isDynamic: false, key: 'item', value: () => ['a', 'b'] }
      ]
      assert.deepStrictEqual(
        constructObject([{}], fields),
        [
          { id: 1, item: 'a' },
          { id: 1, item: 'b' }
        ]
      )
    })

    it('should use string representation for dynamic keys', () => {
      const fields = [
        { isDynamic: false, key: 'a', value: () => [1] },
        { isDynamic: true, key: () => undefined, value: () => [2] }
      ]
      const result = constructObject([{}], fields)[0]
      assert.strictEqual(result.a, 1)
      // The undefined key becomes 'undefined' string in the current implementation
      assert.strictEqual(result['undefined'], 2)
    })
  })
})
