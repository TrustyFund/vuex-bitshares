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

export const encryptMemo = state => {
  return (memo, toPubkey) => {

    const { active } = getKeys(state);
    const activePubkey = active.toPublicKey().toPublicKeyString();
    const nonce = TransactionHelper.unique_nonce_uint64();

    const message = Aes.encrypt_with_checksum(
      active,
      toPubkey,
      nonce,
      memo
    );

    return {
      from: activePubkey,
      to: toPubkey,
      nonce,
      message
    };
  };
}

export const signTransaction = state => {
  return async transaction => {
    const { active, owner } = getKeys(state);
    const pubkeys = [active, owner].map(key => key.toPublicKey().toPublicKeyString());
    const requiredPubkeys = await transaction.get_required_signatures(pubkeys);
    for (let requiredPubkey of requiredPubkeys) {
      if (active.toPublicKey().toPublicKeyString() == requiredPubkey) {
        transaction.add_signer(active, requiredPubkey);
      }
      if (owner.toPublicKey().toPublicKeyString() == requiredPubkey) {
        transaction.add_signer(owner, requiredPubkey);
      }
    }
  };
}
