import * as actions from '../actions/wallet';
import * as types from '../mutations';
import * as getters from '../getters/wallet';


const initialState = {
  //  for password validation
  password_pubkey: null,
  encrypted_brainkey: null,
  brainkey_backup_date: null,
  encryption_key: null,
  created: null,
  aes_private: null,
  user_id: null,
  valid: false
};

const mutations = {
  [types.WALLET_CREATED]: (state, { keys, userId }) => {
    state.password_pubkey = keys.passwordPubkey;
    state.encrypted_brainkey = keys.encryptedBrainkey;
    state.encryption_key = keys.encryptionKey;
    state.aes_private = keys.aesPrivate;
    state.created = new Date();
    state.user_id = userId;
    state.valid = true;
  },
  [types.WALLET_CREATE_ERROR]: (state) => {
    state.valid = false;
  },
  [types.WALLET_BRAINKEY_BACKUP]: (state) => {
    state.brainkey_backup_date = Date();
  },
  [types.WALLET_LOCK]: (state) => {
    state.aes_private = null;
  },
  [types.WALLET_UNLOCK]: (state, aesPrivate) => {
    state.aes_private = aesPrivate;
  },
};

export default {
  state: initialState,
  mutations,
  actions,
  getters,
  namespaced: true
};
