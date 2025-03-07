import { test } from 'node:test'
import assert from 'node:assert'
import { logicalAnd, logicalOr, logicalNot } from '../src/helpers/boolean.ts'

test('logicalAnd should handle nested arrays correctly', () => {
  // Test nested arrays on both sides
  const left = [[true, false]]
  const right = [[true, true]]
  const result = logicalAnd(left, right)
  
  // The result should have flattened arrays with evaluated logical operations
  assert.deepStrictEqual(result, [true])
})

test('logicalOr should handle nested arrays correctly', () => {
  // Test nested arrays on both sides
  const left = [[false, false]]
  const right = [[false, true]]
  const result = logicalOr(left, right)
  
  // The result should have flattened arrays with evaluated logical operations
  assert.deepStrictEqual(result, [true])
})

test('logicalAnd with array on left side only', () => {
  const left = [[true, false]]
  const right = true
  const result = logicalAnd(left, right)
  
  assert.deepStrictEqual(result, [true])
})

test('logicalAnd with array on right side only', () => {
  const left = true
  const right = [[true, false]]
  const result = logicalAnd(left, right)
  
  assert.deepStrictEqual(result, [true])
})

test('logicalOr with array on left side only', () => {
  const left = [[false, false]]
  const right = true
  const result = logicalOr(left, right)
  
  assert.deepStrictEqual(result, [true])
})

test('logicalOr with array on right side only', () => {
  const left = false
  const right = [[false, true]]
  const result = logicalOr(left, right)
  
  assert.deepStrictEqual(result, [true])
})

test('logicalNot with empty array', () => {
  const result = logicalNot([])
  assert.deepStrictEqual(result, [false]) // Empty arrays are truthy in JQ, so their negation is false
})
