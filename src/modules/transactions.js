import Vue from 'vue';
import * as types from '../mutations';
import * as actions from '../actions/transactions';

const initialState = {
  pendingDistributionUpdate: {},
  pendingOrders: {},
  pending: false,
  error: null
};

const getters = {
  getPendingOrders: state => state.pendingOrders,
  getPendingDistribution: state => state.pendingDistributionUpdate
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
  },
  [types.SET_PENDING_DISTRIBUTION](state, { distribution }) {
    state.pendingDistributionUpdate = distribution;
  },
  [types.REMOVE_PENDING_DISTRIBUTION](state) {
    state.pendingDistributionUpdate = {};
  }
};

export default {
  state: initialState,
  actions,
  mutations,
  getters,
  namespaced: true
};
