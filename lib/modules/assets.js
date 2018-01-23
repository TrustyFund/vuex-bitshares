'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mutations;

var _mutations2 = require('../mutations');

var types = _interopRequireWildcard(_mutations2);

var _assets = require('../actions/assets');

var actions = _interopRequireWildcard(_assets);

var _assets2 = require('../getters/assets');

var getters = _interopRequireWildcard(_assets2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var initialState = {
  assets: null,
  pending: false
};

var mutations = (_mutations = {}, _defineProperty(_mutations, types.FETCH_ASSETS_REQUEST, function (state) {
  state.pending = true;
}), _defineProperty(_mutations, types.FETCH_ASSETS_COMPLETE, function (state, _ref) {
  var assets = _ref.assets;

  state.assets = assets;
}), _defineProperty(_mutations, types.FETCH_ASSETS_ERROR, function (state) {
  state.pending = false;
}), _defineProperty(_mutations, types.FETCH_DEFAULT_ASSETS_REQUEST, function (state) {
  state.pending = true;
}), _defineProperty(_mutations, types.FETCH_DEFAULT_ASSETS_COMPLETE, function (state, _ref2) {
  var assets = _ref2.assets;

  state.assets = assets;
}), _defineProperty(_mutations, types.FETCH_DEFAULT_ASSETS_ERROR, function (state) {
  state.pending = false;
}), _mutations);

exports.default = {
  state: initialState,
  actions: actions,
  mutations: mutations,
  getters: getters
};