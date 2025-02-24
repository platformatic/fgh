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