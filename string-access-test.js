// Test for string property access functionality
// Simple Node.js script to verify the implementation without using TypeScript

// Simplified version of parser
class Parser {
  constructor(input) {
    this.input = input;
    this.position = 0;
  }
  
  parse() {
    // Check if it's a dot-property access first
    if (this.input.startsWith('.')) {
      // .headers["x-user-id"] pattern
      const dotParts = this.input.split('[');
      
      // Extract the base property name (after the dot)
      const baseProp = dotParts[0].substring(1);
      
      if (dotParts.length === 1) {
        // Simple property access (.prop)
        return {
          type: 'PropertyAccess',
          property: baseProp,
          stringKey: false
        };
      } else {
        // String property access with brackets (.prop["string-key"])
        const stringKeyMatch = dotParts[1].match(/^"([^"]+)"\]$/);
        if (stringKeyMatch) {
          const stringKey = stringKeyMatch[1];
          
          // First create a node for the base property access
          const baseNode = {
            type: 'PropertyAccess',
            property: baseProp,
            stringKey: false
          };
          
          // Then create the string key property access node
          return {
            type: 'PropertyAccess',
            property: stringKey,
            stringKey: true,
            input: baseNode
          };
        }
      }
    }
    
    // Default to identity
    return { type: 'Identity' };
  }
}

// Simple generator 
class Generator {
  generateNode(node) {
    switch(node.type) {
      case 'PropertyAccess':
        return this.generatePropertyAccess(node);
      case 'Identity':
      default:
        return 'input';
    }
  }
  
  generatePropertyAccess(node, optional = false) {
    let input = 'input';
    if (node.input) {
      input = this.generateNode(node.input); 
    }
    
    // Check if it's a string literal property
    if (node.stringKey) {
      return `accessProperty(${input}, "${node.property}", ${optional})`;
    }
    
    return `accessProperty(${input}, '${node.property}', ${optional})`;
  }
  
  generate(ast) {
    const code = this.generateNode(ast);
    console.log("Generated code:", code);
    return code;
  }
}

// Simplified helper to simulate the accessProperty function
function accessProperty(input, prop, optional = false) {
  console.log(`Accessing property: "${prop}" (optional: ${optional})`);
  
  const results = [];
  for (const obj of Array.isArray(input) ? input : [input]) {
    if (obj && typeof obj === 'object') {
      results.push(obj[prop]);
    } else if (!optional) {
      results.push(undefined);
    }
  }
  
  return results;
}

// Test our implementation
function testPropertyAccess(query, data) {
  console.log(`Testing query: "${query}"`);
  
  const parser = new Parser(query);
  const ast = parser.parse();
  console.log("AST:", JSON.stringify(ast, null, 2));
  
  const generator = new Generator();
  const code = generator.generate(ast);
  
  // Execute the code
  const wrappedData = [data];
  // Evaluate the code with input as the wrapped data
  const evalCode = `const input = ${JSON.stringify(wrappedData)}; ${code}`;
  console.log("Result:", eval(evalCode));
  console.log();
}

// Test cases
const testData = {
  headers: {
    'x-user-id': '12345',
    'content-type': 'application/json'
  }
};

testPropertyAccess('.headers', testData);
testPropertyAccess('.headers["x-user-id"]', testData);
testPropertyAccess('.headers["content-type"]', testData);
