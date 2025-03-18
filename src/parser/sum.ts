import type { ASTNode, Parser } from './types.ts'
import { parseSimpleArrayLiteral } from './array-literal.ts'
import { parseProduct } from './product.ts'
import { parseChain } from './chain.ts'

export function parseSum (parser: Parser): ASTNode {
  const startPos = parser.currentToken?.position ?? 0
  let left = parseProduct(parser) // Changed from parseChain to parseProduct

  // Handle the plus or minus operators (potentially multiple in a chain)
  while (parser.currentToken && (parser.currentToken.type === '+' || parser.currentToken.type === '-')) {
    const operator = parser.currentToken.type
    parser.advance() // Consume the operator

    // Special case for array literals after minus operator
    if (operator === '-' as TokenType && parser.currentToken?.type === '[' as TokenType) {
      // Check if the next token is a STRING, suggesting a string array literal
      const nextToken = parser.peekAhead(1)

      // If we see a string token, use the simple array literal parser
      if (nextToken?.type === 'STRING' as TokenType) {
        try {
          const right = parseSimpleArrayLiteral(parser)
          left = {
            type: 'Difference',
            position: startPos,
            left,
            right
          }
          continue // Continue to the next operator
        } catch (e) {
          // If parsing as a simple array literal fails, try the normal approach
          console.error('Failed to parse as simple array literal:', e)
        }
      }
    }

    // Normal handling for other cases
    const right = parseProduct(parser) // Changed from parseChain to parseProduct

    left = {
      type: operator === '+' as TokenType ? 'Sum' : 'Difference',
      position: startPos,
      left,
      right
    }
  }

  return left
}
