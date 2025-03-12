# Contributing to FGH

Thank you for your interest in contributing to FGH! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Run tests:
   ```bash
   npm test
   ```

## Project Structure

- `src/` - Source code
  - `fgh.ts` - Main entry point
  - `lexer.ts` - Tokenizes input strings
  - `parser.ts` - Parses tokens into an AST
  - `generator.ts` - Generates executable code from AST
  - `types.ts` - TypeScript type definitions
  - `helpers/` - Utility functions
- `test/` - Test files
- `examples/` - Example usage
- `benchmarks/` - Performance benchmarks
- `docs/` - Documentation

## Code Style Guidelines

1. Use TypeScript with proper type annotations
2. Follow ES module import syntax (import/export)
3. Use descriptive variable names in camelCase
4. Document public functions with JSDoc comments
5. Use functional programming patterns when possible
6. Maintain clear separation between lexer, parser, and generator
7. Handle errors with proper type checking and optional chaining
8. Avoid tight coupling between components
9. Follow neostandard ESLint rules
10. Keep functions small and focused on a single responsibility
11. Never add special cases for specific inputs

## Pull Request Process

1. Create a new branch for your feature or bugfix
2. Add tests for your changes
3. Ensure all tests pass with `npm test`
4. Run the linter with `npm run lint`
5. Update documentation if necessary
6. Submit a pull request with a clear description of the changes

## Testing

Tests are written using Node.js built-in test runner. To run tests:

```bash
npm test
```

To run a specific test file:

```bash
node --no-warnings --experimental-strip-types --test test/file-name.test.ts
```

## Feature Implementation Guidelines

When implementing a new feature:

1. First add types in `types.ts`
2. Add parsing logic in `parser.ts`
3. Implement code generation in `generator.ts`
4. Add helper functions in `helpers/` if needed
5. Write tests for the new feature
6. Add examples in the `examples/` directory
7. Update documentation in README.md and docs/

## Performance Considerations

FGH aims to be performant. Keep these guidelines in mind:

1. Use `compile()` for expressions that will be reused
2. Avoid unnecessary object creation in hot paths
3. Consider memory usage for large inputs
4. Profile your changes with the benchmarking tools:
   ```bash
   npm run benchmark
   ```

## Documentation

Please update documentation for any changes:

1. Update JSDoc comments for public functions
2. Add examples for new features
3. Update the README.md if necessary

## CLI Development

The CLI tool can be run directly from source during development using:

```bash
# Basic usage (reads from stdin)
cat data.ndjson | node --no-warnings --experimental-strip-types src/cli/index.ts '.name'

# Read from file
node --no-warnings --experimental-strip-types src/cli/index.ts -f data.ndjson '.users[].name'

# Exit on first error
node --no-warnings --experimental-strip-types src/cli/index.ts -e -f data.ndjson '.complex.expression'
```

This is useful for testing CLI changes during development, but end-users should use the globally installed `fgh` command.

## License

By contributing to FGH, you agree that your contributions will be licensed under the project's MIT license.
