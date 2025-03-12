// Test script for string property access
// This will help us test the functionality directly

import { JQParser } from './src/parser.fixed.ts';
import { JQCodeGenerator } from './src/generator.ts';

// Sample data
const testData = {
  headers: {
    'x-user-id': '12345',
    'content-type': 'application/json'
  }
};

// Define our simplified compile function
function compile(query: string) {
  const parser = new JQParser(query);
  const generator = new JQCodeGenerator();
  
  try {
    const ast = parser.parse();
    console.log("AST:", JSON.stringify(ast, null, 2));
    
    const fn = generator.generate(ast);
    return fn;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Test our queries
function testQuery(query: string) {
  console.log(`Testing query: "${query}"`);
  try {
    const fn = compile(query);
    const result = fn(testData);
    console.log("Result:", result);
  } catch (error) {
    console.error("Failed to execute query.");
  }
  console.log();
}

// Run tests
testQuery('.headers');
testQuery('.headers["x-user-id"]');
