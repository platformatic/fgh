import { test } from 'node:test'
import assert from 'node:assert'
import { FGHParser } from '../src/parser.ts'
import { ParseError } from '../src/types.ts'

test('parser handles identity', () => {
  const parser = new FGHParser('.')
  const ast = parser.parse()
  assert.deepEqual(ast, { type: 'Identity', position: 0 })
})

test('parser handles property access', () => {
  const parser = new FGHParser('.foo')
  const ast = parser.parse()
  assert.deepEqual(ast, {
    type: 'PropertyAccess',
    position: 0,
    property: 'foo'
  })
})

test('parser handles array construction', () => {
  const parser = new FGHParser('[0]')
  const ast = parser.parse()
  assert.deepEqual(ast, {
    elements: [
      {
        position: 1,
        type: 'Literal',
        value: 0
      }
    ],
    position: 0,
    type: 'ArrayConstruction'
  })
})

test('parser handles pipe', () => {
  const parser = new FGHParser('.foo | .bar')
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
  const parser = new FGHParser('.foo?')
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
  const parser = new FGHParser('.foo[0] | .bar.baz?')
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
    () => new FGHParser('@invalid').parse(),
    new ParseError('Unexpected character: @', 0)
  )
})

test.only('parser throws on incomplete input', () => {
  assert.throws(
    () => new FGHParser('[').parse(),
    new ParseError('Expected closing bracket \']\' for array literal', -1)
  )
})

test('parser handles array and string slices', () => {
  // Test explicit start and end
  let parser = new FGHParser('.[2:4]')
  let ast = parser.parse()
  assert.deepEqual(ast, {
    end: 4,
    input: {
      position: 0,
      type: 'Identity'
    },
    position: 1,
    start: 2,
    type: 'Slice'
  })

  // Test implicit start
  parser = new FGHParser('.[:3]')
  ast = parser.parse()
  assert.deepEqual(ast, {
    end: 3,
    input: {
      position: 0,
      type: 'Identity'
    },
    position: 1,
    start: null,
    type: 'Slice'
  })

  // Test negative index and implicit end
  parser = new FGHParser('.[-2:]')
  ast = parser.parse()
  assert.deepEqual(ast, {
    end: null,
    input: {
      position: 0,
      type: 'Identity'
    },
    position: 1,
    start: -2,
    type: 'Slice'
  })
})

test('parser handles plus operator with property and number', () => {
  const parser = new FGHParser('.a + 1')
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
  const parser = new FGHParser('.a + .b')
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
  const parser = new FGHParser('{a: 1} + {b: 2}')
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
