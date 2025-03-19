/**
 * Array indices parser for FGH
 *
 * Handles parsing of comma-separated array indices
 */

import { ParseError } from '../types.ts'
import type { ASTNode, Parser, TokenType } from '../types.ts'

export function parseArrayIndices (parser: Parser): ASTNode {
  const pos = parser.basePos === 0 ? parser.currentToken?.position : parser.basePos

  parser.advance() // Consume [

  // Parse the indices
  const indices: number[] = []

  while (parser.currentToken) {
    if (parser.currentToken.type === 'NUM' as TokenType) {
      indices.push(parseInt(parser.currentToken.value, 10))
      parser.advance()

      if (parser.currentToken?.type === ',' as TokenType) {
        parser.advance() // Consume comma
      } else if (parser.currentToken?.type === ']' as TokenType) {
        break
      } else {
        throw new ParseError(`Expected , or ] after index, got ${parser.currentToken?.type}`,
          parser.currentToken?.position ?? -1)
      }
    } else if (parser.currentToken.type === '-' as TokenType) {
      parser.advance() // Consume -
      if (parser.currentToken?.type === 'NUM' as TokenType) {
        indices.push(-parseInt(parser.currentToken.value, 10))
        parser.advance()

        if (parser.currentToken?.type === ',' as TokenType) {
          parser.advance() // Consume comma
        } else if (parser.currentToken?.type === ']' as TokenType) {
          break
        } else {
          throw new ParseError(`Expected , or ] after index, got ${parser.currentToken?.type}`,
            parser.currentToken?.position ?? -1)
        }
      } else {
        throw new ParseError(`Expected number after -, got ${parser.currentToken?.type}`,
          parser.currentToken?.position ?? -1)
      }
    } else {
      throw new ParseError(`Expected number or - in index list, got ${parser.currentToken?.type}`,
        parser.currentToken?.position ?? -1)
    }
  }

  parser.expect(']' as TokenType)

  // Create a sequence node with index access nodes
  return {
    type: 'Sequence',
    position: pos ?? 0,
    expressions: indices.map(index => ({
      type: 'IndexAccess',
      position: pos ?? 0,
      index
    }))
  }
}
