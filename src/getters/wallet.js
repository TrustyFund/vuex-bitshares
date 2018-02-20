import { PrivateKey, key, Aes, TransactionBuilder, TransactionHelper } from 'bitsharesjs';
import { getAccount } from '../services/wallet';

const ACTIVE_KEY_INDEX = 0;
const OWNER_KEY_INDEX = 1;

export const getBrainkey = state => {
  if (!state.aesPrivate) {
    throw Error('obtaining brainkey error, wallet is locked');
  } else {
    return state.aesPrivate.decryptHexToText(state.encryptedBrainkey);
  }
};

export const getKeys = state => {
  const brainkey = getBrainkey(state);
  return {
    active: key.get_brainPrivateKey(brainkey, ACTIVE_KEY_INDEX),
    owner: key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX)
  };
};

export const isValidPassword = state => {
  return password => {
    const passwordPrivate = PrivateKey.fromSeed(password);
    const passwordPubkey = passwordPrivate.toPublicKey().toPublicKeyString();
    return passwordPubkey === state.passwordPubkey;
  };
};

export const isLocked = state => {
  return state.aesPrivate == null;
};

export const getTransferTransaction = state => {
  return async (to, amount, assetId, memo, optionalNonce = null) => {
    const activeKey = getKeys(state).active;
    const activePubkey = activeKey.toPublicKey().toPublicKeyString();
    const toAccount = await getAccount(to);
    let memoObj = null;
    if (memo) {
      const memoToPubkey = toAccount.options.memo_key;
      const nonce = optionalNonce || TransactionHelper.unique_nonce_uint64();
      const message = Aes.encrypt_with_checksum(
        activeKey,
        memoToPubkey,
        nonce,
        memo);

      memoObj = {
        from: activePubkey,
        to: memoToPubkey,
        nonce,
        message
      };
    }
    let transaction = new TransactionBuilder();
    let transfer = transaction.get_type_operation('transfer', {
      fee: {
        amount: 0,
        asset_id: '1.3.0'
      },
      from: state.userId,
      to: toAccount.id,
      amount: {
        amount: amount,
        asset_id: assetId
      },
      memo: memoObj
    });
    transaction.add_operation(transfer);
    transaction.add_signer(activeKey, activePubkey);
    await transaction.update_head_block();
    await transaction.set_required_fees();
    return transaction;
  }
}

