import Vue from 'vue';
import * as types from '../mutations';
import * as actions from '../actions/assets';
import * as getters from '../getters/assets';

const initialState = {
  defaultAssets: ['BTS', 'OPEN.EOS', 'USD', 'OPEN.OMG', 'CNY',
    'OPEN.LTC', 'OPEN.EOS', 'TRFND', 'OPEN.BTC', 'ARISTO', 'ARCOIN'],
  assets: {},
  prices: {},
  preferredAssetId: '1.3.121', // USD
  baseMarketId: '1.3.0', // BTS
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
  [types.FETCH_DEFAULT_ASSETS_REQUEST](state) {
    state.pending = true;
  },
  [types.FETCH_DEFAULT_ASSETS_COMPLETE](state, { assets }) {
    state.assets = assets;
  },
  [types.FETCH_DEFAULT_ASSETS_ERROR](state) {
    state.pending = false;
  },
  [types.FETCH_ASSET_PRICE_REQUEST](state, { id }) {
    Vue.set(state.prices, id, { fetching: true });
  },
  [types.FETCH_ASSET_PRICE_COMPLETE](state, { id, data }) {
    Vue.set(state.prices, id, data);
  },
  [types.FETCH_ASSET_PRICE_ERROR](state, { id }) {
    Vue.set(state.prices[id], 'fetching', false);
  }
};

export default {
  state: initialState,
  actions,
  mutations,
  getters
};
