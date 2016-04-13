import base64 from '../../../utils/base64';
import { module, test } from 'qunit';

module('Unit | Utility | base64');

// Replace this with your real tests.
test('Base64 utility should work', function(assert) {
  assert.equal(base64('test_token'), 'dGVzdF90b2tlbg==');
});
