import Vue from 'vue';
import * as utils from '../utils';
import * as types from '../mutations';
import * as actions from '../actions/transactions';

const initialState = {
  pendingDistributionUpdate: null,
  pendingOrders: {},
  pendingTransfer: false,
  pending: false,
  error: null,
  transactionsProcessing: false,
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
  hasPendingOrders: state => state.pendingOrders.sellOrders || state.pendingOrders.buyOrders,
  getPendingDistribution: state => state.pendingDistributionUpdate,
  hasPendingTransfer: state => state.pendingTransfer !== false,
  areTransactionsProcessing: state => state.transactionsProcessing,
  getPendingTransfer: state => state.pendingTransfer,
  getOrderFee: state => state.fees.order.fee,
  getTransferFee: state => state.fees.transfer.fee,
  getMemoPrice: (state) => {
    return (memo) => {
      const kbytes = utils.getMemoSize(memo);
      return state.fees.transfer.fee + (state.fees.transfer.kbytePrice * kbytes);
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
  [types.SET_PENDING_TRANSFER](state, { transaction }) {
    state.pendingTransfer = transaction;
  },
  [types.FETCH_FEES](state, { fees }) {
    state.fees = fees;
  }
};

export default {
  state: initialState,
  actions,
  mutations,
  getters,
  namespaced: true
};
