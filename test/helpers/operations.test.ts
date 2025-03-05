import { describe, it } from 'node:test'
import assert from 'node:assert'
import { handlePipe, constructArray, constructObject } from '../../src/helpers/operations.ts'

describe('Operations Helper Functions', () => {
  describe('handlePipe', () => {
    it('should return undefined if left function returns undefined', () => {
      const leftFn = () => undefined
      const rightFn = (x: any) => x
      assert.strictEqual(handlePipe({}, leftFn, rightFn), undefined)
    })

    it('should apply right function to result of left function', () => {
      const leftFn = () => 5
      const rightFn = (x: number) => x * 2
      // The result is an array due to array construction property
      const result = handlePipe({}, leftFn, rightFn)
      assert.deepStrictEqual(result, [10])
    })

    it('should handle array results from left function', () => {
      const leftFn = () => [1, 2, 3]
      const rightFn = (x: number) => x * 2
      assert.deepStrictEqual(handlePipe({}, leftFn, rightFn), [2, 4, 6])
    })

    it('should spread arrays from right function', () => {
      const leftFn = () => [1, 2]
      const rightFn = (x: number) => [x, x + 1]
      assert.deepStrictEqual(handlePipe({}, leftFn, rightFn), [1, 2, 2, 3])
    })

    it('should skip undefined results from right function', () => {
      const leftFn = () => [1, 2, 3]
      const rightFn = (x: number) => x > 1 ? x * 2 : undefined
      assert.deepStrictEqual(handlePipe({}, leftFn, rightFn), [4, 6])
    })
  })

  describe('constructArray', () => {
    it('should return empty array for null or undefined input', () => {
      assert.deepStrictEqual(constructArray(null, []), [])
      assert.deepStrictEqual(constructArray(undefined, []), [])
    })

    it('should apply element functions and collect results', () => {
      const elementFns = [
        (input: any) => ({ type: 'test', value: input.a }),
        (input: any) => ({ type: 'test', value: input.b })
      ]
      const result = constructArray({ a: 1, b: 2 }, elementFns)
      assert.deepStrictEqual(result, [1, 2])
      // Flag removed: property construction markers no longer needed
    })

    it('should skip undefined results', () => {
      const elementFns = [
        (input: any) => ({ type: 'test', value: input.a }),
        (input: any) => ({ type: 'test', value: input.b }),
        (input: any) => ({ type: 'test', value: input.c })
      ]
      const result = constructArray({ a: 1, b: 2 }, elementFns)
      assert.deepStrictEqual(result, [1, 2])
    })

    it('should spread array results from element functions', () => {
      const elementFns = [
        (input: any) => ({ type: 'test', value: [input.a, input.b] }),
        (input: any) => ({ type: 'test', value: input.c })
      ]
      const result = constructArray({ a: 1, b: 2, c: 3 }, elementFns)
      assert.deepStrictEqual(result, [1, 2, 3])
    })
  })

  describe('constructObject', () => {
    it('should handle null input by creating an empty object', () => {
      const fields = [
        { isDynamic: false, key: 'a', value: () => 1 }
      ]
      assert.deepStrictEqual(constructObject(null, fields), { a: 1 })
    })

    it('should return undefined for undefined input', () => {
      const fields: any[] = []
      assert.strictEqual(constructObject(undefined, fields), undefined)
    })

    it('should create object with static fields', () => {
      const fields = [
        { isDynamic: false, key: 'a', value: (input: any) => input.x },
        { isDynamic: false, key: 'b', value: (input: any) => input.y }
      ]
      assert.deepStrictEqual(
        constructObject({ x: 1, y: 2 }, fields),
        { a: 1, b: 2 }
      )
    })

    it('should handle dynamic keys', () => {
      const fields = [
        { isDynamic: false, key: 'a', value: (input: any) => input.x },
        { isDynamic: true, key: (input: any) => input.key, value: (input: any) => input.y }
      ]
      assert.deepStrictEqual(
        constructObject({ x: 1, y: 2, key: 'dynamic' }, fields),
        { a: 1, dynamic: 2 }
      )
    })

    it('should handle array fields by creating array of objects', () => {
      const fields = [
        { isDynamic: false, key: 'id', value: (input: any) => input.id },
        { isDynamic: false, key: 'item', value: (input: any) => input.items }
      ]
      assert.deepStrictEqual(
        constructObject({ id: 1, items: ['a', 'b'] }, fields),
        [
          { id: 1, item: 'a' },
          { id: 1, item: 'b' }
        ]
      )
    })

    it('should ignore dynamic keys that evaluate to undefined', () => {
      const fields = [
        { isDynamic: false, key: 'a', value: (input: any) => 1 },
        { isDynamic: true, key: () => undefined, value: (input: any) => 2 }
      ]
      assert.deepStrictEqual(constructObject({}, fields), { a: 1 })
    })
  })
})
