'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchUser = undefined;

var _mutations = require('../mutations');

var types = _interopRequireWildcard(_mutations);

var _api = require('../services/api');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var fetchUser = exports.fetchUser = function fetchUser(_ref, username) {
  var commit = _ref.commit;

  commit(types.FETCH_USER_REQUEST);
  _api.User.Get(username).then(function (result) {
    commit(types.FETCH_USER_COMPLETE, result[0][1]);
  }, function () {
    commit(types.FETCH_USER_ERROR);
  });
};