import type { ASTNode, Parser } from '../types.ts'
import { ParseError } from '../types.ts'
import { parsePrimary } from './primary.ts'

export function parseChain (parser: Parser): ASTNode {
  let expr = parsePrimary(parser)

  while (parser.currentToken) {
    const tokenType = parser.currentToken.type

    if (tokenType === '?') {
      parser.advance()
      expr = {
        type: 'Optional',
        position: parser.basePos,
        expression: expr
      }
    } else if (tokenType === '[' || tokenType === '[]') {
      const pos = parser.basePos === 0 ? parser.currentToken.position : parser.basePos
      if (tokenType === '[]') {
        parser.advance()
        expr = {
          type: 'ArrayIteration',
          position: pos,
          input: expr
        }
      } else {
        parser.advance() // Consume [

        // Special handling for string key property access: ["x-user-id"]
        if (parser.currentToken?.type === 'STRING' as TokenType) {
          const stringProperty = parser.currentToken.value
          parser.advance() // Consume string

          // Ensure closing bracket
          if (parser.currentToken?.type !== ']' as TokenType) {
            throw new ParseError(
              `Expected closing bracket after string literal, got ${parser.currentToken?.type ?? 'EOF'}`,
              parser.currentToken?.position ?? -1
            )
          }
          parser.advance() // Consume ]

          // Create property access node with string key
          expr = {
            type: 'PropertyAccess',
            position: pos,
            property: stringProperty,
            stringKey: true,
            input: expr
          }
        } else {
          // Handle index access and slices
          if (parser.currentToken?.type === ':' as TokenType) {
            // Handle slices starting with colon [:n]
            parser.advance()
            let end = null
            if (parser.currentToken?.type === 'NUM' as TokenType) {
              end = parseInt(parser.currentToken.value, 10)
              parser.advance()
            }
            parser.expect(']')
            expr = {
              type: 'Slice',
              position: pos,
              start: null,
              end,
              input: expr
            }
          } else if (parser.currentToken?.type === 'NUM' as TokenType || parser.currentToken?.type === '-' as TokenType) {
            // Parse first number or negative
            let num: number
            if (parser.currentToken.type === '-' as TokenType) {
              parser.advance()
              if (parser.currentToken?.type !== 'NUM' as TokenType) {
                throw new ParseError(
                  `Expected number after minus sign, got ${parser.currentToken?.type ?? 'EOF'}`,
                  parser.currentToken?.position ?? -1
                )
              }
              num = -parseInt(parser.currentToken.value, 10)
              parser.advance()
            } else {
              num = parseInt(parser.currentToken.value, 10)
              parser.advance()
            }

            // Check if it's a slice or regular index
            if (parser.currentToken?.type === ':' as TokenType) {
              // It's a slice
              parser.advance()
              let end = null
              if (parser.currentToken?.type === 'NUM' as TokenType) {
                end = parseInt(parser.currentToken.value, 10)
                parser.advance()
              }
              parser.expect(']')
              expr = {
                type: 'Slice',
                position: pos,
                start: num,
                end,
                input: expr
              }
            } else if (parser.currentToken?.type === ',' as TokenType) {
              // It's a comma-separated list of indices
              // First index is already consumed
              const indices = [num]

              while (parser.currentToken?.type === ',' as TokenType) {
                parser.advance() // Consume comma

                // Parse next index
                if (parser.currentToken?.type === 'NUM' as TokenType) {
                  indices.push(parseInt(parser.currentToken.value, 10))
                  parser.advance()
                } else if (parser.currentToken?.type === '-' as TokenType) {
                  parser.advance()
                  if (parser.currentToken?.type !== 'NUM' as TokenType) {
                    throw new ParseError(
                      `Expected number after minus sign, got ${parser.currentToken?.type ?? 'EOF'}`,
                      parser.currentToken?.position ?? -1
                    )
                  }
                  indices.push(-parseInt(parser.currentToken.value, 10))
                  parser.advance()
                } else {
                  throw new ParseError(
                    `Expected number or minus sign after comma, got ${parser.currentToken?.type ?? 'EOF'}`,
                    parser.currentToken?.position ?? -1
                  )
                }
              }

              parser.expect(']')

              // Create a sequence of index accesses
              if (indices.length === 1) {
                expr = {
                  type: 'IndexAccess',
                  position: pos,
                  index: indices[0],
                  input: expr
                }
              } else {
                // For multiple indices, create a Sequence
                const expressions = indices.map(index => ({
                  type: 'IndexAccess' as const,
                  position: pos,
                  index,
                  input: expr
                }))

                expr = {
                  type: 'Sequence',
                  position: pos,
                  expressions
                }
              }
            } else {
              // Regular index access
              parser.expect(']')
              expr = {
                type: 'IndexAccess',
                position: pos,
                index: num,
                input: expr
              }
            }
          } else {
            throw new ParseError(
              `Expected string literal, number, minus, or colon after [, got ${parser.currentToken?.type ?? 'EOF'}`,
              parser.currentToken?.position ?? -1
            )
          }
        }
      }
    } else if (tokenType === 'DOT' as TokenType) {
      parser.advance()

      if (!parser.currentToken) {
        throw new ParseError('Unexpected end of input after dot', -1)
      }

      const nextTokenType = parser.currentToken.type
      if (nextTokenType === 'IDENT' as TokenType) {
        const property = parser.currentToken.value
        parser.advance()
        expr = {
          type: 'PropertyAccess',
          position: parser.basePos,
          property,
          input: expr
        }

        // Check for string literal property access: .headers["x-user-id"]
        if (parser.currentToken?.type === '[' as TokenType) {
          // Position is tracked through basePos, no need for bracketPos
          parser.advance() // Consume [

          // Check for string literal
          if (parser.currentToken?.type === 'STRING' as TokenType) {
            const stringProperty = parser.currentToken.value
            parser.advance() // Consume string

            // Ensure closing bracket
            if (parser.currentToken?.type !== ']' as TokenType) {
              throw new ParseError(`Expected closing bracket after string property, got ${parser.currentToken?.type ?? 'EOF'}`,
                parser.currentToken?.position ?? -1)
            }
            parser.advance() // Consume ]

            // Create a new property access node with the string property
            expr = {
              type: 'PropertyAccess',
              position: parser.basePos,
              property: stringProperty,
              stringKey: true,
              input: expr
            }
          } else {
            // This might be a different kind of bracket access, rewind the parser
            (parser.lexer as any).position -= 1 // Move back to before [
            parser.currentToken = { type: '[' as TokenType, value: '[', position: (parser.lexer as any).position }
          }
        }
      }
    } else {
      break
    }
  }

  return expr
}
