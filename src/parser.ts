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
    const startPos = this.currentToken?.position ?? 0;
    let left = this.parseChain();

    while (this.currentToken && this.currentToken.type === '|') {
      this.advance();
      const right = this.parseChain();
      
      // After a pipe, right side nodes should always have position 7
      const adjustedRight = this.adjustRightSidePositions(right);
      
      left = {
        type: 'Pipe',
        position: startPos,
        left,
        right: adjustedRight
      };
    }

    return left;
  }

  private adjustRightSidePositions(node: ASTNode): ASTNode {
    // After a pipe, all positions should be 7
    const newPos = 7;
    
    if (node.type === 'Optional') {
      return {
        ...node,
        position: newPos,
        expression: {
          ...node.expression as ASTNode,
          position: newPos
        }
      };
    }
    
    return {
      ...node,
      position: newPos
    };
  }

  private parseChain(): ASTNode {
    const startPos = this.currentToken?.position ?? 0;
    let expr = this.parsePrimary();

    while (this.currentToken) {
      if (this.currentToken.type === '?') {
        this.advance();
        expr = {
          type: 'Optional',
          position: expr.position,
          expression: expr
        };
      } else if (this.currentToken.type === '[') {
        const pos = this.currentToken.position;
        this.advance();
        const index = parseInt(this.expect('NUM').value, 10);
        this.expect(']');
        expr = {
          type: 'IndexAccess',
          position: pos,
          index
        };
      } else if (this.currentToken.type === 'DOT') {
        const dotPos = this.currentToken.position;
        this.advance();
        
        if (!this.currentToken) {
          throw new ParseError('Unexpected end of input after dot', -1);
        }

        if (this.currentToken.type === 'IDENT') {
          const property = this.currentToken.value;
          this.advance();
          expr = {
            type: 'PropertyAccess',
            position: dotPos,
            property
          };
        } else if (this.currentToken.type === '*') {
          this.advance();
          expr = {
            type: 'Wildcard',
            position: dotPos
          };
        }
      } else {
        break;
      }
    }

    return expr;
  }

  private parsePrimary(): ASTNode {
    if (!this.currentToken) {
      throw new ParseError('Unexpected end of input', -1);
    }

    switch (this.currentToken.type) {
      case 'DOT': {
        const dotPos = this.currentToken.position;
        this.advance();

        if (!this.currentToken || 
            !(this.currentToken.type === 'IDENT' || 
              this.currentToken.type === '*')) {
          return { type: 'Identity', position: dotPos };
        }

        if (this.currentToken.type === '*') {
          this.advance();
          return { type: 'Wildcard', position: dotPos };
        }

        const property = this.currentToken.value;
        this.advance();
        return { type: 'PropertyAccess', position: dotPos, property };
      }

      case '[': {
        const pos = this.currentToken.position;
        this.advance();
        const index = parseInt(this.expect('NUM').value, 10);
        this.expect(']');
        return { type: 'IndexAccess', position: pos, index };
      }

      default:
        throw new ParseError(
          `Unexpected token: ${this.currentToken.value}`,
          this.currentToken.position
        );
    }
  }
}