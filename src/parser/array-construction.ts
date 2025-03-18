import { ParseError } from '../types.ts'
import type { ASTNode, Parser } from '../types.ts'
import { parseChain } from './chain.ts'

export function parseArrayConstruction (parser: Parser): ASTNode {
  if (!parser.currentToken || parser.currentToken.type !== '[') {
    throw new ParseError('Expected [', parser.currentToken?.position ?? -1)
  }

  const pos = parser.basePos === 0 ? parser.currentToken.position : parser.basePos
  parser.advance() // Consume [

  const elements: ASTNode[] = []

  // Handle empty array case
  if (parser.currentToken && parser.currentToken.type === ']' as TokenType) {
    parser.advance() // Consume ]
    return {
      type: 'ArrayConstruction',
      position: pos,
      elements
    }
  }

  // Parse array elements until we hit closing bracket
  while (parser.currentToken && parser.currentToken.type !== ']' as TokenType) {
    const node = parseChain(parser)
    elements.push(node)

    // If next token is a comma, consume it
    if (parser.currentToken?.type === ',' as TokenType) {
      parser.advance()
    } else if (parser.currentToken?.type !== ']' as TokenType) {
      throw new ParseError(
        `Expected comma or closing bracket, got ${parser.currentToken?.type ?? 'EOF'}`,
        parser.currentToken?.position ?? -1
      )
    }
  }

  // Consume the closing bracket
  parser.expect(']')

  return {
    type: 'ArrayConstruction',
    position: pos,
    elements
  }
}
