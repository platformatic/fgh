import type { ASTNode, Parser } from './types.ts'
import { parseComparison } from './comparison.ts'

export function parseDefault (parser: Parser): ASTNode {
  const startPos = parser.currentToken?.position ?? 0
  let left = parseComparison(parser)

  // Handle default operator (//)
  if (parser.currentToken && parser.currentToken.type === '//' as TokenType) {
    parser.advance() // Consume the '//' operator
    const right = parseComparison(parser)

    left = {
      type: 'Default',
      position: startPos,
      left,
      right
    }
  }

  return left
}
