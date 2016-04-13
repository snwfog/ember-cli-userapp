import Ember from 'ember';
import ENV from '../config/environment';

const DEFAULT_USERAPP_CONFIG = {
  apiEndpoint:  'https://api.userapp.io',
  apiVersion:   1,
  apiSecure:    true,
};

export function initialize(app) {
  var userappAuthenticator = app.lookup('authenticator:userapp');
  var userappConfig = ENV['userapp-authenticator-config'];
  var apiEndpoint = userappConfig['apiEndpoint'] || DEFAULT_USERAPP_CONFIG['apiEndpoint'];
  var apiVersion = userappConfig['apiVersion'] || DEFAULT_USERAPP_CONFIG['apiVersion'];
  var apiAppId = userappConfig['apiAppId'];

  Ember.assert('All Userapp API config variable must be set.', !!apiEndpoint && !!apiVersion && !!apiAppId);
  userappAuthenticator.setProperties({ _apiEndpoint: apiEndpoint, _apiVersion: apiVersion, _appId: apiAppId });
}

export default {
  name: 'userapp-authenticator-initializer',
  initialize: initialize
};
