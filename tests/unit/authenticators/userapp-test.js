import { test, moduleFor } from 'ember-qunit';

import Pretender from 'pretender';

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

test('authenticator should fail on email not verified', function(assert) {
  let server = new Pretender(function() {
    this.post('/user.login', function(request) {
      let error = {
        "token":"6Tla5m0AS0S-7__o8WkPqw",
        "user_id":"fL2HGWUMTbac5mPN40kq5g",
        "lock_type":"EMAIL_NOT_VERIFIED",
        "locks":["EMAIL_NOT_VERIFIED"],
      };

      return [
        200,
        { "Content-Type": "application/json" },
        JSON.stringify(error)
      ];
    });
  });
});
