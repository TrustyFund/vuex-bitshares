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


/**
 * Fetches assets objects from bitsharesjs-ws
 * @param {Array} assets - list of assets ids/symbold to fetch
 */
export const fetchAssets = ({ commit }, assets) => {
  commit(types.FETCH_ASSETS_REQUEST);
  return apis.getAssets(assets).then((result) => {
    commit(types.FETCH_ASSETS_COMPLETE, { assets: composeAssets(result) });
  }, () => {
    commit(types.FETCH_ASSETS_ERROR);
  });
};

/**
 * Fetches default assets
 * @param {Array} assets - list of assets ids/symbold to fetch
 */
export const fetchDefaultAssets = ({ commit, getters }) => {
  const defaultAssets = getters.getDefaultAssets;
  fetchAssets({ commit }, defaultAssets);
};

/**
 * Fetches history prices data for 7 days from bitsharesjs-ws.
   Prices are retrieved with base specified in store ( BTS by default )
 * @param {Object} assets - objects containing assets by id { <id> : <asset-object> }
 */
export const fetchAssetsPrices = ({ commit, getters }, assets) => {
  // base market = BTS
  const baseId = getters.getBaseMarketId;
  const base = getters.getAssetById(baseId);

  // preferred asset = USD
  const preferredAssetId = getters.getPreferredAssetId;
  const preferredAsset = getters.getAssetById(preferredAssetId);

  // add preferredAsset for fetching history prices data
  assets[preferredAssetId] = preferredAsset;

  // fetch requested assets history prices data
  Object.keys(assets).forEach(id => {
    const quote = assets[id];
    commit(types.FETCH_ASSET_PRICE_REQUEST, { id });
    apis.fetchStats(base, quote, 7, 3600).then((history) => {
      const prices = utils.formatPrices(utils.getPrices(history), base, quote);
      commit(types.FETCH_ASSET_PRICE_COMPLETE, {
        id: quote.id,
        data: {
          firstPrice: prices.first,
          lastPrice: prices.last
        }
      });
    }, () => {
      commit(types.FETCH_ASSET_PRICE_ERROR, { id });
    });
  });
};

