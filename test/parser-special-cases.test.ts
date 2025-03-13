import { test } from 'node:test'
import assert from 'node:assert'
import { FGHParser } from '../src/parser.ts'

test('parser handles simple array literals correctly', () => {
  const expressions = [
    '["string1", "string2"]',
    '[true, false, null]',
    '[1, 2, 3]',
    '["mixed", 42, true]'
  ]

  for (const expr of expressions) {
    const parser = new FGHParser(expr)
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
  const parser = new FGHParser('[]')
  const ast = parser.parse()

  assert.strictEqual(ast.type, 'ArrayConstruction')
  assert.strictEqual(ast.elements.length, 0)
})

test('parser handles recursive descent operator', () => {
  const parser = new FGHParser('..')
  const ast = parser.parse()

  assert.strictEqual(ast.type, 'RecursiveDescent')
})

test('parser handles if-elif-else-end constructs', () => {
  const parser = new FGHParser('if .admin then .name elif .moderator then .username else .id end')
  const ast = parser.parse()

  assert.strictEqual(ast.type, 'Conditional')
  assert.ok(ast.condition, 'Should have condition')
  assert.ok(ast.thenBranch, 'Should have thenBranch')
  assert.ok(ast.elseBranch, 'Should have elseBranch')

  // Check that elif is handled as a nested conditional in the else branch
  assert.strictEqual(ast.elseBranch.type, 'Conditional', 'Elif should create a nested conditional')
})

test('parser handles object construction with dynamic keys', () => {
  const parser = new FGHParser('{(.key): .value}')
  const ast = parser.parse()

  assert.strictEqual(ast.type, 'ObjectConstruction')
  assert.strictEqual(ast.fields.length, 1)
  assert.strictEqual(ast.fields[0].isDynamic, true)
})
