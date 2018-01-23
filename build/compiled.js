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
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAssetById = getAssetById;
exports.getAssetFieldById = getAssetFieldById;
function getAssetById(_ref) {
  var assets = _ref.assets;

  return function (id) {
    return assets && assets[id] ? assets[id] : false;
  };
}

function getAssetFieldById(_ref2) {
  var assets = _ref2.assets;

  return function (field, id) {
    return assets && assets[id] ? assets[id][field] : false;
  };
}
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
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var WS_CONNECTED = exports.WS_CONNECTED = 'WS_CONNECTED';
var WS_DISCONNECTED = exports.WS_DISCONNECTED = 'WS_DISCONNECTED';
var WS_ERROR = exports.WS_ERROR = 'WS_ERROR';

var FETCH_USER_REQUEST = exports.FETCH_USER_REQUEST = 'FETCH_USER_REQUEST';
var FETCH_USER_COMPLETE = exports.FETCH_USER_COMPLETE = 'FETCH_USER_COMPLETE';
var FETCH_USER_ERROR = exports.FETCH_USER_ERROR = 'FETCH_USER_ERROR';

var FETCH_ASSETS_REQUEST = exports.FETCH_ASSETS_REQUEST = 'FETCH_ASSETS_REQUEST';
var FETCH_ASSETS_COMPLETE = exports.FETCH_ASSETS_COMPLETE = 'FETCH_ASSETS_COMPLETE';
var FETCH_ASSETS_ERROR = exports.FETCH_ASSETS_ERROR = 'FETCH_ASSETS_ERROR';
var FETCH_DEFAULT_ASSETS_REQUEST = exports.FETCH_DEFAULT_ASSETS_REQUEST = 'FETCH_DEFAULT_ASSETS_REQUEST';
var FETCH_DEFAULT_ASSETS_COMPLETE = exports.FETCH_DEFAULT_ASSETS_COMPLETE = 'FETCH_DEFAULT_ASSETS_COMPLETE';
var FETCH_DEFAULT_ASSETS_ERROR = exports.FETCH_DEFAULT_ASSETS_ERROR = 'FETCH_DEFAULT_ASSETS_ERROR';
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
