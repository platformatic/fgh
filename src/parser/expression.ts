import type { ASTNode, Parser } from './types.ts'
import { parseLogical } from './logical.ts'

export function parseExpression (parser: Parser): ASTNode {
  const startPos = parser.currentToken?.position ?? 0
  let left = parseLogical(parser)

  // Handle pipe operator
  if (parser.currentToken && parser.currentToken.type === '|') {
    parser.advance()
    // After pipe, right side nodes should be at position startPos + 7
    parser.basePos = startPos + 7
    const right = parseExpression(parser)

    left = {
      type: 'Pipe',
      position: startPos,
      left,
      right
    }

    // Handle comma operator for sequence expressions
  } else if (parser.currentToken && parser.currentToken.type === ',' as TokenType) {
    // Create a sequence node with the current expression as the first element
    const expressions: ASTNode[] = [left]

    // Continue parsing expressions separated by commas
    while (parser.currentToken && parser.currentToken.type === ',' as TokenType) {
      parser.advance() // Consume comma
      const next = parseLogical(parser) // Use parseLogical to handle arithmetic and logical operations
      expressions.push(next)

      // Handle pipe operators inside sequence elements
      if (parser.currentToken && parser.currentToken.type === '|') {
        parser.advance()
        // After pipe, right side nodes should be at position startPos + 7
        parser.basePos = startPos + 7

        const pipeRight = parseExpression(parser)

        // Replace the last expression with a pipe node
        expressions[expressions.length - 1] = {
          type: 'Pipe',
          position: expressions[expressions.length - 1].position,
          left: expressions[expressions.length - 1],
          right: pipeRight
        }
      }
    }

    // Create sequence node with all parsed expressions
    return {
      type: 'Sequence',
      position: startPos,
      expressions
    }
  }

  return left
}
