import { JQParser } from './src/parser.ts'
import { JQLexer } from './src/lexer.ts'

function testParser(input: string) {
  console.log(`\nTesting parser with input: "${input}"`)
  console.log('Tokens:')
  
  // Log the tokens first
  const lexer = new JQLexer(input)
  let token
  while ((token = lexer.nextToken()) !== null) {
    console.log(` - ${token.type}: "${token.value}" at position ${token.position}`)
  }
  
  try {
    const parser = new JQParser(input)
    const ast = parser.parse()
    console.log('AST:', JSON.stringify(ast, null, 2))
    console.log('Parsing successful!')
  } catch (error) {
    console.error('Parser error:', error)
  }
}

// Test various property access patterns
testParser('.headers["x-user-id"]')
testParser('.headers["x-user-id"]?')
testParser('.response.headers["content-type"]')
