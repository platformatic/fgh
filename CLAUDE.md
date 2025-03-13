# CLAUDE.md - FGH Project Guide

## Build & Test Commands
- Build: `npm run build`
- Clean build: `npm run clean && npm run build`
- Run all tests: `npm test`
- Run single test: `node --no-warnings --experimental-strip-types --test test/fgh.test.ts`
- Run specific test file: `node --no-warnings --experimental-strip-types --test test/comma-operator.test.ts`
- Lint: `npm run lint`
- Fix linting issues: `npm run lint:fix`
- Run examples: `npm run examples`
- Use the node-runner tool that you have available to run the npm scripts.

### Development CLI Usage

For development and testing of the CLI, you can run it directly from source:

```bash
# Basic usage (reads from stdin)
cat data.ndjson | node --no-warnings --experimental-strip-types src/cli/index.ts '.name'

# Read from file
node --no-warnings --experimental-strip-types src/cli/index.ts -f data.ndjson '.users[].name'

# Exit on first error
node --no-warnings --experimental-strip-types src/cli/index.ts -e -f data.ndjson '.complex.expression'
```

End-users should use the `fgh` command after installing the package globally.

## Code Style Guidelines
- Use TypeScript with proper type annotations
- Follow ES module import syntax (import/export)
- Use descriptive variable names in camelCase
- Document public functions with JSDoc comments
- Use functional programming patterns when possible
- Maintain clear separation between lexer, parser, and generator
- Handle errors with proper type checking and optional chaining
- Avoid tight coupling between components
- Follow neostandard ESLint rules
- Keep functions small and focused on a single responsibility
- never add special cases for specific inputs
