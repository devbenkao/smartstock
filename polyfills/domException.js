'use strict';
// DOMException is expected as a Hermes built-in in RN 0.81.x but is missing
// from Expo Go 54.0.0's bundled Hermes. Polyfill it as a global before any
// module that references it (e.g. expo/virtual/streams.js) is evaluated.
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name != null ? name : 'Error';
      this.code = 0;
    }
  };
}
