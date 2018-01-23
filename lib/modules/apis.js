'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mutations;

var _mutations2 = require('../mutations');

var types = _interopRequireWildcard(_mutations2);

var _apis = require('../actions/apis');

var actions = _interopRequireWildcard(_apis);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var initialState = {
  connected: false
};

var mutations = (_mutations = {}, _defineProperty(_mutations, types.WS_CONNECTED, function (state) {
  state.connected = true;
}), _defineProperty(_mutations, types.WS_DISCONNECTED, function (state) {
  state.connected = false;
}), _defineProperty(_mutations, types.WS_ERROR, function (state) {
  state.connected = false;
}), _mutations);

exports.default = {
  state: initialState,
  actions: actions,
  mutations: mutations
};