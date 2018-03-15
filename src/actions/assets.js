import * as types from '../mutations';
import API from '../services/api';
import { arrayToObject } from '../utils';
import config from '../../config';

/**
 * Fetches assets objects from bitsharesjs-ws
 * @param {Array} assets - list of assets ids/symbold to fetch
 */
export const fetchAssets = async (store, { assets }) => {
  const { commit, getters } = store;
  const currentAssetsIds = Object.keys(getters.getAssets);

  // filter out existing assets
  const filteredAssets = assets.filter(id => currentAssetsIds.indexOf(id) === -1);

  commit(types.FETCH_ASSETS_REQUEST);
  const result = await API.Assets.fetch(filteredAssets);
  if (result) {
    result.forEach(asset => {
      if (asset.symbol.substring(0, 5) === 'OPEN.') {
        asset.symbol = asset.symbol.slice(5);
      }
    });
    const composedResult = arrayToObject(result);

    commit(types.FETCH_ASSETS_COMPLETE, { assets: composedResult });
    return composedResult;
  }
  commit(types.FETCH_ASSETS_ERROR);
  return null;
};

/**
 * Fetches default assets objects via fetchAssets function
 to save default assets ids
 */
export const fetchDefaultAssets = async (store) => {
  const { commit } = store;
  const { defaultAssetsNames } = config;
  const assets = await fetchAssets(store, { assets: defaultAssetsNames });
  if (assets) {
    const ids = Object.keys(assets);
    commit(types.SAVE_DEFAULT_ASSETS_IDS, { ids });
  }
};
