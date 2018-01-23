'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.User = exports.getAssets = exports.initApis = undefined;

var _bitsharesjsWs = require('bitsharesjs-ws');

var _user = require('./user');

var User = _interopRequireWildcard(_user);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var initApis = exports.initApis = function initApis(statusCallback) {
  var wsString = 'wss://bitshares.openledger.info/ws';
  _bitsharesjsWs.Apis.setRpcConnectionStatusCallback(statusCallback);
  return _bitsharesjsWs.Apis.instance(wsString, true).init_promise;
};

var getAssets = exports.getAssets = function getAssets(assets) {
  return new Promise(function (resolve, reject) {
    _bitsharesjsWs.Apis.instance().db_api().exec('lookup_asset_symbols', [assets]).then(function (assetObjects) {
      resolve(assetObjects);
    }).catch(function (error) {
      reject(error);
    });
  });
};

exports.User = User;