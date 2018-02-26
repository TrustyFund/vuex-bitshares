import { PrivateKey, key, Aes } from 'bitsharesjs';
import * as types from '../mutations';
// import { getAccountIdByOwnerPubkey, getAccount } from '../services/wallet.js';
import API from '../services/api';

const OWNER_KEY_INDEX = 1;
const ACTIVE_KEY_INDEX = 0;

// helper fync
const createWallet = ({ brainkey, password }) => {
  const passwordAes = Aes.fromSeed(password);
  const encryptionBuffer = key.get_random_key().toBuffer();
  const encryptionKey = passwordAes.encryptToHex(encryptionBuffer);
  const aesPrivate = Aes.fromSeed(encryptionBuffer);

  const normalizedBrainkey = key.normalize_brainKey(brainkey);
  const encryptedBrainkey = aesPrivate.encryptToHex(normalizedBrainkey);
  const passwordPrivate = PrivateKey.fromSeed(password);
  const passwordPubkey = passwordPrivate.toPublicKey().toPublicKeyString();

  const result = {
    passwordPubkey,
    encryptionKey,
    encryptedBrainkey,
    aesPrivate,
  };

  return result;
};

export const unlockWallet = ({ commit, state }, password) => {
  const passwordAes = Aes.fromSeed(password);
  const encryptionPlainbuffer = passwordAes.decryptHexToBuffer(state.encryptionKey);
  const aesPrivate = Aes.fromSeed(encryptionPlainbuffer);
  commit(types.ACCOUNT_UNLOCK_WALLET, aesPrivate);
};

export const lockWallet = ({ commit }) => {
  commit(types.ACCOUNT_LOCK_WALLET);
};

export const signup = async (state, { name, password, dictionary }) => {
  const { commit } = state;
  commit(types.ACCOUNT_SIGNUP_REQUEST);
  const brainkey = API.Account.suggestBrainkey(dictionary);
  const result = await API.Account.createAccount({
    name,
    activeKey: key.get_brainPrivateKey(brainkey, ACTIVE_KEY_INDEX),
    ownerKey: key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX),
    referrer: ''
  });
  console.log('Account created : ', result.success);
  if (result.success) {
    const userId = await API.ChainListener.listenToSignupId({ name });
    const wallet = createWallet({ password, brainkey });
    console.log(userId);
    commit(types.ACCOUNT_SIGNUP_COMPLETE, { wallet, userId });
    API.Persistent.cacheUserData({
      id: userId,
      encryptedBrainkey: wallet.encryptedBrainkey
    });
    return { success: true };
  }
  commit(types.ACCOUNT_SIGNUP_ERROR, { error: result.error });
  return {
    success: false,
    error: result.error
  };
};

export const login = async (state, { password, brainkey }) => {
  const { commit } = state;
  commit(types.ACCOUNT_LOGIN_REQUEST);
  const wallet = createWallet({ password, brainkey });

  const ownerKey = key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX);
  const ownerPubkey = ownerKey.toPublicKey().toPublicKeyString();
  const userId = await API.Account.getAccountIdByOwnerPubkey(ownerPubkey);
  const id = userId && userId[0];
  if (id) {
    API.Persistent.cacheUserData({
      id,
      encryptedBrainkey: wallet.encryptedBrainkey
    });
    commit(types.ACCOUNT_LOGIN_COMPLETE, { wallet, id });
    return {
      success: true
    };
  }
  commit(types.ACCOUNT_LOGIN_ERROR);
  return {
    success: false,
    error: 'Login error'
  };
};

export const logout = ({ commit }) => {
  commit(types.ACCOUNT_LOGOUT);
};

export const checkCachedUserData = ({ commit }) => {
  const data = API.Persistent.getCachedUserData();
  if (data) {
    commit(types.SET_ACCOUNT_USER_DATA, {
      userId: data.userId,
      encryptedBrainkey: data.encryptedBrainkey
    });
  }
};
