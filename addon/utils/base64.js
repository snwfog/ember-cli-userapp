export default function base64(value) {
  var PADCHAR = '=';
  var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  var getbyte = function(s,i) {
      var x = s.charCodeAt(i);
      if (x > 255) {
          throw "INVALID_CHARACTER_ERR: DOM Exception 5";
      }
      return x;
  };

  var encode = function(s) {
      if (arguments.length != 1) {
          throw "SyntaxError: Not enough arguments";
      }

      var padchar = Base64.PADCHAR;
      var alpha   = Base64.ALPHA;
      var getbyte = Base64.getbyte;

      var i, b10;
      var x = [];

      // convert to string
      s = "" + s;

      var imax = s.length - s.length % 3;

      if (s.length == 0) {
          return s;
      }

      for (i = 0; i < imax; i += 3) {
          b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8) | getbyte(s,i+2);
          x.push(alpha.charAt(b10 >> 18));
          x.push(alpha.charAt((b10 >> 12) & 0x3F));
          x.push(alpha.charAt((b10 >> 6) & 0x3f));
          x.push(alpha.charAt(b10 & 0x3f));
      }

      switch (s.length - imax) {
          case 1:
              b10 = getbyte(s,i) << 16;
              x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
                     padchar + padchar);
              break;
          case 2:
              b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8);
              x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
                     alpha.charAt((b10 >> 6) & 0x3f) + padchar);
              break;
      }

      return x.join('');
  };

  return encode(value)
}
