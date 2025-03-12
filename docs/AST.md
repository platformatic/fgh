# Working with the FGH Abstract Syntax Tree (AST)

This document explains how to work with the Abstract Syntax Tree (AST) representation in FGH, enabling advanced use cases like AST analysis, transformation, and programmatic generation of queries.

## Introduction

The AST is a tree structure that represents the parsed form of a JQ expression. Each node in the tree corresponds to a specific operation or element in the query language. Using the `parse()` and `compileFromAST()` functions, you can separate the parsing and compilation steps, allowing you to inspect and modify the AST between these stages.

## Basic Usage

```typescript
import { parse, compileFromAST } from 'fgh';

// Parse a JQ expression into an AST
const ast = parse('.users[].name');

// Inspect or modify the AST
console.log(JSON.stringify(ast, null, 2));

// Compile the AST into an executable function
const fn = compileFromAST(ast);

// Execute the compiled function
const result = fn({ users: [{ name: 'John' }, { name: 'Jane' }] });
// => ['John', 'Jane']
```

## AST Structure

The AST consists of nodes, where each node has a `type` property indicating its operation, and additional properties specific to that type. Here's a simplified overview of the main node types:

### Core Node Types

#### Identity Node
Represents the identity operation (`.`).

```typescript
{
  type: 'Identity',
  position: 0
}
```

#### Property Access Node
Represents property access (`.property`).

```typescript
{
  type: 'PropertyAccess',
  position: 0,
  property: 'name'  // The property being accessed
}
```

#### Index Access Node
Represents array index access (`[index]`).

```typescript
{
  type: 'IndexAccess',
  position: 5,
  index: 0,  // The index being accessed
  input: { ... }  // Optional: the expression being indexed
}
```

#### Pipe Node
Represents the pipe operator (`|`).

```typescript
{
  type: 'Pipe',
  position: 0,
  left: { ... },  // The expression on the left of the pipe
  right: { ... }  // The expression on the right of the pipe
}
```

#### Array Iteration Node
Represents array iteration (`[]`).

```typescript
{
  type: 'ArrayIteration',
  position: 0,
  input: { ... }  // Optional: the expression being iterated
}
```

#### Optional Node
Represents optional property access (`?`).

```typescript
{
  type: 'Optional',
  position: 0,
  expression: { ... }  // The expression being made optional
}
```

#### Slice Node
Represents array slicing (`[start:end]`).

```typescript
{
  type: 'Slice',
  position: 0,
  start: 1,  // Starting index (can be null)
  end: 3,    // Ending index (can be null)
  input: { ... }  // Optional: the expression being sliced
}
```

#### Object Construction Node
Represents object construction (`{ ... }`).

```typescript
{
  type: 'ObjectConstruction',
  position: 0,
  fields: [
    { 
      type: 'ObjectField',
      position: 1,
      key: 'name',  // Or can be an AST node for dynamic keys
      value: { ... },  // The value expression
      isDynamic: false  // Whether the key is dynamic
    },
    // More fields...
  ]
}
```

#### Array Construction Node
Represents array construction (`[ ... ]`).

```typescript
{
  type: 'ArrayConstruction',
  position: 0,
  elements: [
    { ... },  // First element expression
    { ... }   // Second element expression
    // More elements...
  ]
}
```

### Operator Nodes

#### Arithmetic Operators
- `Sum`: Addition operator (`+`)
- `Difference`: Subtraction operator (`-`)
- `Multiply`: Multiplication operator (`*`)
- `Divide`: Division operator (`/`)
- `Modulo`: Modulo operator (`%`)

```typescript
{
  type: 'Sum',  // (or any other arithmetic operator)
  position: 0,
  left: { ... },  // Left operand
  right: { ... }  // Right operand
}
```

#### Comparison Operators
- `GreaterThan`: Greater than operator (`>`)
- `GreaterThanOrEqual`: Greater than or equal operator (`>=`)
- `LessThan`: Less than operator (`<`)
- `LessThanOrEqual`: Less than or equal operator (`<=`)
- `Equal`: Equal operator (`==`)
- `NotEqual`: Not equal operator (`!=`)

```typescript
{
  type: 'Equal',  // (or any other comparison operator)
  position: 0,
  left: { ... },  // Left operand
  right: { ... }  // Right operand
}
```

#### Logical Operators
- `And`: Logical AND operator (`and`)
- `Or`: Logical OR operator (`or`)
- `Not`: Logical NOT operator (`not`)

```typescript
{
  type: 'And',  // (or 'Or')
  position: 0,
  left: { ... },  // Left operand
  right: { ... }  // Right operand
}

// For 'Not':
{
  type: 'Not',
  position: 0,
  expression: { ... }  // The expression being negated
}
```

### Filter Nodes

#### Map Filter Node
Represents the `map()` filter.

```typescript
{
  type: 'MapFilter',
  position: 0,
  filter: { ... }  // The filter expression
}
```

#### Select Filter Node
Represents the `select()` filter.

```typescript
{
  type: 'SelectFilter',
  position: 0,
  condition: { ... }  // The condition expression
}
```

#### Conditional Node
Represents the if-then-else construct.

```typescript
{
  type: 'Conditional',
  position: 0,
  condition: { ... },   // The condition expression
  thenBranch: { ... },  // The 'then' branch
  elseBranch: { ... }   // The 'else' branch (optional)
}
```

## Creating and Modifying ASTs Programmatically

You can create or modify ASTs programmatically by constructing the appropriate node objects:

```typescript
import { compileFromAST } from 'fgh';
import type { ASTNode } from 'fgh';

// Create a simple AST for .users[].name
const ast: ASTNode = {
  type: 'Pipe',
  position: 0,
  left: {
    type: 'PropertyAccess',
    position: 0,
    property: 'users'
  },
  right: {
    type: 'Pipe',
    position: 0,
    left: {
      type: 'ArrayIteration',
      position: 0
    },
    right: {
      type: 'PropertyAccess',
      position: 0,
      property: 'name'
    }
  }
};

// Compile the AST into a function
const fn = compileFromAST(ast);

// Execute the function
const result = fn({ users: [{ name: 'John' }, { name: 'Jane' }] });
// => ['John', 'Jane']
```

## Analyzing ASTs

You can analyze the structure of an AST to understand the query or to validate it:

```typescript
import { parse } from 'fgh';

// Parse a JQ expression
const ast = parse('.users[] | select(.age > 18) | .name');

// Recursively analyze the AST
function analyzeAST(node, depth = 0) {
  const indent = ' '.repeat(depth * 2);
  console.log(`${indent}Type: ${node.type}`);
  
  // Process specific node properties based on type
  switch (node.type) {
    case 'PropertyAccess':
      console.log(`${indent}Property: ${node.property}`);
      if (node.input) analyzeAST(node.input, depth + 1);
      break;
    case 'Pipe':
      console.log(`${indent}Left:`);
      analyzeAST(node.left, depth + 1);
      console.log(`${indent}Right:`);
      analyzeAST(node.right, depth + 1);
      break;
    // Handle other node types...
  }
}

analyzeAST(ast);
```

## Use Cases

### 1. Query Analysis and Validation

Parse queries and analyze their structure to ensure they meet certain criteria or constraints.

### 2. Query Transformation

Parse a query, modify its AST (e.g., adding additional filters or transformations), and then compile it.

### 3. Query Generation

Programmatically build ASTs for complex queries based on runtime conditions, user input, or other dynamic factors.

### 4. Custom Query Execution Strategies

Implement custom execution strategies by traversing the AST yourself and applying custom logic for specific node types.

## Type Definitions

For TypeScript users, FGH exports type definitions for all AST node types. You can import them directly from the package:

```typescript
import type { 
  // Base types
  ASTNode, BaseNode, NodeType,
  
  // Specific node types
  IdentityNode, PropertyAccessNode, IndexAccessNode,
  PipeNode, OptionalNode, SequenceNode,
  ArrayIterationNode, SliceNode, ObjectConstructionNode,
  // ...and many more
} from 'fgh';
```

Refer to the `types.ts` file for the complete set of type definitions.

## Best Practices

1. **Preserve Position Information**: When creating or modifying nodes, include realistic `position` values to ensure error messages are helpful.

2. **Validate ASTs**: Before compiling, validate that the AST structure is sound and follows the expected patterns.

3. **Prefer High-Level APIs**: For most use cases, it's simpler to use string expressions with the standard `compile()` function. Only use AST manipulation when you need fine-grained control.

4. **Document AST Transformations**: When implementing AST transformations, document the expected input and output patterns clearly.
