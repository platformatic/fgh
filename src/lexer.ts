import type { Token, Lexer } from './types.ts'
import { ParseError } from './types.ts'

export class JQLexer implements Lexer {
  // For debugging
  log (message: string) {
    // console.log(`[Lexer] ${message}`)
  }

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

    // Look ahead for two-character operators
    if (this.position + 1 < this.input.length) {
      const twoChars = this.input.substring(this.position, this.position + 2)
      if (twoChars === '<=' || twoChars === '>=') {
        this.position += 2
        return { type: twoChars as any, value: twoChars, position: startPos }
      }
    }

    switch (char) {
      case '.':
        this.position++
        // Check for recursive descent operator ..
        if (this.hasMoreTokens() && this.input[this.position] === '.') {
          this.position++
          return { type: 'DOT', value: '..', position: startPos }
        }
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
      case '{':
        this.position++
        return { type: '{', value: '{', position: startPos }
      case '}':
        this.position++
        return { type: '}', value: '}', position: startPos }
      case ',':
        this.position++
        return { type: ',', value: ',', position: startPos }
      case '(':
        this.position++
        return { type: '(', value: '(', position: startPos }
      case ')':
        this.position++
        return { type: ')', value: ')', position: startPos }
      case '+':
        this.position++
        return { type: '+', value: '+', position: startPos }
      case '<':
        this.position++
        return { type: '<', value: '<', position: startPos }
      case '>':
        this.position++
        return { type: '>', value: '>', position: startPos }
      case '"':
      case "'":
        return this.readString(char)
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

    // Check for keywords
    const keywords = ['map', 'map_values', 'empty', 'if', 'then', 'else', 'end', 'sort', 'sort_by']
    if (keywords.includes(value)) {
      return { type: value.toUpperCase() as any, value, position: startPos }
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

  private readString (quote: string): Token {
    const startPos = this.position
    this.position++ // Skip the opening quote

    let value = ''
    let escaped = false

    while (this.hasMoreTokens() && (escaped || this.input[this.position] !== quote)) {
      if (escaped) {
        // Handle escape sequences
        const char = this.input[this.position]
        switch (char) {
          case 'n': value += '\n'; break
          case 't': value += '\t'; break
          case 'r': value += '\r'; break
          case '\\': value += '\\'; break
          case '"': value += '"'; break
          case "'": value += "'"; break
          default: value += char // Include the character as-is
        }
        escaped = false
      } else if (this.input[this.position] === '\\') {
        escaped = true
      } else {
        value += this.input[this.position]
      }

      this.position++
    }

    if (!this.hasMoreTokens() || this.input[this.position] !== quote) {
      // Improved error message with context and proper position information
      throw new ParseError(`Unterminated string literal starting at position ${startPos} in '${this.input.substring(Math.max(0, startPos - 5), startPos)}${this.input.substring(startPos, Math.min(this.input.length, startPos + 10))}...'`, startPos)
    }

    this.position++ // Skip the closing quote

    return { type: 'STRING', value, position: startPos }
  }
}
