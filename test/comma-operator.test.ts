// Test for comma operator

import { test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

test('comma operator', async (t) => {
  await t.test('should handle simple comma operator', () => {
    const input = { foo: 42, bar: 'something else', baz: true }
    const result = query('.foo, .bar', input)

    assert.deepStrictEqual(result, [42, 'something else'])
  })

  await t.test('should handle comma operator with array iteration', () => {
    const input = { user: 'stedolan', projects: ['jq', 'wikiflow'] }
    const result = query('.user, .projects[]', input)

    assert.deepStrictEqual(result, ['stedolan', 'jq', 'wikiflow'])
  })

  await t.test('should handle comma operator with array indexes', () => {
    const input = ['a', 'b', 'c', 'd', 'e']
    const result = query('.[4,2]', input)

    assert.deepStrictEqual(result, ['e', 'c'])
  })

  await t.test('should handle comma operator with negative array indexes', () => {
    const input = ['a', 'b', 'c', 'd', 'e']
    const result = query('.[-1,-3]', input)

    assert.deepStrictEqual(result, ['e', 'c'])
  })

  await t.test('should handle comma operator with mixed positive and negative array indexes', () => {
    const input = ['a', 'b', 'c', 'd', 'e']
    const result = query('.[1,-1,0]', input)

    assert.deepStrictEqual(result, ['b', 'e', 'a'])
  })

  await t.test('should handle comma operator with complex expressions', () => {
    const input = {
      users: [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 28 }
      ],
      settings: { theme: 'dark' }
    }
    const result = query('.users[].name, .settings.theme', input)

    assert.deepStrictEqual(result, ['John', 'Jane', 'dark'])
  })

  await t.test('should handle comma operator with pipe', () => {
    const input = {
      items: [
        { id: 1, value: 'first' },
        { id: 2, value: 'second' }
      ]
    }
    const result = query('.items[] | (.id, .value)', input)

    assert.deepStrictEqual(result, [1, 'first', 2, 'second'])
  })

  await t.test('should handle comma operator with array indices on inputs', () => {
    const input = {
      array: ['a', 'b', 'c', 'd', 'e']
    }
    const result = query('.array[0,2,4]', input)

    assert.deepStrictEqual(result, ['a', 'c', 'e'])
  })
})
