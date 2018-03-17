import * as types from '../mutations';
import API from '../services/api';


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
