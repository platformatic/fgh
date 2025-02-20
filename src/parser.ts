import { ParseError } from './types.ts';
import type { Token, TokenType, Lexer, ASTNode, Node } from './types.ts';
import { JQLexer } from './lexer.ts';

export class JQParser {
  private lexer: Lexer;
  private currentToken: Token | null = null;

  constructor(input: string) {
    this.lexer = new JQLexer(input);
    this.advance();
  }

  parse(): ASTNode {
    const node = this.parseExpression();
    
    if (this.currentToken !== null) {
      throw new ParseError(
        `Unexpected token: ${this.currentToken.value}`,
        this.currentToken.position
      );
    }
    
    return node;
  }

  private advance(): void {
    this.currentToken = this.lexer.nextToken();
  }

  private expect(type: TokenType): Token {
    const token = this.currentToken;
    if (!token || token.type !== type) {
      throw new ParseError(
        `Expected token type ${type}, got ${token?.type ?? 'EOF'}`,
        token?.position ?? -1
      );
    }
    this.advance();
    return token;
  }

  private parseExpression(): ASTNode {
    let left = this.parsePrimary();

    while (this.currentToken) {
      if (this.currentToken.type === '|') {
        this.advance();
        const right = this.parsePrimary();
        left = {
          type: 'Pipe',
          position: left.position,
          left,
          right
        };
      } else if (this.currentToken.type === '?') {
        this.advance();
        left = {
          type: 'Optional',
          position: left.position,
          expression: left
        };
      } else {
        break;
      }
    }

    return left;
  }

  private parsePrimary(): ASTNode {
    if (!this.currentToken) {
      throw new ParseError('Unexpected end of input', -1);
    }

    const currentType = this.currentToken.type;
    switch (currentType) {
      case 'DOT': {
        const position = this.currentToken.position;
        this.advance();

        // Check for wildcard
        if (this.currentToken && 
            (this.currentToken.type as TokenType) === '*') {
          this.advance();
          return { type: 'Wildcard', position };
        }

        // Simple identity (.)
        if (!this.currentToken || 
            !((this.currentToken.type as TokenType) === 'IDENT' || 
              (this.currentToken.type as TokenType) === '[')) {
          return { type: 'Identity', position };
        }

        // Property access (.foo)
        if ((this.currentToken.type as TokenType) === 'IDENT') {
          const property = this.currentToken.value;
          this.advance();
          return { type: 'PropertyAccess', position, property };
        }
        
        // Fall through to array access
      }

      case '[': {
        const position = this.currentToken.position;
        this.advance();
        const index = parseInt(this.expect('NUM').value, 10);
        this.expect(']');
        return { type: 'IndexAccess', position, index };
      }

      default:
        throw new ParseError(
          `Unexpected token: ${this.currentToken.value}`,
          this.currentToken.position
        );
    }
  }
}
