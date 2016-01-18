import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import UserApp from 'userapp';

export default BaseAuthenticator.extend({
  /**
   * Authenticate the session.
   *
   * @method  authenticate
   * @param   {String}              login       The login name could be either email or username
   * @param   {String}              password    The user's password
   * @return  {Ember.RSVP.Promise}              A promise that when it resolves results in the session becoming authenticated
   * @public
   */
  authenticate(login, password) {

  },

  invalidate() {

  },

  restore() {

  }
});
