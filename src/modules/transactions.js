import Vue from 'vue';
import * as utils from '../utils';
import * as types from '../mutations';
import * as actions from '../actions/transactions';

const initialState = {
  pendingDistributionUpdate: null,
  pendingOrders: {
    sellOrders: [],
    buyOrders: []
  },
  pendingTransfer: false,
  pending: false,
  error: null,
  transactionsProcessing: false,
  sellOrdersProcessed: false,
  fees: {
    order: {
      fee: 0
    },
    transfer: {
      fee: 0,
      kbytePrice: 0
    }
  }
};

const getters = {
  getPendingOrders: state => state.pendingOrders,
  hasPendingOrders: state => state.pendingOrders.sellOrders.length
    || state.pendingOrders.buyOrders.length,
  getPendingDistribution: state => state.pendingDistributionUpdate,
  hasPendingTransfer: state => state.pendingTransfer !== false,
  areTransactionsProcessing: state => state.transactionsProcessing,
  getPendingTransfer: state => state.pendingTransfer,
  getOrderFee: state => state.fees.order.fee,
  getTransferFee: state => state.fees.transfer.fee,
  getMemoPrice: (state) => {
    return (memo) => {
      const transferPrice = state.fees.transfer.fee;
      if (memo) {
        const byteLength = utils.getMemoSizeFast(memo);
        const memoPrice = Math.floor((byteLength * state.fees.transfer.kbytePrice) / 1024);
        return transferPrice + memoPrice;
      }
      return transferPrice;
    };
  }
};

const mutations = {
  [types.TRANSFER_ASSET_REQUEST](state) {
    state.transactionsProcessing = true;
  },
  [types.TRANSFER_ASSET_ERROR](state, error) {
    state.error = error;
    state.transactionsProcessing = false;
  },
  [types.TRANSFER_ASSET_COMPLETE](state) {
    state.transactionsProcessing = false;
  },
  [types.UPDATE_PENDING_ORDERS](state, { orders }) {
    if (state.sellOrdersProcessed) orders.sellOrders = [];
    Vue.set(state, 'pendingOrders', orders);
  },
  [types.SET_PENDING_DISTRIBUTION](state, { distribution }) {
    state.pendingDistributionUpdate = distribution;
  },
  [types.REMOVE_PENDING_DISTRIBUTION](state) {
    state.pendingDistributionUpdate = null;
    state.pendingOrders.sellOrders = [];
    state.pendingOrders.buyOrders = [];
    state.sellOrdersProcessed = false;
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
  [types.SET_PENDING_TRANSFER](state, { transaction }) {
    state.pendingTransfer = transaction;
  },
  [types.CLEAR_PENDING_TRANSFER](state) {
    state.pendingTransfer = false;
  },
  [types.FETCH_FEES](state, { fees }) {
    state.fees = fees;
  },
  [types.PROCESS_PENDING_ORDERS_SELL_COMPLETE](state) {
    state.pendingOrders.sellOrders = [];
    state.sellOrdersProcessed = true;
  }
};

export default {
  state: initialState,
  actions,
  mutations,
  getters,
  namespaced: true
};
