import type { ASTNode, Parser } from './types.ts'
import { parseSum } from './sum.ts'

export function parseComparison (parser: Parser): ASTNode {
  const startPos = parser.currentToken?.position ?? 0
  let left = parseSum(parser)

  // Handle comparison operators
  while (parser.currentToken && (
    parser.currentToken.type === '<' as TokenType ||
    parser.currentToken.type === '>' as TokenType ||
    parser.currentToken.type === '<=' as TokenType ||
    parser.currentToken.type === '>=' as TokenType ||
    parser.currentToken.type === '==' as TokenType ||
    parser.currentToken.type === '!=' as TokenType
  )) {
    const operator = parser.currentToken.type
    parser.advance() // Consume the operator

    // Parse the right side
    const right = parseSum(parser)

    // Create the appropriate comparison node
    switch (operator) {
      case '>' as TokenType:
        left = {
          type: 'GreaterThan',
          position: startPos,
          left,
          right
        }
        break
      case '>=' as TokenType:
        left = {
          type: 'GreaterThanOrEqual',
          position: startPos,
          left,
          right
        }
        break
      case '<' as TokenType:
        left = {
          type: 'LessThan',
          position: startPos,
          left,
          right
        }
        break
      case '<=' as TokenType:
        left = {
          type: 'LessThanOrEqual',
          position: startPos,
          left,
          right
        }
        break
      case '==' as TokenType:
        left = {
          type: 'Equal',
          position: startPos,
          left,
          right
        }
        break
      case '!=' as TokenType:
        left = {
          type: 'NotEqual',
          position: startPos,
          left,
          right
        }
        break
    }
  }

  return left
}
