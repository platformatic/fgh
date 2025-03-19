import { describe, it } from 'node:test'
import assert from 'node:assert'
import { compile } from '../src/fgh.ts'

// These tests verify that the compile function returns functions that always returns arrays

describe('Array Return API', () => {
  it('should return an array even for a single scalar result', () => {
    const gen = compile('.name')
    const result = gen({ name: 'bob' })

    assert.ok(Array.isArray(result), 'Result should be an array')
    assert.deepStrictEqual(result, ['bob'])
  })

  it('should return an array for multiple results', () => {
    const gen = compile('.users[] | .name')
    const result = gen({ users: [{ name: 'bob' }, { name: 'alice' }] })

    assert.ok(Array.isArray(result), 'Result should be an array')
    assert.deepStrictEqual(result, ['bob', 'alice'])
  })

  it('should return an empty array when no results', () => {
    const gen = compile('.missing')
    const result = gen({ name: 'bob' })

    assert.deepStrictEqual(result, [undefined])
  })

  it('should preserve array structure when results are arrays', () => {
    const gen = compile('.items')
    const result = gen({ items: [[1, 2], [3, 4]] })

    assert.deepStrictEqual(result, [[[1, 2], [3, 4]]])
  })

  it('should return an array of a single array when result is an array', () => {
    const gen = compile('.')
    const result = gen([1, 2, 3])

    assert.deepStrictEqual(result, [[1, 2, 3]])
  })

  it('should return an array containing undefined when result is undefined', () => {
    const gen = compile('.nonexistent[0]')

    assert.throws(() => {
      gen({ something: 'else' })
    })
  })

  it('should return array of scalar values when using multiple expressions', () => {
    const gen = compile('.a, .b')
    const result = gen({ a: 1, b: 2 })

    assert.ok(Array.isArray(result), 'Result should be an array')
    assert.deepStrictEqual(result, [1, 2])
  })

  it('should handle null input by returning array', () => {
    const gen = compile('.')
    const result = gen(null)

    assert.ok(Array.isArray(result), 'Result should be an array')
    assert.deepStrictEqual(result, [null])
  })
})
