import * as types from '../mutations';
import API from '../services/api';


export const createOrdersFromUpdate = async (store, { update }) => {
  const { commit, rootGetters } = store;
  const userId = rootGetters['account/getAccountUserId'];
  const balances = rootGetters['account/getCurrentUserBalances'];
  const assets = rootGetters['assets/getAssets'];
  const baseId = rootGetters['market/getBaseAssetId'];
  const history = rootGetters['market/getMarketHistory'];

  const defaultAssetsIds = rootGetters['assets/getDefaultAssetsIds'];

  const combinedBalances = { ...balances };
  defaultAssetsIds.forEach(id => {
    if (combinedBalances[id]) return;
    combinedBalances[id] = { balance: 0 };
  });

  const assetsIds = Object.keys(combinedBalances);
  const baseBalances = {};

  assetsIds.forEach(id => {
    baseBalances[id] = combinedBalances[id].balance * history[id].last;
  });

  const orders = await API.Market.generateOrders({
    update,
    balances: combinedBalances,
    assets,
    userId,
    baseId,
    baseBalances
  });

  commit(types.UPDATE_PENDING_ORDERS, { orders });
};

export const processPendingOrders = (store) => {
  const { getters, commit } = store;
  const pendingOrders = getters.getPendingOrders;
  pendingOrders.toSell.forEach(order => {
    // transfer assets
    // transferAsset(store, {
    //   to: ,
    //   assetId: ,
    //   amount: ,
    //   memo:
    // });
  });
};


export const transferAsset = async ({ commit, rootGetters }, { to, assetId, amount, memo }) => {
  commit(types.TRANSFER_ASSET_REQUEST);

  const fromId = rootGetters['account/getAccountUserId'];

  const keys = rootGetters['account/getKeys'];

  if (!keys) {
    commit(types.TRANSFER_ASSET_ERROR, 'Wallet locked');
    return;
  }

  const res = await API.Transactions.transferAsset(fromId, to, assetId, amount, keys, memo);
  if (res.success) {
    commit(types.TRANSFER_ASSET_COMPLETE);
  } else {
    commit(types.TRANSFER_ASSET_ERROR, res.error);
  }
};
