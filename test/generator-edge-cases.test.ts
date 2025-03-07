import { test } from 'node:test'
import assert from 'node:assert'
import { JQCodeGenerator } from '../src/generator.ts'

test('generator handles nested dynamic key in object construction', () => {
  const ast = {
    type: 'ObjectConstruction',
    position: 0,
    fields: [
      {
        type: 'ObjectField',
        position: 1,
        key: {
          type: 'PropertyAccess',
          position: 2,
          property: 'keyName'
        },
        value: {
          type: 'Literal',
          position: 8,
          value: 'value'
        },
        isDynamic: true
      }
    ]
  }
  
  const generator = new JQCodeGenerator()
  const fn = generator.generate(ast)
  
  // Test the function with an object that has a keyName property
  const result = fn({ keyName: 'dynamicKey' })
  
  // The result should have the dynamicKey property with 'value' as its value
  assert.deepStrictEqual(result, [{ dynamicKey: 'value' }])
})

test('generator handles complex nesting of expressions', () => {
  // Create a complex AST with multiple levels of nesting
  const ast = {
    type: 'Pipe',
    position: 0,
    left: {
      type: 'PropertyAccess',
      position: 0,
      property: 'items'
    },
    right: {
      type: 'MapFilter',
      position: 8,
      filter: {
        type: 'ObjectConstruction',
        position: 12,
        fields: [
          {
            type: 'ObjectField',
            position: 13,
            key: 'name',
            value: {
              type: 'PropertyAccess',
              position: 19,
              property: 'name'
            },
            isDynamic: false
          },
          {
            type: 'ObjectField',
            position: 25,
            key: 'value',
            value: {
              type: 'Sum',
              position: 32,
              left: {
                type: 'PropertyAccess',
                position: 32,
                property: 'value'
              },
              right: {
                type: 'Literal',
                position: 40,
                value: 10
              }
            },
            isDynamic: false
          }
        ]
      }
    }
  }
  
  const generator = new JQCodeGenerator()
  const fn = generator.generate(ast)
  
  // Test the function with sample data
  const result = fn({
    items: [
      { name: 'item1', value: 5 },
      { name: 'item2', value: 15 }
    ]
  })
  
  // Check if the result matches what we expect - the actual result includes an array wrapper
  assert.deepStrictEqual(result, [
    [
      { name: 'item1', value: 15 },
      { name: 'item2', value: 25 }
    ]
  ])
})

test('generator handles various expression types', () => {
  // Test different expression types to increase coverage
  
  // 1. Test Empty AST node
  let ast = {
    type: 'Empty',
    position: 0
  }
  
  let generator = new JQCodeGenerator()
  let fn = generator.generate(ast)
  
  // Empty should return an empty array for any input
  assert.deepStrictEqual(fn({ data: 'value' }), [])
  
  // 2. Test Not AST node
  ast = {
    type: 'Not',
    position: 0,
    expression: {
      type: 'Literal',
      position: 5,
      value: true
    }
  }
  
  generator = new JQCodeGenerator()
  fn = generator.generate(ast)
  
  // Not true should return false
  assert.deepStrictEqual(fn({}), [false])
  
  // 3. Test Modulo AST node
  ast = {
    type: 'Modulo',
    position: 0,
    left: {
      type: 'Literal',
      position: 0,
      value: 10
    },
    right: {
      type: 'Literal',
      position: 3,
      value: 3
    }
  }
  
  generator = new JQCodeGenerator()
  fn = generator.generate(ast)
  
  // 10 % 3 should return 1
  assert.deepStrictEqual(fn({}), [1])
})

test('generator handles sort and sort_by expressions', () => {
  // Test sort
  let ast = {
    type: 'Sort',
    position: 0
  }
  
  let generator = new JQCodeGenerator()
  let fn = generator.generate(ast)
  
  // Sort should order the array
  assert.deepStrictEqual(fn([3, 1, 2]), [[1, 2, 3]])
  
  // Test sort_by with paths
  ast = {
    type: 'SortBy',
    position: 0,
    paths: [
      {
        type: 'PropertyAccess',
        position: 8,
        property: 'age'
      }
    ]
  }
  
  generator = new JQCodeGenerator()
  fn = generator.generate(ast)
  
  // Sort_by should order by the specified property
  const result = fn([
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 35 }
  ])
  
  assert.deepStrictEqual(result, [[
    { name: 'Bob', age: 25 },
    { name: 'Alice', age: 30 },
    { name: 'Charlie', age: 35 }
  ]])
})
