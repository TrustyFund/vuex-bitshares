import { key, PrivateKey, Aes } from 'bitsharesjs';
import { Apis } from 'bitsharesjs-ws';
import config from '../../../config';

const OWNER_KEY_INDEX = 1;
const ACTIVE_KEY_INDEX = 0;

export const utils = {
  suggestPassword: () => {
    return 'P' + key.get_random_key().toWif().substr(0, 45);
  },
  suggestBrainkey: (dictionary) => {
    return key.suggest_brain_key(dictionary);
  },
  generateKeyFromPassword: (accountName, role, password) => {
    const seed = accountName + role + password;
    const privKey = PrivateKey.fromSeed(seed);
    const pubKey = privKey.toPublicKey().toString();

    return { privKey, pubKey };
  },

  generateKeysFromPassword({ name, password }) {
    const { privKey: activeKey } = this.generateKeyFromPassword(
      name,
      'owner',
      password
    );
    const { privKey: ownerKey } = this.generateKeyFromPassword(
      name,
      'active',
      password
    );
    return {
      active: activeKey,
      owner: ownerKey
    };
  },

  getOwnerPubkeyFromBrainkey: (brainkey) => {
    const ownerKey = key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX);
    const ownerPubkey = ownerKey.toPublicKey().toPublicKeyString('BTS');
    return ownerPubkey;
  },

  encodeBody: (params) => {
    return Object.keys(params).map((bodyKey) => {
      return encodeURIComponent(bodyKey) + '=' + encodeURIComponent(params[bodyKey]);
    }).join('&');
  },

  createWallet: ({ brainkey, password }) => {
    const passwordAes = Aes.fromSeed(password);
    const encryptionBuffer = key.get_random_key().toBuffer();
    const encryptionKey = passwordAes.encryptToHex(encryptionBuffer);
    const aesPrivate = Aes.fromSeed(encryptionBuffer);

    const normalizedBrainkey = key.normalize_brainKey(brainkey);
    const encryptedBrainkey = aesPrivate.encryptToHex(normalizedBrainkey);
    const passwordPrivate = PrivateKey.fromSeed(password);
    const passwordPubkey = passwordPrivate.toPublicKey().toPublicKeyString();

    return {
      passwordPubkey,
      encryptionKey,
      encryptedBrainkey,
      aesPrivate,
    };
  }
};


export const getUser = async (nameOrId) => {
  try {
    const response = await Apis.instance().db_api().exec('get_full_accounts', [[nameOrId], false]);
    if (response && response[0]) {
      const user = response[0][1];
      return {
        success: true,
        data: user
      };
    }
    return {
      success: false,
      error: 'User not found'
    };
  } catch (error) {
    return {
      success: false,
      error
    };
  }
};

export const getAccountIdByOwnerPubkey = async ownerPubkey => {
  const res = await Apis.instance().db_api().exec('get_key_references', [[ownerPubkey]]);
  return res ? res[0] : null;
};

export const getAccountIdByBrainkey = async brainkey => {
  const ownerPubkey = utils.getOwnerPubkeyFromBrainkey(brainkey);
  return getAccountIdByOwnerPubkey(ownerPubkey);
};

export const createAccount = async ({ name, activeKey, ownerKey, email }) => {
  const { faucetUrl } = config;
  try {
    const body = {
      name,
      email,
      active_key: activeKey.toPublicKey().toPublicKeyString('BTS'),
      owner_key: ownerKey.toPublicKey().toPublicKeyString('BTS')
    };
    const response = await fetch(faucetUrl, {
      method: 'post',
      mode: 'cors',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      body: utils.encodeBody(body)
    });
    const result = await response.json();
    if (result.result === 'OK') {
      return {
        success: true,
        id: result.id
      };
    }
    return {
      success: false,
      error: result.result
    };
  } catch (error) {
    return {
      success: false,
      error
    };
  }
};


export const createAccountBrainkey = async ({ name, brainkey, email }) => {
  const activeKey = key.get_brainPrivateKey(brainkey, ACTIVE_KEY_INDEX);
  const ownerKey = key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX);
  return createAccount({ name, activeKey, ownerKey, email });
};

export default {
  utils,
  getUser,
  getAccountIdByOwnerPubkey,
  getAccountIdByBrainkey,
  createAccount,
  createAccountBrainkey
};
