import type { ASTNode, Parser } from './types.ts'
import { parseComparison } from './comparison.ts'
import { parseDefault } from './default.ts'

export function parseLogical (parser: Parser): ASTNode {
  const startPos = parser.currentToken?.position ?? 0
  let left = parseDefault(parser)

  // Handle logical operators (and, or)
  while (parser.currentToken && (
    parser.currentToken.type === 'AND' as TokenType ||
    parser.currentToken.type === 'OR' as TokenType
  )) {
    const operator = parser.currentToken.type
    parser.advance() // Consume the operator

    // Parse the right side
    const right = parseComparison(parser)

    // Create the appropriate logical node
    switch (operator) {
      case 'AND' as TokenType:
        left = {
          type: 'And',
          position: startPos,
          left,
          right
        }
        break
      case 'OR' as TokenType:
        left = {
          type: 'Or',
          position: startPos,
          left,
          right
        }
        break
    }
  }

  return left
}
