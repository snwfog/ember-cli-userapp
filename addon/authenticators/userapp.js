import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import UserApp from 'userapp';
import base64 from '../utils/base64';

const {
        Logger: { log, error, info, warn },
        RSVP: { Promise },
        run,
        } = Ember;

export default BaseAuthenticator.extend({
  _currentUser: null,
  _token:       null,
  _appId:       null,
  _apiVersion:  1,
  _apiEndpoint: 'https://api.userapp.io',

  _buildUrl(action) {
    var { _apiVersion, _apiEndpoint } = this.getProperties(['_apiVersion', '_apiEndpoint']);
    return `${_apiEndpoint}/v${_apiVersion}/${action}`;
  },

  _sendRequest(action, data, error, success) {
    var _this = this;
    return Ember.$.ajax(action, {
      error,
      success,
      data,
      dataType: 'json',
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': `Basic ${base64(_this.get('_appId'))}:${base64(_this.get('_token'))}` },
    });
  },

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
    var _this = this;
    return new Promise(function(resolve, reject) {
      // TODO: Run it once on the backburner
      var requestActionUrl = _this._buildUrl('user.login');
      _this._sendRequest(requestActionUrl, { login, password },
        function(jqXHR, status, error) {
          run(null, reject, { error_code: 'CONNECTION_ERROR', message: `Unable to load '${requestActionUrl}'`, });
        },

        function(result, status, jqXHR) {
          if (result['error_code'] && !Ember.isEmpty(result['error_code'])) { run(null, reject, result); }
          if (result.locks && result.locks.indexOf('EMAIL_NOT_VERIFIED') > -1) {
            // UserApp.setToken(null);
            _this.set('_token', null);
            run(null, reject, {
              name: 'EMAIL_NOT_VERIFIED',
              message: 'Please verify your email address and your email inbox for our verification email',
            });
          } else if (result.locks && result.locks.length > 0) {
            // UserApp.setToken(null);
            _this.set('_token', null);
            run(null, reject, { error_code: 'LOCKED', message: 'Your account has been locked.' });
          } else if (!result.token) {
            run(null, reject, { error_code: 'CANNOT_FIND_TOKEN', message: 'Cannot find a valid token.' });
          } else {
            // UserApp.setToken(result.token);
            _this.set('_token', result.token);
            _this._load()
            .then(function(user) {
                user.token = result.token;
                run(null, resolve, { user });
            })
            .catch(function(error) {
              _this.set('_token', null);
              run(null, reject, error);
            });
          }
        }
      );
    });
  },

  _load() {
    var _this = this;
    return new Promise(function(resolve, reject) {
      _this._sendRequest(_this._buildUrl('user.get'), { user_id: 'self' },
        function(jqXHR, status, error) {
          run(null, reject, { error_code: 'CONNECTION_ERROR', message: `Unable to load '${requestActionUrl}'`, });
        },
        function (result, status, jqXHR) {
          if (result['error_code'] && !Ember.isEmpty(result['error_code']))
            run(null, reject, result);
          else
            run(null, resolve, result[0]);
        }
      );
    });
  },

  invalidate() {
    var _this = this;
    return new Promise(function(resolve, reject) {
      var requestActionUrl = _this._buildUrl('user.logout');
      _this._sendRequest(requestActionUrl, {},
        function(jqXHR, status, error) {
          _this.set('_token', null);
          run(null, reject, { error_code: 'CONNECTION_ERROR', message: `Unable to load '${requestActionUrl}'`, });
        },

        function (result, status, jqXHR) {
          _this.set('_token', null);
          if (result['error_code'] && !Ember.isEmpty(result['error_code']))
            run(null, reject, result);
          else
            run(null, resolve, result[0]);
        }
      )
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
        run(null, reject, { error_code: 'TOKEN_NOT_PRESENT', message: 'User token id was not present.');
      }

      var requestActionUrl = _this._buildUrl('token.heartbeat');
      _this._sendRequest(requestActionUrl, { token: userHash.user.token },
        function(jqXHR, status, error) {
          _this.set('_token', null);
          run(null, reject, { error_code: 'CONNECTION_ERROR', message: `Unable to load '${requestActionUrl}'`, });
        },

        function (result, status, jqXHR) {
          if (result['error_code'] && !Ember.isEmpty(result['error_code']))
            run(null, reject, result);
          else {
            _this.set('_token', userHash.user.token);
            _this._load().then(function(user) {
              user.token = userHash.user.token;
              run(null, resolve, { user });
            })
            .catch(function (error) {
              _this.set('_token', null);
              run(null, reject, error);
            });
          }
        }
      );
    });
  }
});
