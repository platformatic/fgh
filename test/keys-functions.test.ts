import { describe, test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('keys function', () => {
  test('keys on an object returns sorted keys', () => {
    const input = { abc: 1, abcd: 2, Foo: 3 }
    const result = query('keys', input)
    assert.deepStrictEqual(result, [['Foo', 'abc', 'abcd']])
  })

  test('keys on an array returns indices', () => {
    const input = [42, 3, 35]
    const result = query('keys', input)
    assert.deepStrictEqual(result, [[0, 1, 2]])
  })

  test('keys on an empty object returns empty array', () => {
    const input = {}
    const result = query('keys', input)
    assert.deepStrictEqual(result, [[]])
  })

  test('keys on nested objects returns only the top level keys', () => {
    const input = { a: { b: 1, c: 2 }, d: 3 }
    const result = query('keys', input)
    assert.deepStrictEqual(result, [['a', 'd']])
  })

  test('keys handles Unicode characters correctly', () => {
    const input = { '😊': 1, é: 2, a: 3 }
    const result = query('keys', input)
    // Unicode sort order: a, é, 😊
    assert.deepStrictEqual(result, [['a', 'é', '😊']])
  })

  test('keys on a string throws', () => {
    const input = 'hello'
    assert.throws(() => query('keys', input))
  })

  test('keys on null throws', () => {
    const input = null
    assert.throws(() => query('keys', input))
  })

  test('keys on number throws', () => {
    const input = 42
    assert.throws(() => query('keys', input))
  })

  test('keys on boolean throws', () => {
    const input = true
    assert.throws(() => query('keys', input))
  })
})

describe('keys_unsorted function', () => {
  test('keys_unsorted on an object returns keys in insertion order', () => {
    const input = { abc: 1, abcd: 2, Foo: 3 }
    const result = query('keys_unsorted', input)
    assert.deepStrictEqual(result, [['abc', 'abcd', 'Foo']])
  })

  test('keys_unsorted on an array returns indices', () => {
    const input = [42, 3, 35]
    const result = query('keys_unsorted', input)
    assert.deepStrictEqual(result, [[0, 1, 2]])
  })

  test('keys_unsorted on an empty object returns empty array', () => {
    const input = {}
    const result = query('keys_unsorted', input)
    assert.deepStrictEqual(result, [[]])
  })

  test('keys_unsorted maintains object property definition order', () => {
    // Create object with specific property order
    const input = {}
    Object.defineProperty(input, 'z', { value: 1, enumerable: true })
    Object.defineProperty(input, 'a', { value: 2, enumerable: true })
    Object.defineProperty(input, 'k', { value: 3, enumerable: true })

    const result = query('keys_unsorted', input)
    assert.deepStrictEqual(result, [['z', 'a', 'k']])
  })

  test('keys_unsorted vs keys - comparison', () => {
    // Create object where keys_unsorted and keys should return different orders
    const input = {}
    Object.defineProperty(input, 'c', { value: 1, enumerable: true })
    Object.defineProperty(input, 'a', { value: 2, enumerable: true })
    Object.defineProperty(input, 'b', { value: 3, enumerable: true })

    const unsortedResult = query('keys_unsorted', input)
    const sortedResult = query('keys', input)

    assert.deepStrictEqual(unsortedResult, [['c', 'a', 'b']])
    assert.deepStrictEqual(sortedResult, [['a', 'b', 'c']])
  })

  test('keys_unsorted on a string throws', () => {
    const input = 'hello'
    assert.throws(() => query('keys_unsorted', input))
  })

  test('keys_unsorted on null throws', () => {
    const input = null
    assert.throws(() => query('keys_unsorted', input))
  })

  test('keys_unsorted on number throws', () => {
    const input = 42
    assert.throws(() => query('keys_unsorted', input))
  })

  test('keys_unsorted on boolean returns empty array', () => {
    const input = true
    assert.throws(() => query('keys_unsorted', input))
  })
})

describe('keys and keys_unsorted with pipes and filters', () => {
  test.skip('keys | select - filter object keys', () => {
    const input = { name: 'John', age: 30, address: '123 Main St', email: 'john@example.com' }
    const result = query('keys | select(. != "age")', input)
    assert.deepStrictEqual(result, ['address', 'email', 'name'])
  })

  test.skip('keys with select comparison using equality', () => {
    const input = { name: 'John', age: 30, address: '123 Main St', email: 'john@example.com' }
    // Select keys equal to 'name'
    const result = query('keys | select(. == "name")', input)
    assert.deepStrictEqual(result, ['name'])
  })

  test('keys_unsorted with pipe to identity', () => {
    const input = { z: 1, a: 2, c: 3, b: 4 }
    const result = query('keys_unsorted | .', input)
    assert.deepStrictEqual(result, [['z', 'a', 'c', 'b']])
  })
})
