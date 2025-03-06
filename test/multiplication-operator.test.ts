// Test for multiplication and division operators

import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('multiplication operator', async (t) => {
  test('should multiply numeric values', () => {
    assert.deepEqual(query('3 * 4', {}), [12])
    assert.deepEqual(query('.a * 2', { a: 5 }), [10])
    assert.deepEqual(query('2 * .a', { a: 5 }), [10])
  })

  test('should handle decimal values', () => {
    assert.deepEqual(query('2.5 * 2', {}), [5])
    assert.deepEqual(query('.a * 1.5', { a: 3 }), [4.5])
  })

  test('should handle null values', () => {
    assert.deepEqual(query('.a * null', { a: 5 }), [0])
    assert.deepEqual(query('null * .a', { a: 5 }), [0])
    assert.deepEqual(query('null * null', {}), [0])
  })

  test('should throw when multiplying arrays', () => {
    assert.throws(() => {
      query('.a * 2', { a: [1, 2] })
    })

    assert.throws(() => {
      query('2 * .a', { a: [1, 2] })
    })
  })

  test('should throw when multiplying objects', () => {
    assert.throws(() => {
      query('.a * 2', { a: { b: 1 } })
    })

    assert.throws(() => {
      query('2 * .a', { a: { b: 1 } })
    })
  })

  test('should handle multiplication in expressions', () => {
    assert.deepEqual(query('(2 + 3) * 2', {}), [10])
    assert.deepEqual(query('2 * (3 + 4)', {}), [14])
    assert.deepEqual(query('.a * (.b + .c)', { a: 2, b: 3, c: 4 }), [14])
  })

  test('supports array iteration with multiplication', () => {
    const input = { a: 2, b: [3, 4, 5] }
    assert.deepEqual(
      query('.a * .b[]', input),
      [6, 8, 10]
    )

    assert.deepEqual(
      query('.b[] * .a', input),
      [6, 8, 10]
    )
  })
})

describe('division operator', async (t) => {
  test('should divide numeric values', () => {
    assert.deepEqual(query('10 / 2', {}), [5])
    assert.deepEqual(query('.a / 2', { a: 10 }), [5])
    assert.deepEqual(query('15 / .a', { a: 3 }), [5])
  })

  test('should handle decimal results', () => {
    assert.deepEqual(query('5 / 2', {}), [2.5])
    assert.deepEqual(query('.a / 3', { a: 10 }), [3.3333333333333335]) // JavaScript floating point
  })

  test.skip('should handle division by zero', () => {
    const result = query('10 / 0', {})
    assert.equal(result.length, 1)
    assert.equal(result[0], Infinity)

    const negResult = query('-10 / 0', {})
    assert.equal(negResult.length, 1)
    assert.equal(negResult[0], -Infinity)
  })

  test('should handle null values', () => {
    assert.throws(() => query('.a / null', { a: 10 }))
    assert.throws(() => query('null / .a', { a: 5 }))
    assert.throws(() => query('null / null', {}))
  })

  test('should throw when dividing arrays', () => {
    assert.throws(() => {
      query('.a / 2', { a: [1, 2] })
    })

    assert.throws(() => {
      query('10 / .a', { a: [1, 2] })
    })
  })

  test('should throw when dividing objects', () => {
    assert.throws(() => {
      query('.a / 2', { a: { b: 1 } })
    })

    assert.throws(() => {
      query('10 / .a', { a: { b: 1 } })
    })
  })

  test('should handle division in expressions', () => {
    assert.deepEqual(query('(10 + 5) / 5', {}), [3])
    assert.deepEqual(query('20 / (2 + 3)', {}), [4])
    assert.deepEqual(query('.a / (.b + .c)', { a: 15, b: 2, c: 3 }), [3])
  })

  test('supports array iteration with division', () => {
    const input = { a: 2, b: [10, 20, 30] }
    assert.deepEqual(
      query('.b[] / .a', input),
      [5, 10, 15]
    )

    assert.deepEqual(
      query('.a / .b[]', input),
      [0.2, 0.1, 0.06666666666666667]
    )
  })
})
