import { PrivateKey, key } from 'bitsharesjs';

const ACTIVE_KEY_INDEX = 0;
const OWNER_KEY_INDEX = 1;

export const getBrainkey = state => {
  if (!state.aesPrivate) return null;
  return state.aesPrivate.decryptHexToText(state.encryptedBrainkey);
};

export const getKeys = state => {
  const brainkey = getBrainkey(state);
  if (!brainkey) return null;
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

export const getWalletError = state => {
  return state.error;
};

export const getWalletUserId = state => {
  return state.userId;
};

export const getWalletPendingState = state => {
  return state.pending;
};

