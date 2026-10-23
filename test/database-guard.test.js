import test from 'node:test';
import assert from 'node:assert/strict';
import { assertTestDatabase } from '../template/scripts/test-db.mjs';

test('test guard inspects parsed database and user, not URL suffixes', () => {
  assert.doesNotThrow(() => assertTestDatabase('postgresql://app_test:pw@localhost:5433/demo_test?schema=public'));
  for (const value of [undefined, 'bad', 'postgresql://app:pw@localhost/demo_test', 'postgresql://app_test:pw@localhost/production?schema=_test', 'postgresql://app_test:pw@localhost/production#_test', 'https://app_test:pw@localhost/demo_test']) {
    assert.throws(() => assertTestDatabase(value));
  }
});
