import { test } from 'node:test'
import assert from 'node:assert'
import { parse, format, formatExpression } from '../src/fgh.ts'

test('format function formats AST correctly', () => {
  const ast = parse('.users[] | select(.age > 18) | .name')
  const formatted = format(ast)
  
  assert.strictEqual(formatted, '.users[] | select(.age > 18) | .name')
})

test('formatExpression function parses and formats expression', () => {
  const formatted = formatExpression('.users[]|.name')
  
  assert.strictEqual(formatted, '.users[] | .name')
})

test('pretty printing with format function', () => {
  const ast = parse('{id: .id, values: [.x, .y, .z]}')
  const formatted = format(ast, { pretty: true })
  
  const expected = `{
  id: .id,
  values: [
    .x,
    .y,
    .z
  ]
}`
  
  assert.strictEqual(formatted, expected)
})

test('pretty printing with formatExpression function', () => {
  const formatted = formatExpression('{id: .id, values: [.x, .y, .z]}', { pretty: true })
  
  const expected = `{
  id: .id,
  values: [
    .x,
    .y,
    .z
  ]
}`
  
  assert.strictEqual(formatted, expected)
})

test('custom indentation with format function', () => {
  const ast = parse('{id: .id, values: [.x, .y]}')
  const formatted = format(ast, { pretty: true, indentString: '    ' })
  
  const expected = `{
    id: .id,
    values: [
        .x,
        .y
    ]
}`
  
  assert.strictEqual(formatted, expected)
})
