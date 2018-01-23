"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUserName = getUserName;
exports.getAccountObject = getAccountObject;
exports.getBalances = getBalances;
function getUserName(_ref) {
  var account = _ref.account;

  return account && account.name;
}

function getAccountObject(_ref2) {
  var account = _ref2.account;

  // эта проверка здесь не имеет смысла, тк. если геттер ничего не вернет,
  // то при обращении к нему извне на выходе и так и так будет undefined
  return account;
}

function getBalances(_ref3) {
  var balances = _ref3.balances;

  return balances;
}