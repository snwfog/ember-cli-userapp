import Ember from 'ember';

const { debug } = Ember.Logger;

export default Ember.Route.extend({
  actions: {
    login() {
      let session = this.get('session');
      session.authenticate('authenticator:userapp').then(() => {
        debug('Yay, we are in');
      });
    },

    logout() {
      this.get('session').invalidate('authenticator:userapp').then(() => {
        debug('Aight, we are out');
      });
    }
  }
});
