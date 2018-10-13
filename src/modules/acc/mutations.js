import Vue from 'vue';
import { getDefaultState } from './defaultState';

export const types = {
  ACCOUNT_CLOUD_LOGIN: 'ACCOUNT_CLOUD_LOGIN',
  ACCOUNT_BRAINKEY_LOGIN: 'ACCOUNT_BRAINKEY_LOGIN',
  ACCOUNT_LOGOUT: 'ACCOUNT_LOGOUT',
  ACCOUNT_SIGNUP: 'ACCOUNT_SIGNUP',
  FETCH_CURRENT_USER: 'FETCH_CURRENT_USER'
};

export const mutations = {
  [types.ACCOUNT_CLOUD_LOGIN]: (state, { userId, keys }) => {
    state.userId = userId;
    state.keys = keys;
    state.userType = 'password';
  },
  [types.ACCOUNT_BRAINKEY_LOGIN]: (state, { wallet, userId }) => {
    state.userId = userId;
    state.wallet.passwordPubkey = wallet.passwordPubkey;
    state.wallet.encryptedBrainkey = wallet.encryptedBrainkey;
    state.wallet.encryptionKey = wallet.encryptionKey;
    state.wallet.aesPrivate = wallet.aesPrivate;
    state.userType = 'wallet';
  },
  [types.ACCOUNT_SIGNUP]: (state, { wallet, userId }) => {
    state.userId = userId;
    state.wallet.passwordPubkey = wallet.passwordPubkey;
    state.wallet.encryptedBrainkey = wallet.encryptedBrainkey;
    state.wallet.encryptionKey = wallet.encryptionKey;
    state.wallet.aesPrivate = wallet.aesPrivate;
    state.userType = 'wallet';
  },
  [types.ACCOUNT_LOGOUT]: (state) => {
    Object.assign(state, getDefaultState());
  },
  [types.FETCH_CURRENT_USER]: (state, { data }) => {
    Vue.set(state, 'userData', data);
  }
};
