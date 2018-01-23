import {ChainStore, PrivateKey, key, Aes} from "bitsharesjs/es";
import * as actions from '../actions/wallet';
import * as types from '../mutations'

const OWNER_KEY_INDEX = 0;

let state = {
  password_pubkey: null,
  encryption_key: null,
  encrypted_brainkey: null,
  brainkey_pubkey: null,
  brainkey_sequence: null,
  brainkey_backup_date: null,
  created: null,
  last_modified: null,
  aes_private: null,
  brainkey_plain: null,
  password: null,
  active_key: null,
  owner_key: null
};

let mutations = {
  [types.WALLET_CREATED]: (state, keys) => {
    state.password_pubkey = keys.password_pubkey;
    state.encryption_key = keys.encryption_key;
    state.encrypted_brainkey = keys.encrypted_brainkey;
    state.brainkey_pubkey = keys.brainkey_pubkey;
    //unlock wallet on create
    state.aes_private = keys.aes_private;
    state.brainkey_sequence = 0;
    state.brainkey_backup_date = null;
    state.created = new Date();
    state.last_modified = new Date();
    state.active_key = keys.active_key;
    state.owner_key = keys.owner_key;
  },
  [types.WALLET_BRAINKEY_BACKUP]: (state, {brainkey_plain}) => {
    state.brainkey_plain = brainkey_plain;
  },
  [types.WALLET_LOCK]: (state) => {
    state.aes_private = null;
  },
  [types.WALLET_UNLOCK]: (state, {aes_private}) => {
    state.aes_private = aes_private;
  }
};

/*let actions = {
  createWallet: ({commit}, password, brainkey) => {
    let password_aes = Aes.fromSeed(password);
    let encryption_buffer = key.get_random_key().toBuffer();
    let encryption_key = password_aes.encryptToHex(encryption_buffer);
    let aes_private = Aes.fromSeed(encryption_buffer);
    //if(!brainkey)
    //  brainkey = key.suggest_brain_key(dictionary.en);
    //else
    brainkey = key.normalize_brainKey(brainkey);
    let brainkey_private = this.getBrainKeyPrivate(brainkey_plaintext);
    let brainkey_pubkey = brainkey_private.toPublicKey().toPublicKeyString();
    let encrypted_brainkey = local_aes_private.encryptToHex(brainkey_plaintext);
    let password_private = PrivateKey.fromSeed(password_plaintext);
    let password_pubkey = password_private.toPublicKey().toPublicKeyString();

    let active_key = key.get_brainPrivateKey(brainkey, ACTIVE_KEY_INDEX);


    let keys = {
      password_pubkey,
      encryption_key,
      encrypted_brainkey,
      brainkey_pubkey,
      aes_private,
      active_key
    };
    commit(WALLET_CREATED, {keys});
  },
  fetchPrivateKey: ({commit, state}, index) => {
    if (!state.aes_private) throw new Error("wallet locked");

    let private_key = key.get_brainPrivateKey(brainkey, index)
    let pubkey = private_key.toPublicKey().toPublicKeyString()
    
  },
  backupBrainKey: ({commit, state}) => {
    if (!state.encrypted_brainkey) throw new Error("missing brainkey");
    if (!state.aes_private) throw new Error("wallet locked");
    let brainkey_plain = aes_private.decryptHexToText(state.encrypted_brainkey);
    commit(WALLET_BRAINKEY_BACKUP, {brainkey_plain});
  },
  lock: ({commit}) => {
    commit(WALLET_LOCK);
  },
  unlock: ({commit, state}, password) => {
    if(!state.encryption_key) throw new Error("missing encryption key");
    let password_aes = Aes.fromSeed(password);
    let encryption_buffer = password_aes.decryptHexToBuffer(state.encryption_key)
    let aes_private = Aes.fromSeed(encryption_buffer);
    commit(WALLET_UNLOCK, {aes_private});
  }
};*/

export default {
  state,
  mutations,
  actions
};
