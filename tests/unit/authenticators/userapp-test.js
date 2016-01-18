import { test, moduleFor } from 'ember-qunit';

moduleFor('authenticator:userapp', {
  integration: false,
//  needs: ['authenticator:not-existing-authenticator'],
//  setup() {
////    this.register('authenticator:userapp', )
//    globalVariable = 'helloworld';
//    var internalVariable = 'helloworld';
//  },
});

test('it exists', function(assert) {
  let userappAuthenticator = this.subject();
  assert.ok(!!userappAuthenticator);
});
