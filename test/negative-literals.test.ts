import { test } from 'node:test'
import assert from 'node:assert'
import { compile } from '../src/fgh.ts'

test('negative number literals', () => {
  // Test case from requirements
  const filter = '-1'
  const input = null
  const fn = compile(filter)
  const result = fn(input)
  assert.deepEqual(result, [-1])

  // Additional tests for completeness
  const filter2 = '-42'
  const fn2 = compile(filter2)
  const result2 = fn2(input)
  assert.deepEqual(result2, [-42])

  // Test with a decimal point
  const filter3 = '-3.14'
  const fn3 = compile(filter3)
  const result3 = fn3(input)
  assert.deepEqual(result3, [-3.14])
})

test('mixed negative and positive literals', () => {
  // Test with array construction containing negative literals
  const filter = '[-1, 2, -3]'
  const input = null
  const fn = compile(filter)
  const result = fn(input)
  assert.deepEqual(result, [[-1, 2, -3]])
})

test('operations with negative literals', () => {
  // Test addition with negative literal
  const filter = '-5 + 10'
  const input = null
  const fn = compile(filter)
  const result = fn(input)
  assert.deepEqual(result, [5])

  // Test multiplication with negative literal
  const filter2 = '-2 * 3'
  const fn2 = compile(filter2)
  const result2 = fn2(input)
  assert.deepEqual(result2, [-6])
})
