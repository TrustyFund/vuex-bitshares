import Vue from 'vue';
import * as types from '../mutations';
import * as actions from '../actions/assets';
import * as getters from '../getters/assets';
import PersistentStorage from '../services/persistent-storage.js';

const initialState = {
  defaultAssetsIds: [],
  assets: {},
  hiddenAssetsIds: [],
  pending: false
};

const mutations = {
  [types.FETCH_ASSETS_REQUEST](state) {
    state.pending = true;
  },
  [types.FETCH_ASSETS_COMPLETE](state, { assets }) {
    Object.keys(assets).forEach(id => {
      Vue.set(state.assets, id, assets[id]);
    });
    state.hiddenAssetsIds = PersistentStorage.getJSON('hidden_assets') || [];
    state.pending = false;
  },
  [types.FETCH_ASSETS_ERROR](state) {
    state.pending = false;
  },
  [types.SAVE_DEFAULT_ASSETS_IDS](state, { ids }) {
    state.defaultAssetsIds = ids;
  },
  [types.HIDE_ASSET](state, id) {
    state.hiddenAssetsIds.push(id);
    PersistentStorage.set('hidden_assets', state.hiddenAssetsIds);
  },
  [types.SHOW_ASSET](state, id) {
    state.hiddenAssetsIds.splice(
      state.hiddenAssetsIds.indexOf(id),
      1
    );
    PersistentStorage.set('hidden_assets', state.hiddenAssetsIds);
  }
};

export default {
  state: initialState,
  actions,
  mutations,
  getters,
  namespaced: true
};
