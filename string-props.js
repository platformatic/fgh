// Simple test script for string property access
// We'll use Node's native eval to test our implementation

const sampleData = {
  headers: {
    'x-user-id': '12345',
    'content-type': 'application/json'
  },
  response: {
    headers: {
      'x-rate-limit': '100'
    }
  }
};

// Test if the stringKey property is correctly accessible in the GeneratePropertyAccess
// method of the generator

console.log("Testing string property access implementation");

// Sample implementation: 
function accessProperty(input, prop, optional = false) {
  console.log(`Accessing property: "${prop}" (optional: ${optional})`);
  const results = [];
  
  for (const obj of input) {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const value = obj[prop];
      if (value !== undefined || !optional) {
        results.push(value);
      }
    } else if (!optional) {
      results.push(undefined);
    }
  }
  
  return results;
}

// Test with and without string keys
console.log("\nTest with regular property:");
console.log(accessProperty([sampleData], 'headers', false));

console.log("\nTest with string key property:");
console.log(accessProperty([sampleData.headers], 'x-user-id', false));

console.log("\nTest nested access:");
const headers = accessProperty([sampleData], 'headers', false);
console.log(accessProperty(headers, 'x-user-id', false));

console.log("\nTest completed");
