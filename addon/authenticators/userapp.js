import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import UserApp from 'userapp';

const {
        Logger: { log, error, info, warn },
        RSVP: { Promise },
        run
        } = Ember;

export default BaseAuthenticator.extend({
  _currentUser: null,
  _token:       null,

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
            run(null, reject, {
              name: 'EMAIL_NOT_VERIFIED',
              message: 'Please verify your email address by clicking on the link in the verification email that we\'ve sent you.'
            });
          } else if (result.locks && result.locks.length > 0) {
            UserApp.setToken(null);
            run(null, reject, {
              name:    'LOCKED',
              message: 'Your account has been locked.'
            });
          } else if (!result.token) {
            run(null, reject, {
              name:    'CANNOT_FIND_TOKEN',
              message: 'Cannot find a valid token.'
            });
          } else {
            UserApp.setToken(result.token);
            _this._load().then((user) => {
                user.token = result.token;
                run(null, resolve, { user });
              })
              .catch((error) => {
                run(null, reject, error);
              });
          }
        }
      });
    });
  },

  _load() {
    return new Promise((resolve, reject) => {
      UserApp.User.get({ user_id: 'self' }, (error, users) => {
        if (error) {
          run(null, reject, error);
        } else {
          run(null, resolve, users[ 0 ]);
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
    var _this = this;
    return new Promise(function (resolve, reject) {
      if (Ember.isEmpty(userHash.user) || Ember.isEmpty(userHash.user.token)) {
        run(null, reject, 'User token id was not present.');
      }

      UserApp.Transport.Current.call({ token: userHash.user.token }, 1, 'token.heartbeat', {},
        function (error, result) {
          if (error) {
            run(null, reject, error);
          } else {
            UserApp.setToken(userHash.user.token);
            _this._load().then(function (user) {
                user.token = userHash.user.token;
                run(null, resolve, { user });
              })
              .catch(function (error) {
                run(null, reject, error);
              });
          }
        });
    });
  }
});
