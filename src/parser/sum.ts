import type { ASTNode, Parser, TokenType } from '../types.ts'
import { parseProduct } from './product.ts'

export function parseSum (parser: Parser): ASTNode {
  const startPos = parser.currentToken?.position ?? 0
  let left = parseProduct(parser) // Changed from parseChain to parseProduct

  // Handle the plus or minus operators (potentially multiple in a chain)
  while (parser.currentToken && (parser.currentToken.type === '+' || parser.currentToken.type === '-')) {
    const operator = parser.currentToken.type
    parser.advance() // Consume the operator

    const right = parseProduct(parser)

    left = {
      type: operator === '+' as TokenType ? 'Sum' : 'Difference',
      position: startPos,
      left,
      right
    }
  }

  return left
}
