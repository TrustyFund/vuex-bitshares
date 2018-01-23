'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initApis = undefined;

var _api = require('../services/api');

var apis = _interopRequireWildcard(_api);

var _mutations = require('../mutations');

var types = _interopRequireWildcard(_mutations);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var initApis = exports.initApis = function initApis(_ref, callback) {
  var commit = _ref.commit;

  var connectionStatus = function connectionStatus(status) {
    switch (status) {
      case 'closed':
        commit(types.WS_DISCONNECTED);
        break;
      case 'error':
        commit(types.WS_ERROR);
        break;
      default:
    }
  };

  apis.initApis(connectionStatus).then(function () {
    commit(types.WS_CONNECTED);
    callback();
  });
};