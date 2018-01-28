import * as types from '../mutations';
import * as apis from '../services/api';
import * as utils from '../services/utils';
import { arrayToObject } from '../utils';

/**
 * Fetches assets objects from bitsharesjs-ws
 * @param {Array} assets - list of assets ids/symbold to fetch
 */
export const fetchAssets = ({ commit }, assets) => {
  commit(types.FETCH_ASSETS_REQUEST);
  return new Promise((resolve, reject) => {
    return apis.getAssets(assets).then((result) => {
      const composedResult = arrayToObject(result);
      commit(types.FETCH_ASSETS_COMPLETE, { assets: composedResult });
      resolve(composedResult);
    }, () => {
      commit(types.FETCH_ASSETS_ERROR);
      reject();
    });
  });
};

/**
 * Fetches default assets objects via fetchAssets function
 to save default assets ids
 */
export const fetchDefaultAssets = ({ commit, getters }) => {
  const defaultAssetsNames = getters.getDefaultAssetsNames;
  fetchAssets({ commit }, defaultAssetsNames).then(result => {
    const ids = Object.keys(result);
    commit(types.SAVE_DEFAULT_ASSETS_IDS, { ids });
  });
};


export const fetchAssetPrice = ({ commit }, { base, quote }) => {
  const { id } = quote;
  commit(types.FETCH_ASSET_PRICE_REQUEST, { id });
  return new Promise((resolve, reject) => {
    apis.fetchStats(base, quote, 7, 3600).then((history) => {
      const prices = utils.formatPrices(utils.getPrices(history), base, quote);
      const result = {
        firstPrice: prices.first,
        lastPrice: prices.last
      };
      commit(types.FETCH_ASSET_PRICE_COMPLETE, {
        id,
        data: result
      });
      resolve(result);
    }, () => {
      commit(types.FETCH_ASSET_PRICE_ERROR, { id });
      reject();
    });
  });
};


/**
 * Fetches history prices data for 7 days from bitsharesjs-ws.
   Prices are retrieved with base specified in store ( BTS by default )
 * @param {Object} assets - objects containing assets by id { <id> : <asset-object> }
 */
export const fetchAssetsPrices = (store, assets) => {
  const { getters } = store;

  // base market = BTS
  const baseId = getters.getBaseMarketId;
  const base = getters.getAssetById(baseId);

  // preferred asset = USD
  const preferredAssetId = getters.getPreferredAssetId;
  const preferredAsset = getters.getAssetById(preferredAssetId);

  // fetch preferred asset first
  fetchAssetPrice(store, { base, quote: preferredAsset }).then((result) => {
    console.log('preferred asset ( USD ) history: ');
    console.log(result.firstPrice, result.lastPrice);
    console.log('first multiplier for BTS -> USD: ', 1 / result.firstPrice);
    console.log('last multiplier for BTS -> USD ', 1 / result.lastPrice);

    // fetch requested assets history prices data
    Object.keys(assets).forEach(id => {
      const quote = assets[id];
      fetchAssetPrice(store, { base, quote }).then((result) => {

      });
    });
  });
};

