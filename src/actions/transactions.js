import { ChainTypes } from 'bitsharesjs';
import * as types from '../mutations';
import API from '../services/api';
// eslint-disable-next-line
import { calcPortfolioDistributionChange } from 'lib/src/utils';

export const fetchComissions = async ({ commit }) => {
  const { fees } = await API.Parameters.getComissions();
  const operations = Object.keys(ChainTypes.operations);
  const orderIdx = operations.indexOf('limit_order_create');
  const transferIdx = operations.indexOf('transfer');

  const { fee: orderFee } = fees[orderIdx][1];
  const { fee: transeferFee, price_per_kbyte: kbytePrice } = fees[transferIdx][1];

  const comissions = {
    order: {
      fee: orderFee
    },
    transfer: {
      fee: transeferFee,
      kbytePrice
    }
  };

  commit(types.FETCH_FEES, { fees: comissions });
};

export const createOrdersFromDistribution = async (store) => {
  const { commit, rootGetters, getters } = store;
  const distribution = getters.getPendingDistribution;
  if (!distribution) return;
  const userId = rootGetters['account/getAccountUserId'];
  const balances = rootGetters['account/getCurrentUserBalances'];
  const history = rootGetters['market/getMarketHistory'];

  const defaultAssetsIds = rootGetters['assets/getDefaultAssetsIds'];

  const combinedBalances = JSON.parse(JSON.stringify(balances));
  defaultAssetsIds.forEach(id => {
    if (combinedBalances[id]) return;
    combinedBalances[id] = { balance: 0 };
  });

  Object.keys(combinedBalances).forEach(id => {
    combinedBalances[id] = combinedBalances[id].balance;
  });

  const assetsIds = Object.keys(combinedBalances);
  const baseBalances = {};

  assetsIds.forEach(id => {
    if (id === '1.3.0') {
      baseBalances[id] = combinedBalances[id];
    } else {
      baseBalances[id] = combinedBalances[id] * history[id].last;
    }
  });

  // const update = calcPortfolioDistributionChange(baseBalances, distribution);

  const orders = API.Market.generateOrders({
    userId,
    update: distribution,
    balances: combinedBalances,
    baseBalances
  });
  console.log(orders);

  commit(types.UPDATE_PENDING_ORDERS, { orders });
};

export const setPendingDistribution = (store, { distribution }) => {
  const { commit } = store;
  commit(types.SET_PENDING_DISTRIBUTION, { distribution });
  createOrdersFromDistribution(store);
};

export const removePendingDistribution = (store) => {
  const { commit } = store;
  commit(types.REMOVE_PENDING_DISTRIBUTION);
};

export const processPendingOrders = async (store) => {
  const { getters, commit, rootGetters } = store;
  commit(types.PROCESS_PENDING_ORDERS_REQUEST);
  const keys = rootGetters['account/getKeys'];
  if (!keys) {
    commit(types.PROCESS_PENDING_ORDERS_ERROR);
    return {
      success: false,
      error: 'Account is locked'
    };
  }
  const pendingOrders = getters.getPendingOrders;
  if (pendingOrders.sellOrders.length) {
    const sellResult = await API.Transactions.placeOrders({
      orders: pendingOrders.sellOrders,
      keys });
    if (!sellResult.success) {
      commit(types.PROCESS_PENDING_ORDERS_ERROR);
      return {
        success: false,
        error: sellResult.error
      };
    }
    commit(types.PROCESS_PENDING_ORDERS_SELL_COMPLETE);
  }
  if (pendingOrders.buyOrders.length) {
    const buyResult = await API.Transactions.placeOrders({
      orders: pendingOrders.buyOrders,
      keys
    });
    console.log(buyResult);
    if (!buyResult.success) {
      commit(types.PROCESS_PENDING_ORDERS_ERROR);
      return {
        success: false,
        error: buyResult.error
      };
    }
  }
  commit(types.PROCESS_PENDING_ORDERS_COMPLETE);
  console.log('TADAM');
  return {
    success: true
  };
};

export const resetPendingOrders = (store) => {
  const { commit } = store;
  commit(types.RESET_PENDING_ORDERS);
};


export const transferAsset = async ({ commit, rootGetters }, { to, assetId, amount, memo }) => {
  commit(types.TRANSFER_ASSET_REQUEST);
  console.log('transferAsset to1', to);
  const fromId = rootGetters['account/getAccountUserId'];

  const keys = rootGetters['account/getKeys'];

  if (!keys) {
    commit(types.TRANSFER_ASSET_ERROR, 'Wallet locked');
    return {
      success: false,
      error: 'Wallet is locked'
    };
  }
  console.log('transferAsset to2', to);
  const res = await API.Transactions.transferAsset(fromId, to, assetId, amount, keys, memo);
  if (res.success) {
    commit(types.TRANSFER_ASSET_COMPLETE);
    return {
      success: true
    };
  }
  commit(types.TRANSFER_ASSET_ERROR, res.error);
  return {
    success: false,
    error: res.error
  };
};

export const setPendingTransfer = ({ commit }, { transaction }) => {
  commit(types.SET_PENDING_TRANSFER, { transaction });
};
