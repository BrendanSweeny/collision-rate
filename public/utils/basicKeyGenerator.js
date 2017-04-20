'use strict';

let globalKey = 0;

function generateKey () {
  globalKey += 1;
  return globalKey;
}

module.exports =  generateKey;
