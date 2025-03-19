import { ParseError } from '../types.ts'
import type { ASTNode, Parser } from '../types.ts'
import { parseExpression } from './expression.ts'
import { parseChain } from './chain.ts'

export function parseObjectConstruction (parser: Parser): ASTNode {
  if (!parser.currentToken || parser.currentToken.type !== '{') {
    throw new ParseError('Expected {', parser.currentToken?.position ?? -1)
  }

  const pos = parser.basePos === 0 ? parser.currentToken.position : parser.basePos
  parser.advance() // Consume {

  const fields: any[] = []

  // Parse object fields until we hit closing brace
  while (parser.currentToken && parser.currentToken.type !== '}' as TokenType) {
    // Parse a field
    const fieldPos = parser.currentToken.position

    let key: string | ASTNode
    let isDynamic = false

    // Handle dynamic key: {(.user): .titles}
    if (parser.currentToken.type === '(' as TokenType) {
      parser.advance() // Consume (
      key = parseExpression(parser)
      isDynamic = true
      parser.expect(')') // Expect closing parenthesis
    } else if (parser.currentToken.type === 'STRING' as TokenType) {
      // String literal key: { "foo": . }
      key = parser.currentToken.value
      parser.advance()
    } else {
      // Regular identifier key
      if (parser.currentToken.type !== 'IDENT' as TokenType) {
        throw new ParseError(
            `Expected identifier, string literal, or dynamic key, got ${parser.currentToken.type}`,
            parser.currentToken.position
        )
      }
      key = parser.currentToken.value
      parser.advance()
    }

    let value: ASTNode

    // If we have a colon, parse the value expression
    if (parser.currentToken && parser.currentToken.type === ':' as TokenType) {
      parser.advance() // Consume :

      // If the value is a parenthesized expression, use parseExpression
      if (parser.currentToken && parser.currentToken.type === '(' as TokenType) {
        parser.advance() // Consume (
        value = parseExpression(parser) // Handle complex expressions
        parser.expect(')') // Expect closing parenthesis
      } else {
        value = parseChain(parser) // Use parseChain for non-parenthesized
      }
    } else {
      // Handle shorthand syntax: { user } -> { user: .user }
      if (typeof key === 'string') {
        value = {
          type: 'PropertyAccess',
          position: fieldPos,
          property: key
        }
      } else {
        throw new ParseError(
          'Expected : after dynamic key',
          parser.currentToken?.position ?? -1
        )
      }
    }

    // Add the field to our list
    fields.push({
      type: 'ObjectField',
      position: fieldPos,
      key,
      value,
      isDynamic
    })

    // If next token is a comma, consume it
    if (parser.currentToken && parser.currentToken.type === ',' as TokenType) {
      parser.advance()
    }
  }

  // Consume the closing brace
  parser.expect('}')

  return {
    type: 'ObjectConstruction',
    position: pos,
    fields
  }
}
