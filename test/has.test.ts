import { test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

test('has - check if object has a property', () => {
  const data = { foo: 42, bar: null }

  // Check if object has the property "foo"
  assert.deepStrictEqual(
    query('has("foo")', data),
    [true]
  )

  // Check if object has the property "bar" (even though it's null)
  assert.deepStrictEqual(
    query('has("bar")', data),
    [true]
  )

  // Check if object has a non-existent property
  assert.deepStrictEqual(
    query('has("baz")', data),
    [false]
  )
})

test('has - check if array has an element at index', () => {
  const data = [10, 20, 30]

  // Check if array has element at index 0
  assert.deepStrictEqual(
    query('has(0)', data),
    [true]
  )

  // Check if array has element at index 2
  assert.deepStrictEqual(
    query('has(2)', data),
    [true]
  )

  // Check if array has element at index 3 (out of bounds)
  assert.deepStrictEqual(
    query('has(3)', data),
    [false]
  )

  // Check if array has element at negative index (should be false)
  assert.deepStrictEqual(
    query('has(-1)', data),
    [false]
  )
})

test('has - check array of objects with map', () => {
  const data = [
    { foo: 42 },
    {}
  ]

  // Check if each object has the property "foo"
  assert.deepStrictEqual(
    query('map(has("foo"))', data),
    [[true, false]]
  )
})

test('has - check array of arrays with map', () => {
  const data = [
    [0, 1],
    ['a', 'b', 'c']
  ]

  // Check if each array has element at index 2
  assert.deepStrictEqual(
    query('map(has(2))', data),
    [[false, true]]
  )
})

test('has - with dynamic keys', () => {
  const data = {
    user: {
      name: 'Alice',
      age: 30
    },
    property: 'age'
  }
  console.log(JSON.stringify(data))

  // Check if object has the property stored in `.property`
  assert.deepStrictEqual(
    query('has(.property)', data),
    [false] // The root object doesn't have the property "age"
  )

  // Check if object has the property stored in `.property`
  assert.deepStrictEqual(
    query('has(.property)', data),
    [false] // The root object doesn't have the property "age"
  )

  // Check if user object has the property stored in `.property`
  assert.throws(() => {
    query('.user | has(.property)', data)
  })
})

test('has - with number as string', () => {
  const data = [10, 20, 30]

  // Check if array has element at index "2" (as string)
  assert.deepStrictEqual(
    query('has("2")', data),
    [true]
  )

  // Check if array has element at index "3" (as string, out of bounds)
  assert.deepStrictEqual(
    query('has("3")', data),
    [false]
  )
})

test('has - with non-object/array input', () => {
  // Check has on a primitive (should return false)
  assert.deepStrictEqual(
    query('has("length")', 42),
    [false]
  )

  // Check has on null (should return false)
  assert.deepStrictEqual(
    query('has("foo")', null),
    [false]
  )
})
