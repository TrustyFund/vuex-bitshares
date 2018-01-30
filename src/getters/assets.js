export function getAssets({ assets }) {
  return assets || {};
}

export function getDefaultAssetsNames({ defaultAssetsNames }) {
  return defaultAssetsNames;
}

export function getDefaultAssetsIds({ defaultAssetsIds }) {
  return defaultAssetsIds;
}

export function getAssetById({ assets }) {
  return (id) => ((assets && assets[id]) ? assets[id] : false);
}
