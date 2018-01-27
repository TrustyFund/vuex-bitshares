import * as types from '../mutations';
import * as apis from '../services/api';
import * as utils from '../services/utils';

const composeAssets = (assets) => {
  const composedAssets = {};
  assets.forEach((asset) => {
    composedAssets[asset.id] = asset;
  });
  return composedAssets;
};

export const fetchAssets = ({ commit }, assets) => {
  commit(types.FETCH_ASSETS_REQUEST);
  return apis.getAssets(assets).then((result) => {
    commit(types.FETCH_ASSETS_COMPLETE, { assets: composeAssets(result) });
  }, () => {
    commit(types.FETCH_ASSETS_ERROR);
  });
};

export const fetchDefaultAssets = ({ commit, getters }) => {
  const defaultAssets = getters.getDefaultAssets;
  fetchAssets({ commit }, defaultAssets);
};


export const fetchAssetsPrices = ({ commit, getters }, assets) => {
  const baseId = getters.getBaseMarketId;
  const preferredAssetId = getters.getPreferredAssetId;
  console.log(preferredAssetId);
  const base = getters.getAssetById(baseId);
  const preferredAsset = getters.getAssetById(preferredAssetId);

  // fetch base asset price in preferred asset
  commit(types.UPDATE_ASSET_PRICE_REQUEST, { id: preferredAssetId });
  commit(types.UPDATE_ASSET_PRICE_REQUEST, { id: baseId });

  apis.fetchStats(base, preferredAsset, 7, 3600).then((history) => {
    const prices = utils.formatPrices(utils.getPrices(history), base, preferredAsset);
    console.log(1 + base.symbol + ' = ' + 1 / prices.last + ' ' + preferredAsset.symbol);
    console.log(prices);
    commit(types.UPDATE_ASSET_PRICE_COMPLETE, {
      id: preferredAssetId,
      data: {
        firstPrice: prices.first,
        lastPrice: prices.last
      }
    });
    commit(types.UPDATE_ASSET_PRICE_COMPLETE, {
      id: baseId,
      data: {
        firstPrice: 1 / prices.first,
        lastPrice: 1 / prices.last
      }
    });
  });


  // fetch requested assets prices
  Object.keys(assets).forEach(id => {
    if (id === baseId) return;
    const quote = assets[id];
    commit(types.UPDATE_ASSET_PRICE_REQUEST, { id });
    apis.fetchStats(base, quote, 7, 3600).then((history) => {
      const prices = utils.formatPrices(utils.getPrices(history), base, quote);
      // console.log(base.symbol, quote);
      // console.log('PRICES', prices);
      console.log({
        id: quote.id,
        symbol: quote.symbol,
        firstPrice: prices.first,
        lastPrice: prices.last
      });
      commit(types.UPDATE_ASSET_PRICE_COMPLETE, {
        id: quote.id,
        data: {
          firstPrice: prices.first,
          lastPrice: prices.last
        }
      });
    });
  });
};

