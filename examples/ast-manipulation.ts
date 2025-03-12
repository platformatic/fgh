/**
 * AST Manipulation Example
 * 
 * This example demonstrates how to:
 * 1. Parse a JQ expression into an AST
 * 2. Examine the AST structure
 * 3. Modify the AST programmatically
 * 4. Compile the modified AST into a function
 * 5. Execute the function on input data
 * 
 * Note: FGH exports type definitions for all AST node types, which provides
 * strong typing when working with the AST programmatically.
 */

import { parse, compileFromAST } from '../src/fgh.ts';
import type { 
  ASTNode, PipeNode, SelectFilterNode, GreaterThanNode, 
  PropertyAccessNode, LiteralNode 
} from '../src/fgh.ts';

// Sample data to query
const data = {
  users: [
    { name: 'John', role: 'user', age: 28 },
    { name: 'Jane', role: 'admin', age: 34 },
    { name: 'Mike', role: 'user', age: 19 },
    { name: 'Sarah', role: 'admin', age: 42 }
  ]
};

// Define our original query
const originalQuery = '.users[] | select(.role == "admin") | .name';

// Parse the query into an AST
const ast = parse(originalQuery);

// Display the AST structure
console.log('Original AST structure:');
console.log(JSON.stringify(ast, null, 2));
console.log('\n');

// Function to modify the AST - we'll add an additional filter to only select admins over 35
function addAgeFilter(node: ASTNode): ASTNode {
  // If this is a select filter node that checks for role == "admin"
  if (node.type === 'Pipe') {
    const pipeNode = node as PipeNode;
    // Check if the right part is a SelectFilter with role == "admin" condition
    const rightPart = pipeNode.right;
    if (rightPart.type === 'SelectFilter') {
      const selectNode = rightPart as SelectFilterNode;
      // Create a new condition that also checks for age > 35
      const ageCondition: GreaterThanNode = {
        type: 'GreaterThan',
        position: selectNode.position,
        left: {
          type: 'PropertyAccess',
          position: selectNode.position,
          property: 'age'
        } as PropertyAccessNode,
        right: {
          type: 'Literal',
          position: selectNode.position,
          value: 35
        } as LiteralNode
      };
      
      const ageFilterNode: SelectFilterNode = {
        type: 'SelectFilter',
        position: selectNode.position,
        condition: ageCondition
      };

      // Replace the original pipe structure to add our age filter
      return {
        type: 'Pipe',
        position: pipeNode.position,
        left: pipeNode.left,
        right: {
          type: 'Pipe',
          position: pipeNode.right.position,
          left: pipeNode.right,
          right: ageFilterNode
        }
      } as PipeNode;
    }
  }

  // For non-pipe nodes or pipes we're not interested in, recurse through their properties
  if (node.type === 'Pipe') {
    const pipeNode = node as PipeNode;
    return {
      ...pipeNode,
      left: addAgeFilter(pipeNode.left),
      right: addAgeFilter(pipeNode.right)
    } as PipeNode;
  }

  // Return other node types unchanged
  return node;
}

// Apply our AST transformation
const modifiedAst = addAgeFilter(ast);

// Display the modified AST
console.log('Modified AST structure:');
console.log(JSON.stringify(modifiedAst, null, 2));
console.log('\n');

// Compile the original AST
const originalFn = compileFromAST(ast);
console.log('Original query result:');
console.log(originalFn(data));
console.log('\n');

// Compile the modified AST
const modifiedFn = compileFromAST(modifiedAst);
console.log('Modified query result (only admins over 35):');
console.log(modifiedFn(data));

// What this demonstrates:
// 1. We can parse a query into an AST to understand its structure
// 2. We can programmatically modify the AST to change the query's behavior
// 3. We can compile modified ASTs to create custom query functions
