import type { ASTNode, Parser } from '../types.ts'
import { parseChain } from './chain.ts'

export function parseProduct (parser: Parser): ASTNode {
  const startPos = parser.currentToken?.position ?? 0
  let left = parseChain(parser)

  // Handle multiplication, division, and modulo operators (potentially multiple in a chain)
  while (parser.currentToken && (parser.currentToken.type === '*' || parser.currentToken.type === '/' || parser.currentToken.type === '%')) {
    const operator = parser.currentToken.type
    parser.advance() // Consume the operator

    // Parse the right operand
    const right = parseChain(parser)

    // Create the appropriate node based on the operator
    if (operator === '*') {
      left = {
        type: 'Multiply',
        position: startPos,
        left,
        right
      }
    } else if (operator === '/') {
      left = {
        type: 'Divide',
        position: startPos,
        left,
        right
      }
    } else { // operator === '%'
      left = {
        type: 'Modulo',
        position: startPos,
        left,
        right
      }
    }
  }

  return left
}
