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

// retrieves prices history for asset by id
export function getAssetPricesById({ prices }) {
  return (id) => {
    if ((prices[id] && !prices[id].fetching)) return prices[id];
    return { firstPrice: 0, lastPrice: 0 };
  };
}
// USD by defaul
export function getPreferredAssetId(state) {
  return state.preferredAssetId;
}

// prices multiplier to convert preferred asset currency
export function getPricesMultiplier(state) {
  const preferredAssetId = getPreferredAssetId(state);
  const prices = getAssetPricesById(state)(preferredAssetId);
  return {
    first: 1 / (prices.firstPrice || 1),
    last: 1 / (prices.lastPrice || 1)
  };
}

// BTS by default
export function getBaseMarketId(state) {
  return state.baseMarketId;
}

// retrieves whole prices history array
export function getAssetsPrices({ prices }) {
  return prices;
}
