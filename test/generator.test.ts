import { test } from 'node:test'
import assert from 'node:assert'
import { JQParser } from '../src/parser.ts'
import { JQCodeGenerator } from '../src/generator.ts'

test('generates identity function', () => {
  const parser = new JQParser('.')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.equal(fn(5), 5)
  assert.deepEqual(fn({ a: 1 }), { a: 1 })
})

test('generates property access', () => {
  const parser = new JQParser('.foo')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.equal(fn({ foo: 'bar' }), 'bar')
  assert.equal(fn({ bar: 'baz' }), undefined)
  assert.deepEqual(
    fn([{ foo: 1 }, { foo: 2 }]),
    [1, 2]
  )
})

test('generates array access', () => {
  const parser = new JQParser('[0]')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.equal(fn(['a', 'b']), 'a')
  assert.deepEqual(
    fn([['a'], ['b']]),
    ['a', 'b']
  )
})

test('generates wildcard', () => {
  const parser = new JQParser('.*')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.deepEqual(
    fn({ a: 1, b: 2 }),
    [1, 2]
  )
  assert.deepEqual(
    fn([{ a: 1 }, { b: 2 }]),
    [1, 2]
  )
})

test('generates pipe', () => {
  const parser = new JQParser('.foo | .bar')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.equal(
    fn({ foo: { bar: 'baz' } }),
    'baz'
  )
})

test('generates optional access', () => {
  const parser = new JQParser('.foo?')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.equal(fn(null), null)
  assert.equal(fn({ foo: 'bar' }), 'bar')
})

test('generates complex expressions', () => {
  const parser = new JQParser('.foo[0] | .bar?')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.equal(
    fn({ foo: [{ bar: 'baz' }] }),
    'baz'
  )
  assert.equal(
    fn({ foo: [{}] }),
    undefined
  )
})

test.skip('generates complex expressions with wildcard', () => {
  const parser = new JQParser('.foo[0] | .*')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())

  assert.deepEqual(
    fn({ foo: [{ a: 1 }, { a: 2 }] }),
    [1, 2]
  )
  assert.deepEqual(
    fn({ foo: [{}] }),
    []
  )
})

test.skip('generate the example from the README', () => {
  const parser = new JQParser('.users.* | .name.first')
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

test.skip('generate the example from the README', () => {
  const parser = new JQParser('.users[0].name.last')
  const generator = new JQCodeGenerator()
  const fn = generator.generate(parser.parse())
  const data = {
    users: [
      { name: { first: 'John', last: 'Doe' }, age: 30 },
      { name: { first: 'Jane', last: 'Smith' }, age: 25 }
    ]
  }

  assert.deepEqual(fn(data), 'Doe')
})
