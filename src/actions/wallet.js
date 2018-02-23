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
  commit(types.WALLET_UNLOCK, aesPrivate);
};

export const lockWallet = ({ commit }) => {
  commit(types.WALLET_LOCK);
};

export const signUp = async (state, { name, password, dictionary }) => {
  const { commit } = state;
  commit(types.WALLET_SIGNUP_REQUEST);
  const brainkey = API.Wallet.suggestBrainkey(dictionary);
  const result = await API.Wallet.createAccount({
    name,
    activeKey: key.get_brainPrivateKey(brainkey, ACTIVE_KEY_INDEX),
    ownerKey: key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX),
    referrer: ''
  });
  console.log('Account created : ', result.success);
  if (result.success) {
    const userId = await API.Updater.listenToSignupId({ name });
    const wallet = createWallet({ password, brainkey });
    console.log(userId);
    commit(types.WALLET_SIGNUP_COMPLETE, { wallet, userId });
    API.Auth.cacheUserData({
      id: userId,
      encryptedBrainkey: wallet.encryptedBrainkey
    });
    return { success: true };
  }
  commit(types.WALLET_SIGNUP_ERROR, { error: result.error });
  return {
    success: false,
    error: result.error
  };
};

export const logIn = async (state, { password, brainkey }) => {
  const { commit } = state;
  commit(types.WALLET_LOGIN_REQUEST);
  const wallet = createWallet({ password, brainkey });

  const ownerKey = key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX);
  const ownerPubkey = ownerKey.toPublicKey().toPublicKeyString();
  const userId = await API.Wallet.getAccountIdByOwnerPubkey(ownerPubkey);
  const id = userId && userId[0];
  if (id) {
    commit(types.WALLET_LOGIN_COMPLETE, { wallet, id });
    API.Auth.cacheUserData({
      id,
      encryptedBrainkey: wallet.encryptedBrainkey
    });
    return {
      success: true
    };
  }
  commit(types.WALLET_LOGIN_ERROR);
  return {
    success: false,
    error: 'Login error'
  };
};

export const checkCachedUserData = ({ commit }) => {
  const data = API.Auth.getCachedUserData();
  if (data) {
    commit(types.SET_WALLET_USER_DATA, {
      userId: data.userId,
      encryptedBrainkey: data.encryptedBrainkey
    });
  }
};
