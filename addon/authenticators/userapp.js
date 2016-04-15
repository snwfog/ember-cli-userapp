import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import UserApp from 'userapp';

const { Logger: { log, error, info, warn },
        RSVP: { Promise },
        run } = Ember;

export default BaseAuthenticator.extend({
  /**
   * Authenticate the session.
   *
   * @method  authenticate
   * @param   {String}              login       Email or Username depending on user's setting
   * @param   {String}              password    The user's password
   * @return  {Ember.RSVP.Promise}              A promise that when it resolves results in the session becoming authenticated
   * @public
   */
  authenticate(login, password) {
    let _this = this;
    return new Promise((resolve, reject) => {
      // TODO: Run it once on the backburner
      UserApp.User.login({ login, password }, (error, result) => {
        if (error) {
          run(null, reject, error);
        } else {
          if (result.locks && result.locks.indexOf('EMAIL_NOT_VERIFIED') > -1) {
            UserApp.setToken(null);
            run(null, reject, { name: 'EMAIL_NOT_VERIFIED', message: 'User email is not verified' });
          } else if (result.locks && result.locks.length > 0) {
            UserApp.setToken(null);
            run(null, reject, { name: 'LOCKED', message: 'User account is locked.'
            });
          } else if (!result.token) {
            UserApp.setToken(null);
            run(null, reject, { name: 'CANNOT_FIND_TOKEN', message: 'Cannot find a valid token.'
            });
          } else {
            UserApp.setToken(result.token);
            run(null, resolve, result);
          }
        }
      });
    });
  },

  invalidate() {
    return new Promise((resolve, reject) => {
      UserApp.User.logout((error, result) => {
        if (error) {
          run(null, reject, error);
        } else {
          run(null, resolve, result);
        }
      });
    });
  },

  /**
   * Send a heartbeat request to server, if server reply success,
   * it means the token is still valid, then we resolve with success.
   */
  restore(userHash) {
    return new Promise(function (resolve, reject) {
      if (Ember.isEmpty(userHash.token) || Ember.isEmpty(userHash.user_id)) {
        run(null, reject, 'User session was not present.');
      }

      UserApp.Transport.Current.call({ token: userHash.token }, 1, 'token.heartbeat', {},
        function (error, result) {
          if (error || Ember.isEmpty(result.alive)) {
            UserApp.setToken(null);
            run(null, reject, error);
          } else {
            UserApp.setToken(userHash.token);
            run(null, resolve, userHash);
          }
        }
      );
    });
  }
});
