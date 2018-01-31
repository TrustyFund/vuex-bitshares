import { PrivateKey, key } from 'bitsharesjs';

const ACTIVE_KEY_INDEX = 0;
const OWNER_KEY_INDEX = 1;

export const getBrainkey = state => state.aes_private.decryptHexToText(state.encrypted_brainkey);

// eslint-disable-next-line
export const getKeys = (state, { getBrainkey }) => { 
  return {
    active: key.get_brainPrivateKey(getBrainkey, ACTIVE_KEY_INDEX),
    owner: key.get_brainPrivateKey(getBrainkey, OWNER_KEY_INDEX)
  };
};

export const isValidPassword = state => {
  return (password) => {
    const passwordPrivate = PrivateKey.fromSeed(password);
    const passwordPubkey = passwordPrivate.toPublicKey().toPublicKeyString();
    return passwordPubkey === state.password_pubkey;
  };
};

export const isLocked = state => {
  return state.aes_private == null;
};

