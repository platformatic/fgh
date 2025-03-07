import { test } from 'node:test'
import assert from 'node:assert'
import { JQParser } from '../src/parser.ts'
import { JQCodeGenerator } from '../src/generator.ts'

test('generates identity function', () => {
  const parser = new JQParser('.')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.deepEqual(fn(5), [5])
  assert.deepEqual(fn({ a: 1 }), [{ a: 1 }])
})

test('generates property access', () => {
  const parser = new JQParser('.foo')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.deepEqual(fn({ foo: 'bar' }), ['bar'])
  assert.deepEqual(fn({ bar: 'baz' }), [undefined])
  assert.throws(
    () => fn([{ foo: 1 }, { foo: 2 }])
  )
})

test('generates array access', () => {
  const parser = new JQParser('[0]')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  const result = fn(['a', 'b'])
  assert.deepStrictEqual(result, [[0]], 'First element should be "a"')
})

test('generates pipe', () => {
  const parser = new JQParser('.foo | .bar')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.deepEqual(
    fn({ foo: { bar: 'baz' } }),
    ['baz']
  )
})

test('generates optional access', () => {
  const parser = new JQParser('.foo?')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.deepEqual(fn(null), [])
  assert.deepEqual(fn({ foo: 'bar' }), ['bar'])
})

test('generates nested optional access', () => {
  const parser = new JQParser('.foo.bar?')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  // assert.deepEqual(fn(null), [])
  assert.deepEqual(fn({ foo: { bar: 'baz' } }), ['baz'])
})

test('generates complex expressions', () => {
  const parser = new JQParser('.foo[0] | .bar?')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.deepEqual(
    fn({ foo: [{ bar: 'baz' }] }),
    ['baz']
  )
  assert.deepEqual(
    fn({ foo: [{}] }),
    []
  )
})

test('generate the example from the README', () => {
  const parser = new JQParser('.users[] | .name.first')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())
  const data = {
    users: [
      { name: { first: 'John', last: 'Doe' }, age: 30 },
      { name: { first: 'Jane', last: 'Smith' }, age: 25 }
    ]
  }

  assert.deepEqual(fn(data), ['John', 'Jane'])
})

test('generate the example from the README', () => {
  const parser = new JQParser('.users[0].name.last')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())
  const data = {
    users: [
      { name: { first: 'John', last: 'Doe' }, age: 30 },
      { name: { first: 'Jane', last: 'Smith' }, age: 25 }
    ]
  }

  assert.deepEqual(fn(data), ['Doe'])
})

test('generates array and string slices', () => {
  // Test slice with explicit start and end on array
  let parser = new JQParser('.[2:4]')
  let generator = new JQCodeGenerator()
  let fn = generator.generate(parser.parse())
  assert.deepEqual(fn(['a', 'b', 'c', 'd', 'e']), [['c', 'd']])

  // Test slice with explicit start and end on string
  parser = new JQParser('.[2:4]')
  generator = new JQCodeGenerator()
  fn = generator.generate(parser.parse())
  assert.deepEqual(fn('abcdefghi'), ['cd'])

  // Test slice with implicit start on array
  parser = new JQParser('.[:3]')
  generator = new JQCodeGenerator()
  fn = generator.generate(parser.parse())
  assert.deepEqual(fn(['a', 'b', 'c', 'd', 'e']), [['a', 'b', 'c']])

  // Test slice with negative start and implicit end on array
  parser = new JQParser('.[-2:]')
  generator = new JQCodeGenerator()
  fn = generator.generate(parser.parse())
  assert.deepEqual(fn(['a', 'b', 'c', 'd', 'e']), [['d', 'e']])
})

test('.[] outputs all the values', () => {
  const parser = new JQParser('.[]')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.deepEqual(fn({ a: 1, b: 2 }), [1, 2])
})

test('generates plus operator with numeric values', () => {
  const parser = new JQParser('.a + 1')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.deepEqual(fn({ a: 7 }), [8])
  assert.deepEqual(fn({}), [1]) // When .a is undefined, the result should be 1
})

test('generates plus operator with arrays', () => {
  const parser = new JQParser('.a + .b')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.deepEqual(fn({ a: [1, 2], b: [3, 4] }), [[1, 2, 3, 4]])
})

test('generates plus operator with null values', () => {
  // Test with property + literal null
  const parser = new JQParser('.a + null')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.deepEqual(fn({ a: 1 }), [1])
})

test('generates plus operator with objects', () => {
  const parser = new JQParser('{a: 1} + {b: 2}')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.deepEqual(fn(null), [{ a: 1, b: 2 }])
})
