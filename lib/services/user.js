'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Get = Get;

var _bitsharesjsWs = require('bitsharesjs-ws');

function Get(username) {
  return new Promise(function (resolve, reject) {
    _bitsharesjsWs.Apis.instance().db_api().exec('get_full_accounts', [[username], false]).then(function (users) {
      resolve(users);
    }).catch(function (error) {
      reject(error);
    });
  });
}