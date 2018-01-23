import {ChainStore, PrivateKey, key, Aes} from "bitsharesjs/es";
import * as types from '../mutations'

const ACTIVE_KEY_INDEX = 1;
const OWNER_KEY_INDEX = 0;

export const createWallet = ({ commit, store }, {brainkey, password}) => {

  console.log(`brainkey: ${brainkey},
password: ${password}`);

  let password_aes = Aes.fromSeed(password);
  let encryption_buffer = key.get_random_key().toBuffer();
  let encryption_key = password_aes.encryptToHex(encryption_buffer);
  let aes_private = Aes.fromSeed(encryption_buffer);
  //if(!brainkey)
  //  brainkey = key.suggest_brain_key(dictionary.en);
  //else
  //brainkey = key.normalize_brainKey(brainkey);
  let brainkey_private = PrivateKey.fromSeed(key.normalize_brainKey(brainkey))
  let brainkey_pubkey = brainkey_private.toPublicKey().toPublicKeyString();
  let encrypted_brainkey = aes_private.encryptToHex(brainkey);
  let password_private = PrivateKey.fromSeed(password);
  let password_pubkey = password_private.toPublicKey().toPublicKeyString();

  let active_key = key.get_brainPrivateKey(brainkey, ACTIVE_KEY_INDEX);
  let owner_key = key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX);

  let keys = {
    password_pubkey,
    encryption_key,
    encrypted_brainkey,
    brainkey_pubkey,
    aes_private,
    active_key,
    owner_key
  };
  console.log(keys)
  console.log(active_key.toPublicKey().toPublicKeyString());
  console.log(owner_key.toPublicKey().toPublicKeyString());
  commit(types.WALLET_CREATED, keys);
}
