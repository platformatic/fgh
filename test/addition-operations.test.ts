import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('Addition operation test suite', async (t) => {
  test('Addition with undefined property returns just the left side', () => {
    const filter = '"product-" + .baz'
    const input = { foo: { bar: 42 } }

    const result = query(filter, input)
    assert.strictEqual(result[0], 'product-')
  })

  test('Addition with undefined left side returns just the right side', () => {
    const filter = '.nonexistent + "suffix"'
    const input = { foo: { bar: 42 } }

    const result = query(filter, input)
    assert.strictEqual(result[0], 'suffix')
  })

  test('Addition with both defined values works normally', () => {
    const filter = '.foo.bar + 8'
    const input = { foo: { bar: 42 } }

    const result = query(filter, input)
    assert.strictEqual(result[0], 50)
  })

  test('String concatenation works', () => {
    const filter = '"hello " + "world"'
    const input = {}

    const result = query(filter, input)
    assert.strictEqual(result[0], 'hello world')
  })

  test.only('Array concatenation works', () => {
    const filter = '[1, 2] + [3, 4]'
    const input = {}

    const result = query(filter, input)
    console.log('Array concatenation result:', result)
    assert.deepStrictEqual(result[0], [1, 2, 3, 4])
  })

  test('Object merging works', () => {
    const filter = '{"a": 1} + {"b": 2}'
    const input = {}

    const result = query(filter, input)
    assert.deepStrictEqual(result[0], { a: 1, b: 2 })
  })
})
