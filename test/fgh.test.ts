import { test } from 'node:test'
import assert from 'node:assert'
import { compile, query } from '../src/fgh.ts'

test('compile creates reusable function', () => {
  const fn = compile('.name')
  assert.deepEqual(fn({ name: 'John' }), ['John'])
  assert.deepEqual(fn({ name: 'Jane' }), ['Jane'])
})

test('query executes one-off expression', () => {
  assert.deepEqual(
    query('.name', { name: 'John' }),
    ['John']
  )
})
