import type { Token, Lexer } from './types.ts'
import { ParseError } from './types.ts'

export class JQLexer implements Lexer {
  private position: number = 0
  private input: string

  constructor (input: string) {
    this.input = input
  }

  hasMoreTokens (): boolean {
    return this.position < this.input.length
  }

  nextToken (): Token | null {
    this.skipWhitespace()

    if (!this.hasMoreTokens()) {
      return null
    }

    const char = this.input[this.position]
    const startPos = this.position
    let pos

    switch (char) {
      case '.':
        this.position++
        return { type: 'DOT', value: '.', position: startPos }
      case '[':
        this.position++
        // Check if next non-whitespace character is ]
        pos = this.position
        while (pos < this.input.length && this.isWhitespace(this.input[pos])) {
          pos++
        }
        if (pos < this.input.length && this.input[pos] === ']') {
          this.position = pos + 1
          return { type: '[]', value: '[]', position: startPos }
        }
        return { type: '[', value: '[', position: startPos }
      case ']':
        this.position++
        return { type: ']', value: ']', position: startPos }
      case '|':
        this.position++
        return { type: '|', value: '|', position: startPos }
      case '?':
        this.position++
        return { type: '?', value: '?', position: startPos }
      case '*':
        this.position++
        return { type: '*', value: '*', position: startPos }
      case ':':
        this.position++
        return { type: ':', value: ':', position: startPos }
      case '-':
        this.position++
        return { type: '-', value: '-', position: startPos }
    }

    if (this.isDigit(char)) {
      return this.readNumber()
    }

    if (this.isIdentifierStart(char)) {
      return this.readIdentifier()
    }

    throw new ParseError(`Unexpected character: ${char}`, this.position)
  }

  private skipWhitespace (): void {
    while (
      this.hasMoreTokens() &&
      this.isWhitespace(this.input[this.position])
    ) {
      this.position++
    }
  }

  private readNumber (): Token {
    const startPos = this.position
    let value = ''

    while (
      this.hasMoreTokens() &&
      this.isDigit(this.input[this.position])
    ) {
      value += this.input[this.position]
      this.position++
    }

    return { type: 'NUM', value, position: startPos }
  }

  private readIdentifier (): Token {
    const startPos = this.position
    let value = ''

    while (
      this.hasMoreTokens() &&
      this.isIdentifierPart(this.input[this.position])
    ) {
      value += this.input[this.position]
      this.position++
    }

    return { type: 'IDENT', value, position: startPos }
  }

  private isWhitespace (char: string | undefined): boolean {
    return char !== undefined && /\s/.test(char)
  }

  private isDigit (char: string | undefined): boolean {
    return char !== undefined && /[0-9]/.test(char)
  }

  private isIdentifierStart (char: string | undefined): boolean {
    return char !== undefined && /[a-zA-Z_]/.test(char)
  }

  private isIdentifierPart (char: string | undefined): boolean {
    return char !== undefined && /[a-zA-Z0-9_]/.test(char)
  }
}
