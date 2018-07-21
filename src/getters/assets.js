/**
 * Returns object with all assets
 */
export function getAssets({ assets }) {
  return assets || {};
}

/**
 * Returns array with default assets ids
 */
export function getDefaultAssetsIds({ defaultAssetsIds }) {
  return defaultAssetsIds;
}

/**
 * Returns function to get asset by id
 */
export function getAssetById({ assets }) {
  return (id) => ((assets && assets[id]) ? assets[id] : {
    symbol: '...',
    precision: 1
  });
}

export function getHideList({ hiddenAssetsIds }) {
  return hiddenAssetsIds;
}