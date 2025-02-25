import { test } from 'node:test'
import assert from 'node:assert'
import { JQParser } from '../src/parser.ts'
import { ParseError } from '../src/types.ts'

test('parser handles identity', () => {
  const parser = new JQParser('.')
  const ast = parser.parse()
  assert.deepEqual(ast, { type: 'Identity', position: 0 })
})

test('parser handles property access', () => {
  const parser = new JQParser('.foo')
  const ast = parser.parse()
  assert.deepEqual(ast, {
    type: 'PropertyAccess',
    position: 0,
    property: 'foo'
  })
})

test('parser handles array access', () => {
  const parser = new JQParser('[0]')
  const ast = parser.parse()
  assert.deepEqual(ast, {
    type: 'IndexAccess',
    position: 0,
    index: 0
  })
})

test('parser handles pipe', () => {
  const parser = new JQParser('.foo | .bar')
  const ast = parser.parse()
  assert.deepEqual(ast, {
    type: 'Pipe',
    position: 0,
    left: {
      type: 'PropertyAccess',
      position: 0,
      property: 'foo'
    },
    right: {
      type: 'PropertyAccess',
      position: 7,
      property: 'bar'
    }
  })
})

test('parser handles optional', () => {
  const parser = new JQParser('.foo?')
  const ast = parser.parse()
  assert.deepEqual(ast, {
    type: 'Optional',
    position: 0,
    expression: {
      type: 'PropertyAccess',
      position: 0,
      property: 'foo'
    }
  })
})

test('parser handles complex expressions', () => {
  const parser = new JQParser('.foo[0] | .bar.baz?')
  const ast = parser.parse()
  assert.deepEqual(ast, {
    type: 'Pipe',
    position: 0,
    left: {
      type: 'IndexAccess',
      position: 4,
      index: 0,
      input: {
        type: 'PropertyAccess',
        position: 0,
        property: 'foo'
      }
    },
    right: {
      type: 'Optional',
      position: 7,
      expression: {
        type: 'PropertyAccess',
        position: 7,
        property: 'baz',
        input: {
          type: 'PropertyAccess',
          position: 7,
          property: 'bar'
        }
      }
    }
  })
})

test('parser throws on invalid input', () => {
  assert.throws(
    () => new JQParser('@invalid').parse(),
    ParseError
  )
})

test('parser throws on incomplete input', () => {
  assert.throws(
    () => new JQParser('[').parse(),
    ParseError
  )
})

test('parser handles array and string slices', () => {
  // Test explicit start and end
  let parser = new JQParser('.[2:4]')
  let ast = parser.parse()
  assert.deepEqual(ast, {
    type: 'Slice',
    position: 1,
    start: 2,
    end: 4
  })

  // Test implicit start
  parser = new JQParser('.[:3]')
  ast = parser.parse()
  assert.deepEqual(ast, {
    type: 'Slice',
    position: 1,
    start: null,
    end: 3
  })

  // Test negative index and implicit end
  parser = new JQParser('.[-2:]')
  ast = parser.parse()
  assert.deepEqual(ast, {
    type: 'Slice',
    position: 1,
    start: -2,
    end: null
  })
})

test('parser handles plus operator with property and number', () => {
  const parser = new JQParser('.a + 1')
  const ast = parser.parse()
  assert.deepEqual(ast, {
    type: 'Sum',
    position: 0,
    left: {
      type: 'PropertyAccess',
      position: 0,
      property: 'a'
    },
    right: {
      type: 'Literal',
      position: 5,
      value: 1
    }
  })
})

test('parser handles plus operator with properties', () => {
  const parser = new JQParser('.a + .b')
  const ast = parser.parse()
  assert.deepEqual(ast, {
    type: 'Sum',
    position: 0,
    left: {
      type: 'PropertyAccess',
      position: 0,
      property: 'a'
    },
    right: {
      type: 'PropertyAccess',
      position: 5,
      property: 'b'
    }
  })
})

test('parser handles plus operator with objects', () => {
  const parser = new JQParser('{a: 1} + {b: 2}')
  const ast = parser.parse()
  // First check the structure is correct
  assert.equal(ast.type, 'Sum')
  assert.equal(ast.left.type, 'ObjectConstruction')
  assert.equal(ast.right.type, 'ObjectConstruction')
  assert.equal(ast.left.fields[0].key, 'a')
  assert.equal(ast.left.fields[0].value.value, 1)
  assert.equal(ast.right.fields[0].key, 'b')
  assert.equal(ast.right.fields[0].value.value, 2)
})
