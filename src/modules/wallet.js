import * as actions from '../actions/wallet';
import * as types from '../mutations';
import * as getters from '../getters/wallet';


const initialState = {
  passwordPubkey: null,
  encryptedBrainkey: null,
  brainkeyBackupDate: null,
  encryptionKey: null,
  created: null,
  aesPrivate: null,
  userId: null,
  error: null,
  pending: false
};

const mutations = {
  [types.WALLET_SIGNUP_REQUEST]: (state) => {
    state.pending = true;
  },
  [types.WALLET_SIGNUP_COMPLETE]: (state, { wallet, userId }) => {
    state.pending = false;
    state.passwordPubkey = wallet.passwordPubkey;
    state.encryptedBrainkey = wallet.encryptedBrainkey;
    state.encryptionKey = wallet.encryptionKey;
    state.aesPrivate = wallet.aesPrivate;
    state.brainkeyBackupDate = null;
    state.created = new Date();
    state.userId = userId;
  },
  [types.WALLET_SIGNUP_ERROR]: (state, { error }) => {
    state.pending = false;
    state.error = error;
  },
  [types.WALLET_LOGIN_REQUEST]: (state) => {
    state.pending = true;
  },
  [types.WALLET_LOGIN_COMPLETE]: (state, { wallet, id }) => {
    state.pending = false;
    state.userId = id;
    state.passwordPubkey = wallet.passwordPubkey;
    state.encryptedBrainkey = wallet.encryptedBrainkey;
    state.encryptionKey = wallet.encryptionKey;
    state.aesPrivate = wallet.aesPrivate;
  },
  [types.WALLET_LOGIN_ERROR]: (state) => {
    state.pending = false;
  },
  [types.WALLET_BRAINKEY_BACKUP]: (state) => {
    state.brainkeyBackupDate = Date();
  },
  [types.WALLET_LOCK]: (state) => {
    state.aesPrivate = null;
  },
  [types.WALLET_UNLOCK]: (state, aesPrivate) => {
    state.aesPrivate = aesPrivate;
  },
  [types.SET_WALLET_USER_DATA]: (state, { userId, encryptedBrainkey }) => {
    state.userId = userId;
    state.encryptedBrainkey = encryptedBrainkey;
  }
};

export default {
  state: initialState,
  mutations,
  actions,
  getters,
  namespaced: true
};
