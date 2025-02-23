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
          const index = parseInt(this.expect('NUM').value, 10)
          this.expect(']')
          expr = {
            type: 'IndexAccess',
            position: pos,
            index,
            input: expr
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
