import Vue from 'vue';
import * as types from '../mutations';
import * as actions from '../actions/portfolio';
import * as getters from '../getters/portfolio';

const initialState = {
  list: {},
  currencyId: '1.3.121', // USD
  baseId: '1.3.0', // BTS
};

const mutations = {
  [types.FETCH_PORTFOLIO_ASSET_REQUEST](state, { id, name }) {
    Vue.set(state.list, id, {
      name,
      fetching: true,
      balance: 0,
      balanceBTS: 0,
      balanceCurrency: 0,
      change: 0
    });
  },
  [types.FETCH_PORTFOLIO_ASSET_ERROR](state, { id }) {
    Vue.set(state.list[id], 'fetching', false);
    Vue.set(state.list[id], 'error', true);
  },
  [types.FETCH_PORTFOLIO_ASSET_COMPLETE](state, { id, data }) {
    Vue.set(state.list, id, data);
  },
  [types.RESET_PORTFOLIO_STATE](state) {
    state.list = {};
  }
};

export default {
  state: initialState,
  actions,
  mutations,
  getters
};
