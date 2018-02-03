import * as types from '../mutations';
import * as apis from '../services/api';
import { arrayToObject } from '../utils';

/**
 * Fetches assets objects from bitsharesjs-ws
 * @param {Array} assets - list of assets ids/symbold to fetch
 */
export const fetchAssets = async ({ commit }, assets) => {
  commit(types.FETCH_ASSETS_REQUEST);
  const result = await apis.getAssets(assets);
  const composedResult = arrayToObject(result);
  commit(types.FETCH_ASSETS_COMPLETE, { assets: composedResult });
  return composedResult;
  // }, () => {
  // commit(types.FETCH_ASSETS_ERROR);
  // reject();
  // });
  // };
};

/**
 * Fetches default assets objects via fetchAssets function
 to save default assets ids
 */
export const fetchDefaultAssets = async ({ commit, getters }) => {
  const defaultAssetsNames = getters.getDefaultAssetsNames;
  const assets = await fetchAssets({ commit }, defaultAssetsNames);
  const ids = Object.keys(assets);
  commit(types.SAVE_DEFAULT_ASSETS_IDS, { ids });
};
