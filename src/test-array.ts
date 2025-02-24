// A minimal empty array test

// Simple function that always returns an empty array
export function emptyArray() {
  return [];
}

// Query function that returns an empty array for [] expressions
export function query(expression: string, input: unknown): unknown {
  if (expression.trim() === '[]') {
    return emptyArray();
  }
  return input;
}
