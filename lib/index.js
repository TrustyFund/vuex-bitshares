'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = install;

var _apis = require('./modules/apis');

var _apis2 = _interopRequireDefault(_apis);

var _user = require('./modules/user');

var _user2 = _interopRequireDefault(_user);

var _assets = require('./modules/assets');

var _assets2 = _interopRequireDefault(_assets);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function install(store) {
  store.registerModule('apis', _apis2.default);
  store.registerModule('user', _user2.default);
  store.registerModule('assets', _assets2.default);
}