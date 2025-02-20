import { test } from 'node:test';
import assert from 'node:assert';
import { JQParser } from '../src/parser.ts';
import { ParseError } from '../src/types.ts';

test('parser handles identity', () => {
  const parser = new JQParser('.');
  const ast = parser.parse();
  assert.deepEqual(ast, { type: 'Identity', position: 0 });
});

test('parser handles property access', () => {
  const parser = new JQParser('.foo');
  const ast = parser.parse();
  assert.deepEqual(ast, {
    type: 'PropertyAccess',
    position: 0,
    property: 'foo'
  });
});

test('parser handles array access', () => {
  const parser = new JQParser('[0]');
  const ast = parser.parse();
  assert.deepEqual(ast, {
    type: 'IndexAccess',
    position: 0,
    index: 0
  });
});

test('parser handles wildcard', () => {
  const parser = new JQParser('.*');
  const ast = parser.parse();
  assert.deepEqual(ast, { type: 'Wildcard', position: 0 });
});

test('parser handles pipe', () => {
  const parser = new JQParser('.foo | .bar');
  const ast = parser.parse();
  assert.deepEqual(ast, {
    type: 'Pipe',
    position: 0,
    left: {
      type: 'PropertyAccess',
      position: 0,
      property: 'foo'
    },
    right: {
      type: 'PropertyAccess',
      position: 7,
      property: 'bar'
    }
  });
});

test('parser handles optional', () => {
  const parser = new JQParser('.foo?');
  const ast = parser.parse();
  assert.deepEqual(ast, {
    type: 'Optional',
    position: 0,
    expression: {
      type: 'PropertyAccess',
      position: 0,
      property: 'foo'
    }
  });
});

test.skip('parser handles complex expressions', () => {
  const parser = new JQParser('.foo[0] | .bar.baz?');
  const ast = parser.parse();
  assert.deepEqual(ast, {
    type: 'Pipe',
    position: 0,
    left: {
      type: 'IndexAccess',
      position: 4,
      index: 0
    },
    right: {
      type: 'Optional',
      position: 7,
      expression: {
        type: 'PropertyAccess',
        position: 7,
        property: 'baz'
      }
    }
  });
});

test('parser throws on invalid input', () => {
  assert.throws(
    () => new JQParser('@invalid').parse(),
    ParseError
  );
});

test('parser throws on incomplete input', () => {
  assert.throws(
    () => new JQParser('[').parse(),
    ParseError
  );
});
