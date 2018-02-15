import * as types from '../mutations';
import API from '../services/api';
import { arrayToObject } from '../utils';

/**
 * Fetches assets objects from bitsharesjs-ws
 * @param {Array} assets - list of assets ids/symbold to fetch
 */
export const fetchAssets = async ({ commit }, assets) => {
  commit(types.FETCH_ASSETS_REQUEST);
  const result = await API.Assets.fetch(assets);
  if (result) {
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
export const fetchDefaultAssets = async ({ commit, getters }) => {
  const defaultAssetsNames = getters.getDefaultAssetsNames;
  const assets = await fetchAssets({ commit }, defaultAssetsNames);
  if (assets) {
    const ids = Object.keys(assets);
    commit(types.SAVE_DEFAULT_ASSETS_IDS, { ids });
  }
};
