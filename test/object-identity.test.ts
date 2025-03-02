import { test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

test('object construction with identity', () => {
  const input = 'bar'
  const result = query('{ "foo": . }', input)
  assert.deepEqual(result, { foo: 'bar' })
})

test('object construction with identity and multiple properties', () => {
  const input = 42
  const result = query('{ "answer": ., "question": "life" }', input)
  assert.deepEqual(result, { answer: 42, question: 'life' })
})

test('object construction with identity for array input', () => {
  const input = [1, 2, 3]
  const result = query('{ "numbers": . }', input)
  assert.deepEqual(result, { numbers: [1, 2, 3] })
})

test('object construction with identity for object input', () => {
  const input = { name: 'John', age: 30 }
  const result = query('{ "user": . }', input)
  assert.deepEqual(result, { user: { name: 'John', age: 30 } })
})

test('object construction with identity for null input', () => {
  const input = null
  const result = query('{ "value": . }', input)
  assert.deepEqual(result, { value: null })
})
