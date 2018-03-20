import { TransactionBuilder } from 'bitsharesjs';
import { ChainConfig } from 'bitsharesjs-ws';
import { getUser } from './account';
import { encryptMemo } from '../../utils';


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
  return transaction;
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

const transferAsset = async (fromId, to, assetId, amount, keys, memo = false) => {
  const toAccount = await getUser(to);
  if (!toAccount.success) {
    return { success: false, error: 'Destination user not found' };
  }

  const { active, owner } = keys;

  const transferObject = {
    fee: {
      amount: 0,
      asset_id: '1.3.0'
    },
    from: fromId,
    to: toAccount.data.account.id,
    amount: {
      amount,
      asset_id: assetId
    }
  };

  if (memo) {
    try {
      transferObject.memo = encryptMemo(memo, active, toAccount.data.account.options.memo_key);
    } catch (error) {
      return { success: false, error: 'Encrypt memo failed' };
    }
  }

  return new Promise(async (resolve) => {
    const broadcastTimeout = setTimeout(() => {
      resolve({ success: false, error: 'expired' });
    }, ChainConfig.expire_in_secs * 2000);

    try {
      await buildAndBroadcast('transfer', transferObject, { active, owner });
      clearTimeout(broadcastTimeout);
      resolve({ success: true });
    } catch (error) {
      clearTimeout(broadcastTimeout);
      resolve({ success: false, error: 'broadcast error' });
    }
  });
};

// const processOrders = async (orders) => {
//   const transaction = new TransactionBuilder();
//   orders.forEach(o => transaction.add_type_operation('limit_order_create', o));
//   API.Transactions.signTransaction(transaction, {active: k, owner: k});
//   await transaction.set_required_fees()
//   console.log(await transaction.broadcast());
// }

const placeOrders = async ({ orders, keys }) => {
  const transaction = new TransactionBuilder();
  console.log('placing orders : ', orders);
  orders.forEach(o => transaction.add_type_operation('limit_order_create', o));


  return new Promise(async (resolve) => {
    const broadcastTimeout = setTimeout(() => {
      resolve({ success: false, error: 'expired' });
    }, ChainConfig.expire_in_secs * 2000);

    const { active, owner } = keys;
    signTransaction(transaction, { active, owner });

    try {
      await transaction.set_required_fees();
      await transaction.update_head_block();
      const res = await transaction.broadcast();
      clearTimeout(broadcastTimeout);
      resolve({ success: true });
    } catch (error) {
      clearTimeout(broadcastTimeout);
      resolve({ success: false, error: 'broadcast error' });
    }
  });
};

export default {
  transferAsset,
  signTransaction,
  placeOrders
};
