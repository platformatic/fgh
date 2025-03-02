// Test for modulo operator
import { test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

test('modulo operator', async (t) => {
  await t.test('should perform modulo on numbers', () => {
    assert.deepStrictEqual(query('10 % 3', null), [1])
    assert.deepStrictEqual(query('10 % 2', null), [0])
    assert.deepStrictEqual(query('5 % 3', null), [2])
    assert.deepStrictEqual(query('7 % 4', null), [3])
  })

  await t.test('should handle edge cases', () => {
    // Modulo by zero returns NaN
    const result = query('10 % 0', null)
    assert.deepStrictEqual(result.length, 1)
    assert.ok(Number.isNaN(result[0]))

    // Negative numbers using variables (the implementation normalizes to match mathematical mod operation)
    // -10 % 3 = -1 in JavaScript, but in mathematical modulo it's 2
    assert.deepStrictEqual(query('.negValue % 3', { negValue: -10 }), [2])
    // 10 % -3 = 1 in JavaScript, and our implementation preserves this behavior
    assert.deepStrictEqual(query('10 % .negDivisor', { negDivisor: -3 }), [1])

    // Modulo with null/undefined
    assert.deepStrictEqual(query('null % 5', null), [0])
    assert.deepStrictEqual(query('10 % null', null), [10])
  })

  await t.test('should work with variables', () => {
    assert.deepStrictEqual(
      query('.value % 3', { value: 10 }),
      [1]
    )
  })

  await t.test('should handle modulo in expressions', () => {
    assert.deepStrictEqual(query('(10 + 5) % 7', null), [1])
    assert.deepStrictEqual(query('10 % (1 + 2)', null), [1])
    assert.deepStrictEqual(query('(20 / 2) % 3', null), [1])
  })

  await t.test('should work with arrays', () => {
    const result = query('.[] | . % 3', [5, 7, 9, 10, 12])
    assert.deepStrictEqual(result, [2, 1, 0, 1, 0])
  })

  await t.test('should work in object construction', () => {
    assert.deepStrictEqual(
      query('{ remainder: (10 % 3), even: (.value % 2 == 0) }', { value: 6 }),
      [{ remainder: 1, even: true }]
    )
  })
})
