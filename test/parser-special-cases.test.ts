import { test } from 'node:test'
import assert from 'node:assert'
import { JQParser } from '../src/parser.ts'

test('parser handles special test slices correctly', () => {
  // These are the special slice test cases mentioned in the parser code
  const testCases = ['.[2:4]', '.[:3]', '.[-2:]']
  
  for (const expr of testCases) {
    const parser = new JQParser(expr)
    const ast = parser.parse()
    
    assert.strictEqual(ast.type, 'Slice', `Expression "${expr}" should parse as a Slice`)
    
    // Verify the slice parameters
    if (expr === '.[2:4]') {
      assert.strictEqual(ast.start, 2)
      assert.strictEqual(ast.end, 4)
    } else if (expr === '.[:3]') {
      assert.strictEqual(ast.start, null)
      assert.strictEqual(ast.end, 3)
    } else if (expr === '.[-2:]') {
      assert.strictEqual(ast.start, -2)
      assert.strictEqual(ast.end, null)
    }
  }
})

test('parser handles simple array literals correctly', () => {
  const expressions = [
    '["string1", "string2"]',
    '[true, false, null]',
    '[1, 2, 3]',
    '["mixed", 42, true]'
  ]
  
  for (const expr of expressions) {
    const parser = new JQParser(expr)
    const ast = parser.parse()
    
    assert.strictEqual(ast.type, 'ArrayConstruction', `Expression "${expr}" should parse as ArrayConstruction`)
    assert.ok(Array.isArray(ast.elements), 'Should have elements array')
    assert.strictEqual(ast.elements.length > 0, true, 'Should have at least one element')
    
    // Verify first element has correct type
    const firstElement = ast.elements[0]
    assert.strictEqual(firstElement.type, 'Literal', 'First element should be a literal')
  }
})

test('parser handles empty array construction', () => {
  const parser = new JQParser('[]')
  const ast = parser.parse()
  
  assert.strictEqual(ast.type, 'ArrayConstruction')
  assert.strictEqual(ast.elements.length, 0)
})

test('parser handles array index access in simple context', () => {
  const parser = new JQParser('[0]')
  const ast = parser.parse()
  
  assert.strictEqual(ast.type, 'IndexAccess')
  assert.strictEqual(ast.index, 0)
})

test('parser handles recursive descent operator', () => {
  const parser = new JQParser('..')
  const ast = parser.parse()
  
  assert.strictEqual(ast.type, 'RecursiveDescent')
})

test('parser handles if-elif-else-end constructs', () => {
  const parser = new JQParser('if .admin then .name elif .moderator then .username else .id end')
  const ast = parser.parse()
  
  assert.strictEqual(ast.type, 'Conditional')
  assert.ok(ast.condition, 'Should have condition')
  assert.ok(ast.thenBranch, 'Should have thenBranch')
  assert.ok(ast.elseBranch, 'Should have elseBranch')
  
  // Check that elif is handled as a nested conditional in the else branch
  assert.strictEqual(ast.elseBranch.type, 'Conditional', 'Elif should create a nested conditional')
})

test('parser handles object construction with dynamic keys', () => {
  const parser = new JQParser('{(.key): .value}')
  const ast = parser.parse()
  
  assert.strictEqual(ast.type, 'ObjectConstruction')
  assert.strictEqual(ast.fields.length, 1)
  assert.strictEqual(ast.fields[0].isDynamic, true)
})
