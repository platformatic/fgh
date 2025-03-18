import { ParseError } from '../types.ts'
import type { ASTNode, Parser } from '../types.ts'
import { parseChain } from './chain.ts'

export function parseArrayConstruction (parser: Parser): ASTNode {
  if (!parser.currentToken || parser.currentToken.type !== '[') {
    throw new ParseError('Expected [', parser.currentToken?.position ?? -1)
  }

  const pos = parser.basePos === 0 ? parser.currentToken.position : parser.basePos
  parser.advance() // Consume [

  const elements: ASTNode[] = []

  // Handle empty array case
  if (parser.currentToken && parser.currentToken.type === ']' as TokenType) {
    parser.advance() // Consume ]
    return {
      type: 'ArrayConstruction',
      position: pos,
      elements
    }
  }

  // Parse array elements until we hit closing bracket
  while (parser.currentToken && parser.currentToken.type !== ']' as TokenType) {
    // Parse an element
    if (parser.currentToken.type === 'DOT' as TokenType) {
      // Property access or identity (.user or .)
      const dotPos = parser.currentToken.position
      parser.advance() // Consume dot

      if (!parser.currentToken) {
        // Just a dot (.)
        elements.push({
          type: 'Identity',
          position: dotPos
        })
      } else if (parser.currentToken.type === 'IDENT' as TokenType) {
        // Property access (.user)
        const property = parser.currentToken.value
        parser.advance() // Consume identifier

        let node: ASTNode = {
          type: 'PropertyAccess',
          position: dotPos,
          property
        }

        // Check for nested property access (.user.name)
        while (parser.currentToken?.type === 'DOT' as TokenType) {
          parser.advance() // Consume dot
          if (parser.currentToken?.type !== 'IDENT' as TokenType) {
            break
          }
          const nestedProperty = parser.currentToken.value
          parser.advance() // Consume identifier

          node = {
            type: 'PropertyAccess',
            position: dotPos,
            property: nestedProperty,
            input: node
          }
        }

        // Check for array iteration (.projects[])
        if (parser.currentToken?.type === '[]' as TokenType) {
          parser.advance() // Consume []
          node = {
            type: 'ArrayIteration',
            position: dotPos,
            input: node
          }
        }

        elements.push(node)
      } else {
        // Just a dot
        elements.push({
          type: 'Identity',
          position: dotPos
        })
      }
    } else if (parser.currentToken.type === 'STRING' as TokenType) {
      // Handle string literal
      const stringValue = parser.currentToken.value
      const stringPos = parser.currentToken.position
      parser.advance() // Consume string

      elements.push({
        type: 'Literal',
        position: stringPos,
        value: stringValue
      })
    } else if (parser.currentToken.type === 'NUM' as TokenType) {
      // Handle numeric literal
      const numValue = parseInt(parser.currentToken.value, 10)
      const numPos = parser.currentToken.position
      parser.advance() // Consume number

      elements.push({
        type: 'Literal',
        position: numPos,
        value: numValue
      })
    } else if (parser.currentToken.type === 'IDENT' as TokenType) {
      // Handle identifiers like true, false, null, not, or other identifiers
      if (parser.currentToken.value === 'true' || parser.currentToken.value === 'false' || parser.currentToken.value === 'null') {
        // Handle boolean and null literals
        const value = parser.currentToken.value === 'true'
          ? true
          : parser.currentToken.value === 'false' ? false : null
        const idPos = parser.currentToken.position
        parser.advance() // Consume the identifier

        elements.push({
          type: 'Literal',
          position: idPos,
          value
        })
      } else if (parser.currentToken.value === 'not') {
        // Handle 'not' as a special case
        const idPos = parser.currentToken.position
        parser.advance() // Consume 'not'

        elements.push({
          type: 'Not',
          position: idPos,
          expression: {
            type: 'Identity',
            position: idPos
          }
        })
      } else {
        // Other identifiers - try parsing as an expression
        try {
          const element = parseChain(parser)
          elements.push(element)
        } catch (e) {
          // If parsing fails, add the identifier as a string literal
          elements.push({
            type: 'Literal',
            position: parser.currentToken.position,
            value: parser.currentToken.value
          })
          parser.advance() // Consume the identifier
        }
      }
    } else {
      // Other expressions - Try to parse as expression or simple literal
      try {
        const element = parseChain(parser)
        elements.push(element)
      } catch (e) {
        // If parseChain fails, try to proceed with the parse anyway
        if (parser.currentToken) {
          parser.advance() // Try to advance past the problematic token
        } else {
          throw e // If no more tokens, rethrow the error
        }
      }
    }

    // If next token is a comma, consume it
    if (parser.currentToken?.type === ',' as TokenType) {
      parser.advance()
    } else if (parser.currentToken?.type !== ']' as TokenType) {
      // Handle STRING token specially for string arrays
      if (parser.currentToken?.type === 'STRING' as TokenType) {
        // This is likely part of a string array literal, handle it directly
        elements.push({
          type: 'Literal',
          position: parser.currentToken.position,
          value: parser.currentToken.value
        })
        parser.advance() // Consume string
      } else {
        throw new ParseError(
            `Expected comma or closing bracket, got ${parser.currentToken?.type ?? 'EOF'}`,
            parser.currentToken?.position ?? -1
        )
      }
    }
  }

  // Consume the closing bracket
  parser.expect(']')

  return {
    type: 'ArrayConstruction',
    position: pos,
    elements
  }
}
