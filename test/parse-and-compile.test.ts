import { test } from 'node:test'
import assert from 'node:assert'
import { parse, compileFromAST, compile } from '../src/fgh.ts'
import type { ASTNode } from '../src/types.ts'

test('parse generates the correct AST', () => {
  // Test basic property access
  const ast = parse('.name')
  assert.deepEqual(ast, {
    type: 'PropertyAccess',
    position: 0,
    property: 'name'
  })

  // Test more complex expression
  const complexAst = parse('.users[0].name')
  assert.deepEqual(complexAst, {
    type: 'PropertyAccess',
    position: 0,
    property: 'name',
    input: {
      type: 'IndexAccess',
      position: 6,
      index: 0,
      input: {
        type: 'PropertyAccess',
        position: 0,
        property: 'users'
      }
    }
  })
})

test('compileFromAST generates correct function from AST', () => {
  // First create an AST
  const ast = parse('.name')

  // Compile function from AST
  const fn = compileFromAST(ast)

  // Test the compiled function
  assert.deepEqual(fn({ name: 'John' }), ['John'])
  assert.deepEqual(fn({ name: 'Jane' }), ['Jane'])
})

test('compileFromAST and compile produce equivalent functions', () => {
  const expression = '.users[] | select(.age > 30) | .name'

  // Create function directly via compile
  const fn1 = compile(expression)

  // Create function via parse + compileFromAST
  const ast = parse(expression)
  const fn2 = compileFromAST(ast)

  // Test with some sample data
  const data = {
    users: [
      { name: 'John', age: 35 },
      { name: 'Jane', age: 25 },
      { name: 'Bob', age: 40 }
    ]
  }

  // Both functions should produce the same result
  assert.deepEqual(fn1(data), fn2(data))
})

test('compileFromAST works with manually constructed AST', () => {
  // Manually create an AST for '.name.first'
  const manualAst: ASTNode = {
    type: 'PropertyAccess',
    position: 5,
    property: 'first',
    input: {
      type: 'PropertyAccess',
      position: 0,
      property: 'name'
    }
  }

  // Compile function from manually created AST
  const fn = compileFromAST(manualAst)

  // Test the function
  assert.deepEqual(fn({ name: { first: 'John', last: 'Doe' } }), ['John'])
})

test('parse + compileFromAST workflow for complex queries', () => {
  // Create a more complex query
  const expression = '.people[] | select(.age >= 18) | { name: .name, isAdult: true }'

  // Parse to get the AST
  const ast = parse(expression)

  // Compile from the AST
  const fn = compileFromAST(ast)

  // Test with sample data
  const data = {
    people: [
      { name: 'John', age: 25 },
      { name: 'Jane', age: 17 },
      { name: 'Mike', age: 30 }
    ]
  }

  // Check the result
  assert.deepEqual(fn(data), [
    { name: 'John', isAdult: true },
    { name: 'Mike', isAdult: true }
  ])
})
