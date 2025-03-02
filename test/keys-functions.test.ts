import { describe, test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('keys function', () => {
  test('keys on an object returns sorted keys', () => {
    const input = { abc: 1, abcd: 2, Foo: 3 }
    const result = query('keys', input)
    assert.deepStrictEqual(result, ['Foo', 'abc', 'abcd'])
  })

  test('keys on an array returns indices', () => {
    const input = [42, 3, 35]
    const result = query('keys', input)
    assert.deepStrictEqual(result, [0, 1, 2])
  })

  test('keys on an empty object returns empty array', () => {
    const input = {}
    const result = query('keys', input)
    assert.deepStrictEqual(result, [])
  })

  test('keys on nested objects returns only the top level keys', () => {
    const input = { a: { b: 1, c: 2 }, d: 3 }
    const result = query('keys', input)
    assert.deepStrictEqual(result, ['a', 'd'])
  })

  test('keys handles Unicode characters correctly', () => {
    const input = { '😊': 1, 'é': 2, 'a': 3 }
    const result = query('keys', input)
    // Unicode sort order: a, é, 😊
    assert.deepStrictEqual(result, ['a', 'é', '😊'])
  })

  test('keys on a string', () => {
    const input = 'hello'
    const result = query('keys', input)
    assert.deepStrictEqual(result, [])
  })

  test('keys on null returns empty array', () => {
    const input = null
    const result = query('keys', input)
    assert.deepStrictEqual(result, [])
  })

  test('keys on number returns empty array', () => {
    const input = 42
    const result = query('keys', input)
    assert.deepStrictEqual(result, [])
  })

  test('keys on boolean returns empty array', () => {
    const input = true
    const result = query('keys', input)
    assert.deepStrictEqual(result, [])
  })
})

describe('keys_unsorted function', () => {
  test('keys_unsorted on an object returns keys in insertion order', () => {
    const input = { abc: 1, abcd: 2, Foo: 3 }
    const result = query('keys_unsorted', input)
    assert.deepStrictEqual(result, ['abc', 'abcd', 'Foo'])
  })

  test('keys_unsorted on an array returns indices', () => {
    const input = [42, 3, 35]
    const result = query('keys_unsorted', input)
    assert.deepStrictEqual(result, [0, 1, 2])
  })

  test('keys_unsorted on an empty object returns empty array', () => {
    const input = {}
    const result = query('keys_unsorted', input)
    assert.deepStrictEqual(result, [])
  })

  test('keys_unsorted maintains object property definition order', () => {
    // Create object with specific property order
    const input = {}
    Object.defineProperty(input, 'z', { value: 1, enumerable: true })
    Object.defineProperty(input, 'a', { value: 2, enumerable: true })
    Object.defineProperty(input, 'k', { value: 3, enumerable: true })
    
    const result = query('keys_unsorted', input)
    assert.deepStrictEqual(result, ['z', 'a', 'k'])
  })
  
  test('keys_unsorted vs keys - comparison', () => {
    // Create object where keys_unsorted and keys should return different orders
    const input = {}
    Object.defineProperty(input, 'c', { value: 1, enumerable: true })
    Object.defineProperty(input, 'a', { value: 2, enumerable: true })
    Object.defineProperty(input, 'b', { value: 3, enumerable: true })
    
    const unsortedResult = query('keys_unsorted', input)
    const sortedResult = query('keys', input)
    
    assert.deepStrictEqual(unsortedResult, ['c', 'a', 'b'])
    assert.deepStrictEqual(sortedResult, ['a', 'b', 'c'])
  })

  test('keys_unsorted on a string', () => {
    const input = 'hello'
    const result = query('keys_unsorted', input)
    assert.deepStrictEqual(result, [])
  })

  test('keys_unsorted on null returns empty array', () => {
    const input = null
    const result = query('keys_unsorted', input)
    assert.deepStrictEqual(result, [])
  })

  test('keys_unsorted on number returns empty array', () => {
    const input = 42
    const result = query('keys_unsorted', input)
    assert.deepStrictEqual(result, [])
  })

  test('keys_unsorted on boolean returns empty array', () => {
    const input = true
    const result = query('keys_unsorted', input)
    assert.deepStrictEqual(result, [])
  })
})
