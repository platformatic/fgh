import { JQLexer } from './src/lexer.ts'

function testLexer(input: string) {
  console.log(`Testing lexer with input: "${input}"`)
  const lexer = new JQLexer(input)
  
  const tokens = []
  let token
  
  while ((token = lexer.nextToken()) !== null) {
    tokens.push(token)
  }
  
  console.log('Tokens:', JSON.stringify(tokens, null, 2))
}

// Test various property access patterns
testLexer('.headers["x-user-id"]')
testLexer('.headers["x-user-id"]?')
testLexer('.response.headers["content-type"]')
