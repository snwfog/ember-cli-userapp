import Ember from 'ember';
import { test, moduleFor } from 'ember-qunit';

import Pretender from 'pretender';
import UserApp from 'userapp';

const {
  Logger: { log, error, info, warn, debug },
  K,
  typeOf
} = Ember;

moduleFor('authenticator:userapp', {
  integration: false,
//  needs: ['authenticator:not-existing-authenticator'],
  beforeEach() {
//    this.register('authenticator:userapp', )
    // Initialize app
    UserApp.initialize({ appId: 'test_app_id' });
    // Create pretender server and return true for preflight
    this.pretenderServer = new Pretender();
    this.pretenderServer.register('OPTIONS', 'https://api.userapp.io/v1/*', function() {
      return [200, { "Content-Type": "application/json" }, ""];
    });
  },

  afterEach() {
    this.pretenderServer.shutdown();
  },
});

test('authenticator exists', function(assert) {
  let userappAuthenticator = this.subject();
  assert.ok(!!userappAuthenticator);
});

test('authenticator#authenticate should return a promise', function(assert) {
  let server = this.pretenderServer;
  server.post('https://api.userapp.io/v1/user.login', function(request) {
    return [ 200, { "Content-Type": "application/json" }, JSON.stringify({}) ];
  });

  var promise = this.subject().authenticate().catch((error) => {});
  assert.ok(typeOf(promise.then) === 'function');
});

test('authenticator#authenticate should fail on user email not verified', function(assert) {
  let server = this.pretenderServer;
  server.post('https://api.userapp.io/v1/user.login', function(request) {
    return [
      200,
      { "Content-Type": "application/json" },
      JSON.stringify({
        "token":     "random_token",
        "user_id":   "random_user_id",
        "lock_type": "EMAIL_NOT_VERIFIED",
        "locks":     ["EMAIL_NOT_VERIFIED"],
      })
    ];
  });

  var resolved = assert.async();
  var error;
  this.subject()
    .authenticate('test_username', 'test_password')
    .catch(({ name, message }) => {
      error = { name, message };
    })
    .finally(() => {
      assert.ok(error.name, 'EMAIL_NOT_VERIFIED');
      resolved();
    });
});

test('authenticator#authenticate should fail on user lock', function(assert) {
  let server = this.pretenderServer;
  server.post('https://api.userapp.io/v1/user.login', function(request) {
    return [
      200,
      { "Content-Type": "application/json" },
      JSON.stringify({
        "token":     "random_token",
        "user_id":   "random_user_id",
        "lock_type": "USER_ISSUED",
        "locks":     ["USER_ISSUED"],
      })
    ];
  });

  var resolved = assert.async();
  var error;
  this.subject()
    .authenticate('test_username', 'test_password')
    .catch(({ name, message }) => {
      error = { name, message };
    })
    .finally(() => {
      assert.ok(error.name, 'USER_ISSUED');
      resolved();
    });
});

test('authenticator#authenticate should return user with token on success login', function(assert) {
  let server = this.pretenderServer;
  server.post('https://api.userapp.io/v1/user.login', function(request) {
    return [
      200,
      { "Content-Type": "application/json" },
      JSON.stringify({
        "token":     "random_token",
        "user_id":   "random_user_id",
        "lock_type": "",
        "locks":     [],
      })
    ];
  });

  let mockUser = [{
    "user_id":        "random_user_id",
    "first_name":     "Test_User_First_Name",
    "last_name":      "Test_User_Last_Name",
    "email":          "test@userapp.io",
    "email_verified": false,
    "login":          "test@userapp.io",
    "properties":     {},
    "features":       {},
    "permissions":    {},
    "subscription":   null,
    "lock":           null,
    "locks":          [],
    "ip_address":     null,
    "last_login_at":  1453173581,
    "updated_at":     1453173581,
    "created_at":     1453135148
  }];

  debug(`Mock user is ${mockUser[0]}`);

  server.post('https://api.userapp.io/v1/user.get', function(request) {
    return [
      200,
      { "Content-Type": "application/json" },
      JSON.stringify(mockUser),
    ];
  });

  var resolved = assert.async();
  this.subject()
    .authenticate('test_username', 'test_password')
    .then(({ user }) => {
      assert.deepEqual(user, Ember.merge(mockUser[0], { token: 'random_token' }));
    })
    .finally(() => {
      resolved();
    });
});

test('authenticator#invalidate should return a promise', function(assert) {
  let server = this.pretenderServer;
  server.post('https://api.userapp.io/v1/user.logout', function(request) {
    return [ 200, { "Content-Type": "application/json" }, JSON.stringify({}) ];
  });

  let promise = this.subject().invalidate();
  assert.ok(typeOf(promise.then) === 'function');
});

test('authenticator#restore should return a promise', function(assert) {
  let server = this.pretenderServer;
  server.post('https://api.userapp.io/v1/token.heartbeat', function(request) {
    return [ 200, { "Content-Type": "application/json" }, JSON.stringify({ alive: true }) ];
  });

  var promise = this.subject().restore({ token: 'test_token' });
  assert.ok(typeOf(promise.then) === 'function');
});

test('authenticator#restore should be able to use current saved user authenticate information', function(assert) {
  let server = this.pretenderServer;


});
