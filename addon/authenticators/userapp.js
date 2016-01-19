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
    return new Promise((resolve, reject) => {
      // Run it once on the backburner
      UserApp.User.login({ login, password }, function() {
        info(arguments);
        resolve(true);
      });
    });
  },

  invalidate() {

  },

  restore() {

  }
});
