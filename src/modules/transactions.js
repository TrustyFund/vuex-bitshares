import Vue from 'vue';
import * as types from '../mutations';
import * as actions from '../actions/transactions';

const initialState = {
  pendingOrders: {},
  pending: false,
  error: null
};

const getters = {
  getPendingOrders: state => state.pendingOrders
};

const mutations = {
  [types.TRANSFER_ASSET_REQUEST](state) {
    state.pending = true;
  },
  [types.TRANSFER_ASSET_ERROR](state, error) {
    state.error = error;
    state.pending = false;
  },
  [types.TRANSFER_ASSET_COMPLETE](state) {
    state.pending = false;
  },
  [types.UPDATE_PENDING_ORDERS](state, { orders }) {
    Vue.set(state, 'pendingOrders', orders);
  }
};

export default {
  state: initialState,
  actions,
  mutations,
  getters,
  namespaced: true
};
