/* jshint node: true */
'use strict';
var util = require('util');

module.exports = {
  name:     'ember-cli-userapp',
  included: function(app) {
    this._super.included(app);
//    this.ui.writeLine(util.inspect(app));
  }
};
