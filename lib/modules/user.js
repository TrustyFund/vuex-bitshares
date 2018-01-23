'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mutations;

var _mutations2 = require('../mutations');

var types = _interopRequireWildcard(_mutations2);

var _user = require('../actions/user');

var actions = _interopRequireWildcard(_user);

var _user2 = require('../getters/user');

var getters = _interopRequireWildcard(_user2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var initialState = {
  account: null,
  balances: [],
  pending: false
};

var mutations = (_mutations = {}, _defineProperty(_mutations, types.FETCH_USER_REQUEST, function (state) {
  state.pending = true;
}), _defineProperty(_mutations, types.FETCH_USER_COMPLETE, function (state, result) {
  state.account = result.account;
  state.balances = result.balances;
  state.pending = false;
}), _defineProperty(_mutations, types.FETCH_USER_ERROR, function (state) {
  state.pending = false;
}), _mutations);

exports.default = {
  state: initialState,
  actions: actions,
  getters: getters,
  mutations: mutations
};