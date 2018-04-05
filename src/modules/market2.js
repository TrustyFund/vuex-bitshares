import Vue from 'vue';
import config from '../../config.js';
import API from '../services/api';

const FETCH_MARKET_HISTORY_REQUEST = 'FETCH_MARKET_HISTORY_REQUEST';
const FETCH_MARKET_HISTORY_COMPLETE = 'FETCH_MARKET_HISTORY_COMPLETE';
const FETCH_MARKET_HISTORY_ERROR = 'FETCH_MARKET_HISTORY_ERROR';

const FETCH_ASSETS_HISTORY_REQUEST = 'FETCH_ASSETS_HISTORY_REQUEST';
const FETCH_ASSETS_HISTORY_COMPLETE = 'FETCH_ASSETS_HISTORY_COMPLETE';
const FETCH_ASSETS_HISTORY_ERROR = 'FETCH_ASSETS_HISTORY_ERROR';


const initialState = {
  systemBaseId: config.defaultTradingBase,
  pending: false,
  error: false,
  markets: {},
  history: {}
};

const actions = {
  fetchMarketHistory: async ({ commit }, { baseId, assetId, days }) => {
    commit(FETCH_MARKET_HISTORY_REQUEST, { baseId });
    const prices = await API.Assets.fetchPriceHistory(baseId, assetId, days);
    if (!prices) {
      commit(FETCH_MARKET_HISTORY_ERROR);
      return false;
    }
    commit(FETCH_MARKET_HISTORY_COMPLETE, { baseId, assetId, prices });
    return true;
  },
  fetchAssetsHistory: (store, { assetsIds, baseId, days }) => {
    const { commit } = store;
    commit(FETCH_ASSETS_HISTORY_REQUEST);

    Promise.all(assetsIds.map(async (assetId) => {
      const prices = await actions.fetchMarketHistory(store, { baseId, assetId, days });
      console.log('Prices', prices);
      if (!prices) throw new Error('error market history');
    })).then(() => {
      commit(FETCH_ASSETS_HISTORY_COMPLETE);
    }).catch(() => {
      commit(FETCH_ASSETS_HISTORY_ERROR);
    });
  }

};

const mutations = {
  [FETCH_MARKET_HISTORY_REQUEST](state, { baseId }) {
    if (state.history[baseId] === undefined) {
      state.history[baseId] = {};
    }
    state.pending = true;
  },
  [FETCH_MARKET_HISTORY_COMPLETE](state, { baseId, assetId, prices }) {
    state.pending = false;
    Vue.set(state.history[baseId], assetId, prices);
    console.log('COMPLETE');
  },
  [FETCH_MARKET_HISTORY_ERROR](state) {
    state.pending = false;
    state.error = true;
  },
  [FETCH_ASSETS_HISTORY_REQUEST](state) {
    state.pending = true;
  },
  [FETCH_ASSETS_HISTORY_COMPLETE](state) {
    state.pending = false;
  },
  [FETCH_ASSETS_HISTORY_ERROR](state) {
    state.pending = false;
    state.error = true;
  }
};

export default {
  state: initialState,
  actions,
  mutations,
  namespaced: true
};
