import { test } from 'node:test';
import assert from 'node:assert';
import { JQError, ParseError, ExecutionError } from '../src/types.ts';

test('JQError should be properly constructed', () => {
  const error = new JQError('test error');
  assert.equal(error.message, 'test error');
  assert.equal(error.name, 'JQError');
});

test('ParseError should include position information', () => {
  const error = new ParseError('unexpected token', 5);
  assert.equal(error.message, 'Parse error at position 5: unexpected token');
  assert.equal(error.name, 'ParseError');
});

test('ExecutionError should be properly constructed', () => {
  const error = new ExecutionError('execution failed');
  assert.equal(error.message, 'execution failed');
  assert.equal(error.name, 'ExecutionError');
});
