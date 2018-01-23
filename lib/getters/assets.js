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