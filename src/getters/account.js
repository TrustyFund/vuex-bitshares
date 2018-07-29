import { PrivateKey, key } from 'bitsharesjs';

const ACTIVE_KEY_INDEX = 0;
const OWNER_KEY_INDEX = 1;

export const getBrainkey = state => {
  if (!state.aesPrivate) return null;
  return state.aesPrivate.decryptHexToText(state.encryptedBrainkey);
};

export const getKeys = state => {
  if (state.keys) {
    return state.keys;
  }
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
  return !state.aesPrivate && !state.keys;
};

export const getAccountError = state => {
  return state.error;
};

export const getAccountUserId = state => {
  return state.userId;
};

export const getAccountPendingState = state => {
  return state.pending;
};

export const getOperations = state => {
  return state.operations;
};

export const getAccountOperationsPendingState = state => {
  return state.operationsPending;
};

export const getCurrentUserName = state => {
  return state.userData && state.userData.account.name;
};

export const getCurrentUserBalances = state => {
  return (state.userData && state.userData.balances) || {};
};

export const getCurrentUserData = state => {
  return state.userData;
};

export const isPasswordLogin = state => state.userType === 'password';
