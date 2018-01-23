'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchDefaultAssets = exports.fetchAssets = undefined;

var _mutations = require('../mutations');

var types = _interopRequireWildcard(_mutations);

var _api = require('../services/api');

var apis = _interopRequireWildcard(_api);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var composeAssets = function composeAssets(assets) {
  var composedAssets = {};
  assets.forEach(function (asset) {
    composedAssets[asset.id] = asset;
  });
  return composedAssets;
};

var fetchAssets = exports.fetchAssets = function fetchAssets(_ref, assets) {
  var commit = _ref.commit;

  commit(types.FETCH_ASSETS_REQUEST);
  apis.getAssets(assets).then(function (result) {
    commit(types.FETCH_ASSETS_COMPLETE, { assets: composeAssets(result) });
  }, function () {
    commit(types.FETCH_ASSETS_ERROR);
  });
};

var fetchDefaultAssets = exports.fetchDefaultAssets = function fetchDefaultAssets(_ref2) {
  var commit = _ref2.commit;

  //  TODO MOVE TO CONFIG DEFAULT ASSETS
  var defaultAssets = ['BTS', 'OPEN.EOS', 'USD', 'OPEN.OMG', 'CNY', 'OPEN.LTC', 'OPEN.EOS', 'TRFND', 'OPEN.BTC', 'ARISTO', 'ARCOIN'];
  commit(types.FETCH_DEFAULT_ASSETS_REQUEST);
  apis.getAssets(defaultAssets).then(function (result) {
    commit(types.FETCH_DEFAULT_ASSETS_COMPLETE, {
      assets: composeAssets(result)
    });
  }, function () {
    commit(types.FETCH_DEFAULT_ASSETS_ERROR);
  });
};