import { TransactionBuilder } from 'bitsharesjs';
import { encryptMemo } from '../utils';
import * as types from '../mutations';
import API from '../services/api';

const signTransaction = async (transaction, { active, owner }) => {
  const pubkeys = [active, owner].map(privkey => privkey.toPublicKey().toPublicKeyString());
  const requiredPubkeys = await transaction.get_required_signatures(pubkeys);
  requiredPubkeys.forEach(requiredPubkey => {
    if (active.toPublicKey().toPublicKeyString() === requiredPubkey) {
      transaction.add_signer(active, requiredPubkey);
    }
    if (owner.toPublicKey().toPublicKeyString() === requiredPubkey) {
      transaction.add_signer(owner, requiredPubkey);
    }
  });
};

const buildAndBroadcast = async (type, payload, { active, owner }) => {
  const transaction = new TransactionBuilder();
  transaction.add_type_operation(type, payload);
  await signTransaction(transaction, { active, owner });
  await transaction.update_head_block();
  await transaction.set_required_fees();
  const res = await transaction.broadcast();
  return res;
};

export const transferAsset = async ({ commit, rootGetters }, payload) => {
  commit(types.TRANSFER_ASSET_REQUEST);

  const { to, assetId, amount, memo } = payload;
  const toAccount = await API.Account.getUser(to);

  if (!toAccount.success) {
    commit(types.TRANSFER_ASSET_ERROR, new Error('No such user'));
    return;
  }

  const transferObject = {
    fee: {
      amount: 0,
      asset_id: '1.3.0'
    },
    from: rootGetters['account/getAccountUserId'],
    to: toAccount.data.account.id,
    amount: {
      amount,
      asset_id: assetId
    }
  };

  const keys = rootGetters['account/getKeys'];

  if (keys === null) {
    commit(types.TRANSFER_ASSET_ERROR, new Error('Wallet locked'));
    return;
  }

  const { active, owner } = keys;

  if (memo) {
    transferObject.memo = encryptMemo(memo, active, toAccount.data.account.options.memo_key);
  }

  const res = await buildAndBroadcast('transfer', transferObject, { active, owner });
  commit(types.TRANSFER_ASSET_COMPLETE, res);
};
