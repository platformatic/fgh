import { ParseError } from '../types.ts'
import type { ASTNode, Parser } from '../types.ts'

// Helper method to parse simple array literals like ["xml", "yaml"]
// This uses a more direct parsing approach to handle string literals in arrays
export function parseSimpleArrayLiteral (parser: Parser): ASTNode {
  const position = parser.currentToken?.position ?? 0

  // Safety check - we should be at an opening bracket
  if (!parser.currentToken || parser.currentToken.type !== '[' as TokenType) {
    throw new ParseError('Expected [ at the beginning of array literal', position)
  }

  // Save the opening bracket position and consume it
  parser.advance() // Consume [

  const elements: ASTNode[] = []

  // Parse elements until closing bracket
  while (parser.currentToken && parser.currentToken.type !== ']' as TokenType) {
    if (parser.currentToken.type === 'STRING' as TokenType) {
      // Handle string literals
      elements.push({
        type: 'Literal',
        position: parser.currentToken.position,
        value: parser.currentToken.value
      })
      parser.advance() // Consume string
    } else if (parser.currentToken.type === 'NUM' as TokenType) {
      // Handle numeric literals
      elements.push({
        type: 'Literal',
        position: parser.currentToken.position,
        value: parseInt(parser.currentToken.value, 10)
      })
      parser.advance() // Consume number
    } else if (parser.currentToken.type === 'IDENT' as TokenType &&
               (parser.currentToken.value === 'true' ||
                parser.currentToken.value === 'false' ||
                  parser.currentToken.value === 'null')) {
      // Handle boolean and null literals
      const value = parser.currentToken.value === 'true'
        ? true
        : parser.currentToken.value === 'false' ? false : null
      elements.push({
        type: 'Literal',
        position: parser.currentToken.position,
        value
      })
      parser.advance() // Consume identifier
    } else if (parser.currentToken.type === 'NOT' as TokenType) {
      // Handle 'not' keyword
      const notPos = parser.currentToken.position
      parser.advance() // Consume 'not'

      // Create a Not node
      elements.push({
        type: 'Not',
        position: notPos,
        expression: {
          type: 'Identity',
          position: notPos
        }
      })
    } else {
      // Skip unknown tokens to try to recover
      console.log(`Skipping unexpected token '${parser.currentToken.type}' in array literal`)
      parser.advance()
    }

    // Skip comma if present
    if (parser.currentToken?.type === ',' as TokenType) {
      parser.advance()
    }
  }

  // Consume closing bracket if present
  if (!parser.currentToken || parser.currentToken.type !== ']' as TokenType) {
    throw new ParseError(
      `Expected closing bracket ']' for array literal starting at position ${position}`,
      parser.currentToken?.position ?? -1
    )
  }

  parser.advance() // Consume ]

  return {
    type: 'ArrayConstruction',
    position,
    elements
  }
}
