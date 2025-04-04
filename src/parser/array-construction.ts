import { ParseError } from '../types.ts'
import type { ASTNode, Parser, TokenType } from '../types.ts'
import { parsePipe } from './expression.ts'

export function parseArrayConstruction (parser: Parser): ASTNode {
  const pos = parser.basePos === 0 ? parser.currentToken.position : parser.basePos
  parser.expect('[') // Consume [

  const elements: ASTNode[] = []

  // Parse array elements until we hit closing bracket
  while (parser.currentToken && parser.currentToken.type !== ']' as TokenType) {
    // Use parseExpression instead of parseChain to handle complex expressions with pipes
    const node = parsePipe(parser)
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
