/**
 * Parser for FGH expressions
 *
 * Transforms tokenized input into an Abstract Syntax Tree (AST) following JQ-like syntax.
 * Handles complex expressions including pipes, operators, array/object construction,
 * property access, filtering, and more, with comprehensive error handling and recovery.
 */

// src/parser.ts - Includes support for array construction [.prop1, .prop2[]]
import { ParseError } from './types.ts'
import type { Token, TokenType, ASTNode } from './types.ts'
import { FGHLexer } from './lexer.ts'
import { parseExpression } from './parser/expression.ts'

export class FGHParser {
  private lexer: FGHLexer
  private basePos: number = 0

  currentToken: Token | null = null

  constructor (input: string) {
    this.lexer = new FGHLexer(input)
    this.advance()
  }

  parse (): ASTNode {
    const node = parseExpression(this)

    if (this.currentToken !== null) {
      throw new ParseError(
        `Unexpected token: ${this.currentToken.value}`,
        this.currentToken.position
      )
    }

    return node
  }

  advance (): void {
    this.currentToken = this.lexer.nextToken()
  }

  expect (expectedType: TokenType): Token {
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

  // Helper method to peek ahead multiple tokens
  peekAhead (count: number): Token | null {
    let token = null
    let position = (this.lexer as any).position
    const startPosition = position

    for (let i = 0; i < count; i++) {
      token = this.lexer.nextToken()
      if (!token) break
      position += token.value?.length || 0
    }

    // Reset lexer position
    (this.lexer as any).position = startPosition

    return token
  }
}
