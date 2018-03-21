import Vue from 'vue';
import * as types from '../mutations';
import * as actions from '../actions/transactions';

const initialState = {
  pendingDistributionUpdate: null,
  pendingOrders: {},
  pendingTransfer: false,
  pending: false,
  error: null,
  transactionsProcessing: false
};

const getters = {
  getPendingOrders: state => state.pendingOrders,
  hasPendingOrders: state => state.pendingOrders.sellOrders || state.pendingOrders.buyOrders,
  getPendingDistribution: state => state.pendingDistributionUpdate,
  hasPendingTransfer: state => state.pendingTransfer !== false,
  areTransactionsProcessing: state => state.transactionsProcessing,
  getPendingTransfer: state => state.pendingTransfer
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
    state.pendingDistributionUpdate = null;
    state.pendingOrders = {};
  },
  [types.PROCESS_PENDING_ORDERS_REQUEST](state) {
    state.transactionsProcessing = true;
  },
  [types.PROCESS_PENDING_ORDERS_ERROR](state) {
    state.transactionsProcessing = false;
  },
  [types.PROCESS_PENDING_ORDERS_COMPLETE](state) {
    state.transactionsProcessing = false;
  },
  [types.SET_PENDING_TRANSACTION](state, { transaction }) {
    state.pendingTransfer = transaction;
  }
};

export default {
  state: initialState,
  actions,
  mutations,
  getters,
  namespaced: true
};
