import { test } from 'node:test'
import assert from 'node:assert'
import { JQParser } from '../src/parser.ts'

test('parser handles simple object construction', () => {
  const parser = new JQParser('{ user, name }')
  const ast = parser.parse()

  assert.deepEqual(ast, {
    type: 'ObjectConstruction',
    position: 0,
    fields: [
      {
        type: 'ObjectField',
        position: 2,
        key: 'user',
        value: {
          type: 'PropertyAccess',
          position: 2,
          property: 'user'
        },
        isDynamic: false
      },
      {
        type: 'ObjectField',
        position: 8,
        key: 'name',
        value: {
          type: 'PropertyAccess',
          position: 8,
          property: 'name'
        },
        isDynamic: false
      }
    ]
  })
})

test('parser handles object construction with explicit values', () => {
  const parser = new JQParser('{ user: .name, count: .items[] }')
  const ast = parser.parse()

  assert.deepEqual(ast, {
    type: 'ObjectConstruction',
    position: 0,
    fields: [
      {
        type: 'ObjectField',
        position: 2,
        key: 'user',
        value: {
          type: 'PropertyAccess',
          position: 8,
          property: 'name'
        },
        isDynamic: false
      },
      {
        type: 'ObjectField',
        position: 15,
        key: 'count',
        value: {
          type: 'ArrayIteration',
          position: 28,
          input: {
            type: 'PropertyAccess',
            position: 22,
            property: 'items'
          }
        },
        isDynamic: false
      }
    ]
  })
})

test('parser handles object construction with dynamic keys', () => {
  const parser = new JQParser('{(.user): .titles}')
  const ast = parser.parse()

  assert.deepEqual(ast, {
    type: 'ObjectConstruction',
    position: 0,
    fields: [
      {
        type: 'ObjectField',
        position: 1,
        key: {
          type: 'PropertyAccess',
          position: 2,
          property: 'user'
        },
        value: {
          type: 'PropertyAccess',
          position: 10,
          property: 'titles'
        },
        isDynamic: true
      }
    ]
  })
})

test('parser handles object construction within a pipe', () => {
  const parser = new JQParser('.data | { name: .user.name, age: .user.age }')
  const ast = parser.parse()

  // Extract the fields part for easier comparison
  const rightFields = ast.right.fields

  // Only verify the structure, not the exact position values
  assert.strictEqual(ast.type, 'Pipe')
  assert.strictEqual(ast.left.type, 'PropertyAccess')
  assert.strictEqual(ast.left.property, 'data')
  assert.strictEqual(ast.right.type, 'ObjectConstruction')

  // Check fields
  assert.strictEqual(rightFields.length, 2)
  assert.strictEqual(rightFields[0].type, 'ObjectField')
  assert.strictEqual(rightFields[0].key, 'name')
  assert.strictEqual(rightFields[0].isDynamic, false)
  assert.strictEqual(rightFields[1].type, 'ObjectField')
  assert.strictEqual(rightFields[1].key, 'age')
  assert.strictEqual(rightFields[1].isDynamic, false)

  // Check field values
  assert.strictEqual(rightFields[0].value.type, 'PropertyAccess')
  assert.strictEqual(rightFields[0].value.property, 'name')
  assert.strictEqual(rightFields[0].value.input.type, 'PropertyAccess')
  assert.strictEqual(rightFields[0].value.input.property, 'user')

  assert.strictEqual(rightFields[1].value.type, 'PropertyAccess')
  assert.strictEqual(rightFields[1].value.property, 'age')
  assert.strictEqual(rightFields[1].value.input.type, 'PropertyAccess')
  assert.strictEqual(rightFields[1].value.input.property, 'user')
})
