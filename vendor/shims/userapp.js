(function() {
  function vendorModule() {
    'use strict';

    return { 'default': self['UserApp'] };
  }

  define('userapp', [], vendorModule);
})();
