import { test } from 'node:test'
import { compile } from '../src/fgh.ts'

test('fgh', (t) => {
  t.assert.equal(typeof compile('.[0]'), 'function')
})

