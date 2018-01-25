import {ChainStore, PrivateKey, key, Aes} from "bitsharesjs/es";
import * as actions from '../actions/wallet';
import * as types from '../mutations'

const ACTIVE_KEY_INDEX = 0;
const OWNER_KEY_INDEX = 1;

let state = {
  //for password validation
  password_pubkey: null,
  encrypted_brainkey: null,
  brainkey_backup_date: null,
  encryption_key: null,
  created: null,
  aes_private: null,
  user_id: null
};

let mutations = {
  [types.WALLET_CREATED]: (state, {keys, user_id}) => {
    state.password_pubkey = keys.password_pubkey;
    state.encrypted_brainkey = keys.encrypted_brainkey;
    state.encryption_key = keys.encryption_key;
    state.aes_private = keys.aes_private;
    state.created = new Date();
    state.user_id = user_id;
  },
  [types.WALLET_BRAINKEY_BACKUP]: (state) => {
    state.brainkey_backup_date = Date();
  },
  [types.WALLET_LOCK]: (state) => {
    state.aes_private = null;
    state.active_key = null;
    state.owner_key = null;
  },
  [types.WALLET_UNLOCK]: (state, aes_private) => {
    state.aes_private = aes_private;
  }
};

const getters = {
  brainkey: state => {
    const brainkey = state.aes_private.decryptHexToText(state.encrypted_brainkey);
    return brainkey;
  },
  keys: (state, {brainkey}) => {
    return {
      active: key.get_brainPrivateKey(brainkey, ACTIVE_KEY_INDEX),
      owner: key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX)
    }
  },
  validator: state => {
    return (password) => {
      const password_private = PrivateKey.fromSeed(password);
      const password_pubkey = password_private.toPublicKey().toPublicKeyString();
      return password_pubkey == state.password_pubkey;
    }
  },
  locked: state => {
    return state.aes_private == null;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};
