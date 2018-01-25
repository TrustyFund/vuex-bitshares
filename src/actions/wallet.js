import {ChainStore, PrivateKey, key, Aes} from "bitsharesjs/es";
import {Apis} from "bitsharesjs-ws";
import * as types from '../mutations'

export const createWallet = ({ commit, store }, {brainkey, password}) => {
  const password_aes = Aes.fromSeed(password);
  const encryption_buffer = key.get_random_key().toBuffer();
  const encryption_key = password_aes.encryptToHex(encryption_buffer);
  const aes_private = Aes.fromSeed(encryption_buffer);

  brainkey = key.normalize_brainKey(brainkey);
  const brainkey_private = PrivateKey.fromSeed(brainkey);
  const encrypted_brainkey = aes_private.encryptToHex(brainkey);
  const password_private = PrivateKey.fromSeed(password);
  const password_pubkey = password_private.toPublicKey().toPublicKeyString();

  //getting user id
  const owner_key_index = 1;
  const owner_key = key.get_brainPrivateKey(brainkey, owner_key_index);
  const owner_pubkey = owner_key.toPublicKey().toPublicKeyString();

  const keys = {
    password_pubkey,
    encryption_key,
    encrypted_brainkey,
    aes_private
  };

  return Apis.instance().db_api().exec("get_key_references", [[owner_pubkey]])
    .then(([[user_id]]) => {
      commit(types.WALLET_CREATED, {keys, user_id});
    });
}

export const unlock = ({commit,state}, password) => {
  const password_aes = Aes.fromSeed(password);
  const encryption_plainbuffer = password_aes.decryptHexToBuffer(state.encryption_key);
  const aes_private = Aes.fromSeed(encryption_plainbuffer);
  commit(types.WALLET_UNLOCK, aes_private);
}

export const lock = ({commit}) => {
  commit(types.WALLET_LOCK);
}
