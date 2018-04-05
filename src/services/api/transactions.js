import { TransactionBuilder } from 'bitsharesjs';
import { ChainConfig } from 'bitsharesjs-ws';
import { getUser } from './account';
import { encryptMemo, getMemoPrivKey } from '../../utils';


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


const signAndBroadcastTransaction = async (transaction, keys) => {
  return new Promise(async (resolve) => {
    const broadcastTimeout = setTimeout(() => {
      resolve({ success: false, error: 'expired' });
    }, ChainConfig.expire_in_secs * 2000);

    signTransaction(transaction, keys);

    try {
      await transaction.set_required_fees();
      await transaction.broadcast();
      console.log('finish await broadcast');
      clearTimeout(broadcastTimeout);
      resolve({ success: true });
    } catch (error) {
      clearTimeout(broadcastTimeout);
      resolve({ success: false, error: 'broadcast error' });
    }
  });
};


const transferAsset = async (fromId, to, assetId, amount, keys, memo = false) => {
  const toAccount = await getUser(to);
  if (!toAccount.success) {
    return { success: false, error: 'Destination user not found' };
  }

  const {
    data: {
      account: {
        options: {
          memo_key: memoKey
        }
      }
    }
  } = await getUser(fromId);

  const memoPrivate = getMemoPrivKey(keys, memoKey);

  if (!memoPrivate) {
    return { success: false, error: 'Cant find key to encrypt memo' };
  }

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
      transferObject.memo = encryptMemo(memo, memoPrivate, toAccount.data.account.options.memo_key);
    } catch (error) {
      return { success: false, error: 'Encrypt memo failed' };
    }
  }

  const transaction = new TransactionBuilder();
  transaction.add_type_operation('transfer', transferObject);
  return signAndBroadcastTransaction(transaction, keys);
};


const placeOrders = async ({ orders, keys }) => {
  const transaction = new TransactionBuilder();
  console.log('placing orders : ', orders);
  orders.forEach(o => transaction.add_type_operation('limit_order_create', o));
  return signAndBroadcastTransaction(transaction, keys);
};


const cancelOrder = async ({ orderId, userId, keys }) => {
  const transaction = new TransactionBuilder();
  const cancelObject = {
    fee: {
      amount: 0,
      asset_id: '1.3.0'
    },
    fee_paying_account: userId,
    order: orderId
  };
  transaction.add_type_operation('limit_order_cancel', cancelObject);
  return signAndBroadcastTransaction(transaction, keys);
};


export default {
  transferAsset,
  signTransaction,
  placeOrders,
  cancelOrder
};
