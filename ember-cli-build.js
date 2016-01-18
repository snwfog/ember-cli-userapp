/*jshint node:true*/
/* global require, module */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    // Disable jshint test for now
    'babel': { optional: ['es7.decorators'] },
    'ember-cli-qunit': { useLintTree: false },

    // Enable pretender test mock server
    pretender: { enabled: true }
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  app.import(app.bowerDirectory + '/userapp/userapp.client.js');
  app.import('./vendor/shims/userapp.js');

  return app.toTree();
};
