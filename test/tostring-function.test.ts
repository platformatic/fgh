import { describe, test } from 'node:test'
import assert from 'node:assert'
import { compile } from '../src/fgh.ts'

describe('tostring function', () => {
  test('should leave strings unchanged', () => {
    const result = compile('tostring')('string value')
    assert.deepStrictEqual(result, ['string value'])
  })

  test('should convert numbers to strings', () => {
    const result = compile('tostring')(42)
    assert.deepStrictEqual(result, ['42'])
  })

  test('should convert booleans to strings', () => {
    const result = compile('tostring')(true)
    assert.deepStrictEqual(result, ['true'])
  })

  test('should convert null to string', () => {
    const result = compile('tostring')(null)
    assert.deepStrictEqual(result, ['null'])
  })

  test('should convert array to JSON string', () => {
    const result = compile('tostring')([1, 2, 3])
    assert.deepStrictEqual(result, ['[1,2,3]'])
  })

  test('should convert object to JSON string', () => {
    const result = compile('tostring')({ a: 1, b: 2 })
    assert.deepStrictEqual(result, ['{"a":1,"b":2}'])
  })

  test('should work with array iteration', () => {
    const result = compile('.[] | tostring')([1, '1', [1]])
    assert.deepStrictEqual(result, ['1', '1', '[1]'])
  })

  test('should chain with other operations', () => {
    const result = compile('.items[] | tostring')({ items: [1, '1', [1]] })
    assert.deepStrictEqual(result, ['1', '1', '[1]'])
  })

  test('matches example from requirements', () => {
    const result = compile('.[] | tostring')([1, '1', [1]])
    assert.deepStrictEqual(result, ['1', '1', '[1]'])
  })
})
