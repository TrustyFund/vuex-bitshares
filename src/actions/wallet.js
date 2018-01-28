import { PrivateKey, key, Aes } from 'bitsharesjs';
import { Apis } from 'bitsharesjs-ws';
import * as types from '../mutations';

export const createWallet = ({ commit }, { brainkey, password }) => {
  const passwordAes = Aes.fromSeed(password);
  const encryptionBuffer = key.get_random_key().toBuffer();
  const encryptionKey = passwordAes.encryptToHex(encryptionBuffer);
  const aesPrivate = Aes.fromSeed(encryptionBuffer);

  const normalizedBrainkey = key.normalize_brainKey(brainkey);
  // const brainkeyPrivate = PrivateKey.fromSeed(normalizedBrainkey);
  const encryptedBrainkey = aesPrivate.encryptToHex(normalizedBrainkey);
  const passwordPrivate = PrivateKey.fromSeed(password);
  const passwordPubkey = passwordPrivate.toPublicKey().toPublicKeyString();

  // getting user id
  const ownerKeyIndex = 1;
  const ownerKey = key.get_brainPrivateKey(normalizedBrainkey, ownerKeyIndex);
  const ownerPubkey = ownerKey.toPublicKey().toPublicKeyString();

  const keys = {
    passwordPubkey,
    encryptionKey,
    encryptedBrainkey,
    aesPrivate
  };

  return Apis.instance().db_api().exec('get_key_references', [[ownerPubkey]])
    .then(([[userId]]) => {
      if (userId) {
        commit(types.WALLET_CREATED, { keys, userId });
      } else {
        commit(types.WALLET_CREATE_ERROR);
      }
    });
};

export const unlockWallet = ({ commit, state }, password) => {
  const passwordAes = Aes.fromSeed(password);
  const encryptionPlainbuffer = passwordAes.decryptHexToBuffer(state.encryption_key);
  const aesPrivate = Aes.fromSeed(encryptionPlainbuffer);
  commit(types.WALLET_UNLOCK, aesPrivate);
};

export const lockWallet = ({ commit }) => {
  commit(types.WALLET_LOCK);
};
