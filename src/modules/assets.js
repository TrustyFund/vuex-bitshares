import Vue from 'vue';
import * as types from '../mutations';
import * as actions from '../actions/assets';
import * as getters from '../getters/assets';

const initialState = {
  defaultAssetsNames: ['BTS', 'OPEN.EOS', 'USD', 'OPEN.OMG', 'CNY',
    'OPEN.LTC', 'OPEN.EOS', 'TRFND', 'OPEN.BTC', 'ARISTO', 'ARCOIN'],
  defaultAssetsIds: [],
  assets: {},
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
  },
  [types.FETCH_ASSETS_ERROR](state) {
    state.pending = false;
  },
  [types.SAVE_DEFAULT_ASSETS_IDS](state, { ids }) {
    state.defaultAssetsIds = ids;
  }
};

export default {
  state: initialState,
  actions,
  mutations,
  getters
};
