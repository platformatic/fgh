import { test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

test('object construction with static fields', () => {
  const input = { user: 'stedolan', name: 'John', age: 30 }
  const result = query('{ user, name }', input)
  assert.deepEqual(result, [{ user: 'stedolan', name: 'John' }])
})

test('object construction with property access', () => {
  const input = { user: 'stedolan', profile: { name: 'John', age: 30 } }
  const result = query('{ user, name: .profile.name }', input)
  assert.deepEqual(result, [{ user: 'stedolan', name: 'John' }])
})

test('object construction with array expansion', () => {
  const input = { user: 'stedolan', titles: ['JQ Primer', 'More JQ'] }
  const result = query('{ user, title: .titles[] }', input)
  assert.deepEqual(result, [
    [
      { user: 'stedolan', title: 'JQ Primer' },
      { user: 'stedolan', title: 'More JQ' }
    ]
  ])
})

test('object construction with dynamic keys', () => {
  const input = { user: 'stedolan', titles: ['JQ Primer', 'More JQ'] }
  const result = query('{(.user): .titles}', input)
  assert.deepEqual(result, [{ stedolan: ['JQ Primer', 'More JQ'] }])
})

test.only('complex object construction', () => {
  const input = {
    users: [
      { id: 1, name: 'Alice', roles: ['admin', 'user'] },
      { id: 2, name: 'Bob', roles: ['user'] }
    ]
  }

  const result = query('.users[] | { id, name, role: .roles[] }', input)

  assert.deepEqual(result, [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 1, name: 'Alice', role: 'user' },
    { id: 2, name: 'Bob', role: 'user' }
  ])
})
