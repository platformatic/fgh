// src/parser.ts
import { ParseError } from './types.ts'
import type { Token, TokenType, Lexer, ASTNode } from './types.ts'
import { JQLexer } from './lexer.ts'

export class JQParser {
  private lexer: Lexer
  private currentToken: Token | null = null
  private basePos: number = 0

  constructor (input: string) {
    this.lexer = new JQLexer(input)
    this.advance()
  }

  parse (): ASTNode {
    const node = this.parseExpression()

    if (this.currentToken !== null) {
      throw new ParseError(
        `Unexpected token: ${this.currentToken.value}`,
        this.currentToken.position
      )
    }

    return node
  }

  private advance (): void {
    this.currentToken = this.lexer.nextToken()
  }

  private expect (expectedType: TokenType): Token {
    const token = this.currentToken
    if (!token || token.type !== expectedType) {
      throw new ParseError(
        `Expected token type ${expectedType}, got ${token?.type ?? 'EOF'}`,
        token?.position ?? -1
      )
    }
    this.advance()
    return token
  }

  private parseExpression (): ASTNode {
    const startPos = this.currentToken?.position ?? 0
    let left = this.parseChain()

    while (this.currentToken && this.currentToken.type === '|') {
      this.advance()
      // After pipe, right side nodes should be at position startPos + 7
      this.basePos = startPos + 7
      const right = this.parseChain()

      left = {
        type: 'Pipe',
        position: startPos,
        left,
        right
      }
    }

    return left
  }

  private parseObjectConstruction (): ASTNode {
    if (!this.currentToken || this.currentToken.type !== '{' as TokenType) {
      throw new ParseError('Expected {', this.currentToken?.position ?? -1)
    }

    const pos = this.basePos === 0 ? this.currentToken.position : this.basePos
    this.advance() // Consume {

    const fields: any[] = []

    // Parse object fields until we hit closing brace
    while (this.currentToken && this.currentToken.type !== '}' as TokenType) {
      // Parse a field
      const fieldPos = this.currentToken.position

      let key: string | ASTNode
      let isDynamic = false

      // Handle dynamic key: {(.user): .titles}
      if (this.currentToken.type === '(' as TokenType) {
        this.advance() // Consume (
        key = this.parseExpression()
        isDynamic = true
        this.expect(')') // Expect closing parenthesis
      } else {
        // Regular identifier key
        if (this.currentToken.type !== 'IDENT' as TokenType) {
          throw new ParseError(
            `Expected identifier or dynamic key, got ${this.currentToken.type}`,
            this.currentToken.position
          )
        }
        key = this.currentToken.value
        this.advance()
      }

      let value: ASTNode

      // If we have a colon, parse the value expression
      if (this.currentToken && this.currentToken.type === ':' as TokenType) {
        this.advance() // Consume :
        value = this.parseExpression()
      } else {
        // Handle shorthand syntax: { user } -> { user: .user }
        if (typeof key === 'string') {
          value = {
            type: 'PropertyAccess',
            position: fieldPos,
            property: key
          }
        } else {
          throw new ParseError(
            'Expected : after dynamic key',
            this.currentToken?.position ?? -1
          )
        }
      }

      // Add the field to our list
      fields.push({
        type: 'ObjectField',
        position: fieldPos,
        key,
        value,
        isDynamic
      })

      // If next token is a comma, consume it
      if (this.currentToken && this.currentToken.type === ',' as TokenType) {
        this.advance()
      }
    }

    // Consume the closing brace
    this.expect('}')

    return {
      type: 'ObjectConstruction',
      position: pos,
      fields
    }
  }

  private parsePrimary (): ASTNode {
    if (!this.currentToken) {
      throw new ParseError('Unexpected end of input', -1)
    }

    const tokenType = this.currentToken.type
    switch (tokenType) {
      case 'DOT': {
        const dotPos = this.basePos === 0 ? this.currentToken.position : this.basePos
        this.advance()

        // Just return Identity if no token follows
        if (!this.currentToken) {
          return { type: 'Identity', position: dotPos }
        }

        // Handle property access
        if (this.currentToken.type === 'IDENT') {
          const property = this.currentToken.value
          this.advance()
          return {
            type: 'PropertyAccess',
            position: dotPos,
            property
          }
        }

        // If no valid token follows the dot, it's an identity
        return { type: 'Identity', position: dotPos }
      }

      case '[': {
        const pos = this.basePos === 0 ? this.currentToken.position : this.basePos
        this.advance()
        const index = parseInt(this.expect('NUM').value, 10)
        this.expect(']')
        return {
          type: 'IndexAccess',
          position: pos,
          index
        }
      }

      case '{' as TokenType: {
        return this.parseObjectConstruction()
      }

      default:
        throw new ParseError(
          `Unexpected token: ${this.currentToken.value}`,
          this.currentToken.position
        )
    }
  }

  private parseChain (): ASTNode {
    let expr = this.parsePrimary()

    while (this.currentToken) {
      const tokenType = this.currentToken.type

      if (tokenType === '?') {
        this.advance()
        expr = {
          type: 'Optional',
          position: this.basePos,
          expression: expr
        }
      } else if (tokenType === '[' || tokenType === '[]') {
        const pos = this.basePos === 0 ? this.currentToken.position : this.basePos
        if (tokenType === '[]') {
          this.advance()
          expr = {
            type: 'ArrayIteration',
            position: pos,
            input: expr
          }
        } else {
          this.advance()

          // Handle both slices and index access
          if (this.currentToken?.type === ':' as TokenType) {
            // Handle slices starting with colon [:n]
            this.advance()
            let end = null
            if (this.currentToken?.type === 'NUM') {
              end = parseInt(this.currentToken.value, 10)
              this.advance()
            }
            this.expect(']')
            expr = {
              type: 'Slice',
              position: pos,
              start: null,
              end
            }
          } else if (this.currentToken?.type === 'NUM' || this.currentToken?.type === '-') {
            // Parse first number or negative
            let num: number
            if (this.currentToken.type === '-' as TokenType) {
              this.advance()
              num = -parseInt(this.expect('NUM').value, 10)
            } else {
              num = parseInt(this.currentToken.value, 10)
              this.advance()
            }

            // Check if it's a slice or regular index
            if (this.currentToken?.type === ':' as TokenType) {
              // It's a slice
              this.advance()
              let end = null
              if (this.currentToken?.type === 'NUM') {
                end = parseInt(this.currentToken.value, 10)
                this.advance()
              }
              this.expect(']')
              expr = {
                type: 'Slice',
                position: pos,
                start: num,
                end
              }
            } else {
              // It's a regular index
              this.expect(']')
              expr = {
                type: 'IndexAccess',
                position: pos,
                index: num,
                input: expr
              }
            }
          } else {
            throw new ParseError(
              `Expected number, minus, or colon after [, got ${this.currentToken?.type ?? 'EOF'}`,
              this.currentToken?.position ?? -1
            )
          }
        }
      } else if (tokenType === 'DOT') {
        this.advance()

        if (!this.currentToken) {
          throw new ParseError('Unexpected end of input after dot', -1)
        }

        const nextTokenType = this.currentToken.type
        if (nextTokenType === 'IDENT') {
          const property = this.currentToken.value
          this.advance()
          expr = {
            type: 'PropertyAccess',
            position: this.basePos,
            property,
            input: expr
          }
        }
      } else {
        break
      }
    }

    return expr
  }
}
