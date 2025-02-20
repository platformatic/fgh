import type { Token, TokenType, Lexer } from './types.ts';
import { ParseError } from './types.ts';

export class JQLexer implements Lexer {
  private position: number = 0;
  private input: string;

  constructor(input: string) {
    this.input = input;
  }

  hasMoreTokens(): boolean {
    return this.position < this.input.length;
  }

  nextToken(): Token | null {
    this.skipWhitespace();

    if (!this.hasMoreTokens()) {
      return null;
    }

    const char = this.input[this.position];
    const startPos = this.position;

    switch (char) {
      case '.':
        this.position++;
        return { type: 'DOT', value: '.', position: startPos };
      case '[':
        this.position++;
        return { type: '[', value: '[', position: startPos };
      case ']':
        this.position++;
        return { type: ']', value: ']', position: startPos };
      case '|':
        this.position++;
        return { type: '|', value: '|', position: startPos };
      case '?':
        this.position++;
        return { type: '?', value: '?', position: startPos };
      case '*':
        this.position++;
        return { type: '*', value: '*', position: startPos };
    }

    if (this.isDigit(char)) {
      return this.readNumber();
    }

    if (this.isIdentifierStart(char)) {
      return this.readIdentifier();
    }

    throw new ParseError(`Unexpected character: ${char}`, this.position);
  }

  private skipWhitespace(): void {
    while (
      this.hasMoreTokens() &&
      /\s/.test(this.input[this.position])
    ) {
      this.position++;
    }
  }

  private readNumber(): Token {
    const startPos = this.position;
    let value = '';

    while (
      this.hasMoreTokens() &&
      this.isDigit(this.input[this.position])
    ) {
      value += this.input[this.position];
      this.position++;
    }

    return { type: 'NUM', value, position: startPos };
  }

  private readIdentifier(): Token {
    const startPos = this.position;
    let value = '';

    while (
      this.hasMoreTokens() &&
      this.isIdentifierPart(this.input[this.position])
    ) {
      value += this.input[this.position];
      this.position++;
    }

    return { type: 'IDENT', value, position: startPos };
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isIdentifierPart(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }
}
