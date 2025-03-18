import { ParseError } from '../types.ts'
import type { ASTNode, Parser } from '../types.ts'

export function parseArrayIndices (parser: Parser): ASTNode {
  const startPos = parser.currentToken?.position ?? 0

  parser.advance() // Consume the opening bracket [

  // Handle empty array case - should never happen here
  if (parser.currentToken?.type === ']' as TokenType) {
    parser.advance() // Consume ]
    throw new ParseError('Empty array index is not valid', startPos)
  }

  const indices: number[] = []

  // Parse until we hit the closing bracket
  while (parser.currentToken && parser.currentToken.type !== ']' as TokenType) {
    // Parse an index (number or negative number)
    if (parser.currentToken.type === 'NUM' as TokenType) {
      indices.push(parseInt(parser.currentToken.value, 10))
      parser.advance() // Consume number
    } else if (parser.currentToken.type === '-' as TokenType) {
      parser.advance() // Consume minus
      if (parser.currentToken?.type !== 'NUM' as TokenType) {
        throw new ParseError(
            `Expected number after minus sign, got ${parser.currentToken?.type ?? 'EOF'}`,
            parser.currentToken?.position ?? -1
        )
      }
      indices.push(-parseInt(parser.currentToken.value, 10))
      parser.advance() // Consume number
    } else {
      throw new ParseError(
          `Expected number or minus sign, got ${parser.currentToken.type}`,
          parser.currentToken.position
      )
    }

    // If we have a comma, consume it and continue
    if (parser.currentToken?.type === ',' as TokenType) {
      parser.advance() // Consume comma
    } else if (parser.currentToken?.type !== ']' as TokenType) {
      throw new ParseError(
          `Expected comma or closing bracket, got ${parser.currentToken?.type ?? 'EOF'}`,
          parser.currentToken?.position ?? -1
      )
    }
  }

  // Consume the closing bracket
  if (!parser.currentToken || parser.currentToken.type !== ']' as TokenType) {
    throw new ParseError(
        `Expected closing bracket, got ${parser.currentToken?.type ?? 'EOF'}`,
        parser.currentToken?.position ?? -1
    )
  }
  parser.advance() // Consume ]

  // If we have just one index, return an IndexAccess node
  if (indices.length === 1) {
    return {
      type: 'IndexAccess',
      position: startPos,
      index: indices[0]
    }
  }

  // Otherwise create a Sequence node with all indices
  const expressions: ASTNode[] = indices.map(index => ({
    type: 'IndexAccess',
    position: startPos,
    index
  }))

  return {
    type: 'Sequence',
    position: startPos,
    expressions
  }
}
