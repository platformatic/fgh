
// Simple test that doesn't use TypeScript to avoid compilation issues

// The original array
const input = [[{ a: 1 }]];

// This mock function simulates what happens when doing '.. | .a?'
function processWithoutFilter(input) {
  // Recursively find all values, including arrays
  const allValues = findAllValues(input);
  
  // Try to access property 'a' on everything, regardless of type
  const results = [];
  for (const value of allValues) {
    if (value && typeof value === 'object' && 'a' in value) {
      results.push(value.a);
    }
  }
  
  return results;
}

// This mock function simulates our fixed behavior
function processWithFilter(input) {
  // Recursively find all values
  const allValues = findAllValues(input);
  
  // Filter out arrays and then access property 'a' only on objects
  const objValues = allValues.filter(item => 
    item !== null && 
    typeof item === 'object' && 
    !Array.isArray(item)
  );
  
  const results = [];
  for (const obj of objValues) {
    if ('a' in obj) {
      results.push(obj.a);
    }
  }
  
  return results;
}

// Helper function to find all values recursively
function findAllValues(input) {
  const result = [];
  const visited = new WeakSet();
  
  function collect(obj) {
    if (obj === null || obj === undefined) return;
    
    if (typeof obj === 'object') {
      if (visited.has(obj)) return;
      visited.add(obj);
    }
    
    result.push(obj);
    
    if (Array.isArray(obj)) {
      for (const item of obj) {
        collect(item);
      }
    }
    else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        collect(obj[key]);
      }
    }
  }
  
  collect(input);
  return result;
}

// Test and show results
console.log('Input:', JSON.stringify(input));

// Show all values from recursive descent
const allValues = findAllValues(input);
console.log('\nAll values found by recursive descent:');
allValues.forEach((val, i) => {
  console.log(`  Value ${i+1}: ${JSON.stringify(val)}`);
});

// Test original behavior
const originalResult = processWithoutFilter(input);
console.log('\nOriginal behavior (try to access property on all values):');
console.log('Result:', JSON.stringify(originalResult));
console.log('Result length:', originalResult.length);

// Test fixed behavior
const fixedResult = processWithFilter(input);
console.log('\nFixed behavior (filter arrays before property access):');
console.log('Result:', JSON.stringify(fixedResult));
console.log('Result length:', fixedResult.length);

// Demonstrate the fix
console.log('\nFix implementation:');
console.log('1. Add _fromRecursiveDescent flag to recursive descent results');
console.log('2. In handlePipe function, detect recursive descent results by checking for flag');
console.log('3. Filter out arrays before attempting property access');
console.log('4. Only apply property access to actual objects');
