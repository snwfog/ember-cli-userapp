import Ember from 'ember';

const { Logger: { debug, error } } = Ember;

export default Ember.Route.extend({
  actions: {
    authenticate() {
      let { identification, password } =
        this.controller.getProperties('identification password'.w());

      this.get('session').authenticate('authenticator:userapp', identification, password).catch((reason) => {
        error(reason);
      });
    }
  }
})
