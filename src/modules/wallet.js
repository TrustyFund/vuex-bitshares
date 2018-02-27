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
  userId: null,
  error: null
};

const mutations = {
  [types.WALLET_CREATED]: (state, data) => {
    state.passwordPubkey = data.passwordPubkey;
    state.encryptedBrainkey = data.encryptedBrainkey;
    state.encryptionKey = data.encryptionKey;
    state.aesPrivate = data.aesPrivate;
    state.brainkeyBackupDate = null;
    state.created = new Date();
    state.userId = data.userId;
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
  [types.WALLET_ACCOUNT_CREATED]: (state, userId) => {
    state.userId = userId;
    state.error = null;
  },
  [types.WALLET_ACCOUNT_CREATE_ERROR]: (state, error) => {
    state.error = error;
  }
};

export default {
  state: initialState,
  mutations,
  actions,
  getters,
  namespaced: true
};
