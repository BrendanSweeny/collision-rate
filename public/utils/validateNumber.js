'use strict';

module.exports = validateNumber;

// Checks that input does not contain any alpha numeric or non-period symbol characters
// Takes a string containing a number
function validateNumber (inputVal) {
  let inputNum = Number(inputVal);
  if (inputNum || inputVal === '' || inputVal === '.' || Number.isInteger(inputNum)) {
    return true;
  }
  return false;
}
