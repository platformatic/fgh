import { test } from 'node:test'
import assert from 'node:assert'
import { execSync } from 'node:child_process'
import { Readable } from 'node:stream'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { query } from '../src/fgh.ts'

// Helper function to create a temporary file with JSON content
function createTempJsonFile(jsonContent: unknown): string {
  const tmpDir = join(tmpdir(), 'fgh-tests')
  
  // Create temp directory if it doesn't exist
  if (!existsSync(tmpDir)) {
    mkdirSync(tmpDir, { recursive: true })
  }
  
  const tmpFile = join(tmpDir, `test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`)
  writeFileSync(tmpFile, JSON.stringify(jsonContent), 'utf8')
  
  return tmpFile
}

// Run jq command and return the result as parsed JSON
function runJq(expression: string, inputJson: unknown): unknown[] {
  // Create a temp file with the input JSON
  const tmpFile = createTempJsonFile(inputJson)
  
  try {
    // Run jq command with the given expression on the temp file
    const result = execSync(`jq -c '${expression}' ${tmpFile}`, {
      encoding: 'utf8'
    })
    
    // Parse each line of the result as JSON
    return result
      .trim()
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line))
  } catch (error) {
    // Handle jq execution errors
    if (error instanceof Error) {
      console.error(`Error executing jq: ${error.message}`)
    }
    return []
  }
}

// Function to compare jq and fgh query results
function compareJqAndFgh(expression: string, inputJson: unknown): { jqResult: unknown[], fghResult: unknown[], equal: boolean } {
  // Run jq
  const jqResult = runJq(expression, inputJson)
  
  // Run fgh
  const fghResult = query(expression, inputJson)
  
  // Compare results (deep equality)
  const equal = JSON.stringify(jqResult) === JSON.stringify(fghResult)
  
  return { jqResult, fghResult, equal }
}

// Test cases with different types of expressions and inputs
const testCases = [
  {
    name: 'Simple property access',
    expression: '.name',
    input: { name: 'John', age: 30 }
  },
  {
    name: 'Array iteration',
    expression: '.users[]',
    input: { users: [{ name: 'John' }, { name: 'Alice' }] }
  },
  {
    name: 'Map and select',
    expression: '.users | map(select(.age > 25))',
    input: { users: [{ name: 'John', age: 30 }, { name: 'Alice', age: 25 }] }
  },
  {
    name: 'Object construction',
    expression: '{ user: .name, isAdult: (.age >= 18) }',
    input: { name: 'John', age: 30 }
  },
  {
    name: 'Array construction',
    expression: '[.name, .age]',
    input: { name: 'John', age: 30 }
  },
  {
    name: 'Math operations',
    expression: '.price * .quantity',
    input: { price: 10, quantity: 3 }
  },
  {
    name: 'String operations',
    expression: '.name + " " + .surname',
    input: { name: 'John', surname: 'Doe' }
  },
  {
    name: 'Function usage - keys',
    expression: 'keys',
    input: { name: 'John', age: 30, city: 'New York' }
  },
  {
    name: 'Complex nested operations',
    expression: '.users | map(select(.age > 25)) | [.[].name] | sort',
    input: {
      users: [
        { name: 'John', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 40 },
        { name: 'Eve', age: 22 }
      ]
    }
  }
]

// Run tests for each test case
for (const testCase of testCases) {
  test(`jq vs fgh: ${testCase.name}`, () => {
    const { jqResult, fghResult, equal } = compareJqAndFgh(testCase.expression, testCase.input)
    
    if (!equal) {
      console.log('Expression:', testCase.expression)
      console.log('Input:', JSON.stringify(testCase.input, null, 2))
      console.log('jq result:', JSON.stringify(jqResult, null, 2))
      console.log('fgh result:', JSON.stringify(fghResult, null, 2))
    }
    
    assert.strictEqual(equal, true, `Results should be identical for expression: ${testCase.expression}`)
  })
}

// Test with more complex nested data
test('jq vs fgh: Complex nested data', () => {
  const complexData = {
    organization: {
      name: 'Acme Inc.',
      founded: 1985,
      departments: [
        {
          name: 'Engineering',
          employees: [
            { id: 1, name: 'Alice', role: 'Engineer', projects: ['Alpha', 'Beta'] },
            { id: 2, name: 'Bob', role: 'Senior Engineer', projects: ['Alpha', 'Gamma'] },
            { id: 3, name: 'Charlie', role: 'Lead Engineer', projects: ['Delta'] }
          ],
          budget: 1500000
        },
        {
          name: 'Marketing',
          employees: [
            { id: 4, name: 'David', role: 'Marketing Specialist', campaigns: 3 },
            { id: 5, name: 'Eve', role: 'Marketing Manager', campaigns: 7 }
          ],
          budget: 800000
        }
      ],
      active: true
    }
  }
  
  const expression = '.organization.departments[] | {dept: .name, employees: [.employees[].name], avgBudgetPerEmployee: (.budget / (.employees | length))}';
  
  const { jqResult, fghResult, equal } = compareJqAndFgh(expression, complexData)
  
  if (!equal) {
    console.log('Complex expression:', expression)
    console.log('jq result:', JSON.stringify(jqResult, null, 2))
    console.log('fgh result:', JSON.stringify(fghResult, null, 2))
  }
  
  assert.strictEqual(equal, true, 'Results should be identical for complex nested data')
})

// Test with an array at the root
test('jq vs fgh: Array at root', () => {
  const arrayData = [
    { id: 1, name: 'Alice', score: 95 },
    { id: 2, name: 'Bob', score: 87 },
    { id: 3, name: 'Charlie', score: 92 },
    { id: 4, name: 'David', score: 78 },
    { id: 5, name: 'Eve', score: 88 }
  ]
  
  const expression = '.[] | select(.score >= 90) | {name, grade: "A"}'
  
  const { jqResult, fghResult, equal } = compareJqAndFgh(expression, arrayData)
  
  if (!equal) {
    console.log('Array root expression:', expression)
    console.log('jq result:', JSON.stringify(jqResult, null, 2))
    console.log('fgh result:', JSON.stringify(fghResult, null, 2))
  }
  
  assert.strictEqual(equal, true, 'Results should be identical for array at root')
})

// Test with complex filtering and sorting
test('jq vs fgh: Filtering and sorting', () => {
  const data = {
    products: [
      { id: 1, name: 'Laptop', price: 1200, stock: 5, categories: ['electronics', 'computers'] },
      { id: 2, name: 'Phone', price: 800, stock: 15, categories: ['electronics', 'mobile'] },
      { id: 3, name: 'Desk', price: 350, stock: 8, categories: ['furniture', 'office'] },
      { id: 4, name: 'Monitor', price: 400, stock: 3, categories: ['electronics', 'computers'] },
      { id: 5, name: 'Chair', price: 250, stock: 20, categories: ['furniture', 'office'] }
    ]
  }
  
  // Find electronics with stock > 3, sort by price descending
  const expression = '.products | map(select(.categories[] == "electronics" and .stock > 3)) | sort_by(-.price) | [.[] | {name, price}]'
  
  const { jqResult, fghResult, equal } = compareJqAndFgh(expression, data)
  
  if (!equal) {
    console.log('Filtering expression:', expression)
    console.log('jq result:', JSON.stringify(jqResult, null, 2))
    console.log('fgh result:', JSON.stringify(fghResult, null, 2))
  }
  
  assert.strictEqual(equal, true, 'Results should be identical for filtering and sorting')
})

// Special test for error handling differences
test('jq vs fgh: Error tolerance comparison', () => {
  const data = { name: 'John', age: 30 }
  
  // This might fail in different ways between jq and fgh
  const expression = '.nonexistent.property'
  
  console.log('Note: This test compares error handling between jq and fgh')
  console.log('Results may differ due to how each tool handles missing properties')
  
  const { jqResult, fghResult, equal } = compareJqAndFgh(expression, data)
  
  // Just log the results without asserting - this is informational
  console.log('Expression:', expression)
  console.log('jq result:', JSON.stringify(jqResult, null, 2))
  console.log('fgh result:', JSON.stringify(fghResult, null, 2))
  console.log('Results match:', equal)
})
