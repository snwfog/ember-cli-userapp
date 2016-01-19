import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import UserApp from 'userapp';

const {
        Logger: { log, error, info, warn },
        RSVP: { Promise }
        } = Ember;

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
      // Run it once on the backburner
      UserApp.User.login({ login, password }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          if (result.locks && result.locks.indexOf('EMAIL_NOT_VERIFIED') > -1) {
            UserApp.setToken(null);
            reject({
              name:    'EMAIL_NOT_VERIFIED',
              message: 'Please verify your email address by clicking on the link in the verification email that we\'ve sent you.'
            });
          } else if (result.locks && result.locks.length > 0) {
            UserApp.setToken(null);
            reject({ name: 'LOCKED', message: 'Your account has been locked.' });
          } else {
            if (!result.token) {
              reject({ name: 'CANNOT_FIND_TOKEN', message: 'Cannot find a valid token.'});
            }

            UserApp.setToken(result.token);
            _this
              ._load()
              .then((user) => {
                user.token = result.token;
                resolve(user);
              })
              .catch((error) => {
                reject(error);
              });
          }
        }
      });
    });
  },

  _load() {
    return new Promise((resolve, reject) => {
      UserApp.User.get({ user_id: 'self' }, (error, users) => {
        return !!(error) ? reject(error) : resolve(users[0]);
      });
    });
  },

  invalidate() {

  },

  restore() {

  }
});
