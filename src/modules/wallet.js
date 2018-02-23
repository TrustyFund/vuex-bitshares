import * as actions from '../actions/wallet';
import * as types from '../mutations';
import * as getters from '../getters/wallet';


const initialState = {
  //  for password validation
  passwordPubkey: null,
  encryptedBrainkey: null,
  brainkeyBackupDate: null,
  encryptionKey: null,
  created: null,
  aesPrivate: null,
  error: null,
  userId: null
};

const mutations = {
  [types.WALLET_CREATED]: (state, data) => {
    state.passwordPubkey = data.passwordPubkey;
    state.encryptedBrainkey = data.encryptedBrainkey;
    state.encryptionKey = data.encryptionKey;
    state.aesPrivate = data.aesPrivate;
    state.brainkeyBackupDate = null;
    state.created = new Date();
    // state.userId = data.userId;
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
  [types.WALLET_ACCOUNT_CREATED]: (state) => {
    state.error = null;
  },
  [types.WALLET_ACCOUNT_CREATE_ERROR]: (state, error) => {
    state.error = error;
  },
  [types.WALLET_LOGIN_COMPLETE]: (state, { id }) => {
    state.userId = id;
  },
  [types.WALLET_LOGIN_ERROR]: (state) => {
    state.passwordPubkey = null;
    state.encryptedBrainkey = null;
    state.brainkeyBackupDate = null;
    state.encryptionKey = null;
    state.created = null;
    state.aesPrivate = null;
    state.error = null;
    state.userId = null;
  },
  [types.SET_WALLET_USER_DATA]: (state, { userId, encryptedBrainkey }) => {
    if (userId) state.userId = userId;
    if (encryptedBrainkey) state.encryptedBrainkey = encryptedBrainkey;
  }
};

export default {
  state: initialState,
  mutations,
  actions,
  getters,
  namespaced: true
};
