import Ember from 'ember';
import { test, moduleFor } from 'ember-qunit';

import Pretender from 'pretender';


const {
  Logger: { log, error, info, warn },
  typeOf
} = Ember;

moduleFor('authenticator:userapp', {
  integration: false,
//  needs: ['authenticator:not-existing-authenticator'],
  beforeEach() {
//    this.register('authenticator:userapp', )
    // Initialize app
    UserApp.initialize({ appId: 'test_app_id'});
    // Create pretender server and return true for preflight
    this.pretenderServer = new Pretender();
    this.pretenderServer.register('OPTIONS', '/v1/*', function() {
      return [ 200, { "Content-Type": "application/json" }, "" ];
    });
  },

  afterEach() {
    this.pretenderServer.shutdown();
  },
});

test('authenticator it exists', function(assert) {
  let userappAuthenticator = this.subject();
  assert.ok(!!userappAuthenticator);
});

// test('authenticator authenticate should return a promise', function(assert) {
//   assert.ok(typeOf(this.subject().authenticate().then) === 'function');
// });

test('authenticator should fail on email not verified', function(assert) {
  let server = this.pretenderServer;
  server.post('/v1/user.login', function(request) {
    return [
      200,
      { "Content-Type": "application/json" },
      JSON.stringify({
        "token":"random_token",
        "user_id":"random_user_id",
        "lock_type":"EMAIL_NOT_VERIFIED",
        "locks":["EMAIL_NOT_VERIFIED"],
      })
    ];
  });

  var resolve = assert.async();
  assert.ok(
    this.subject()
    .authenticate('test_username', 'test_password')
    .then((response) => {
      resolve();
      info('Authenticate resolved');
    })
  );
});
