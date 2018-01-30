import * as types from '../mutations';
import * as apis from '../services/api';
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
