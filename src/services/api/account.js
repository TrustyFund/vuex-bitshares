import { key, PrivateKey } from 'bitsharesjs';
import { Apis } from 'bitsharesjs-ws';
import config from '../../../config';

export const suggestBrainkey = (dictionary) => {
  return key.suggest_brain_key(dictionary);
};

export const suggestPassword = () => {
  return 'P' + key.get_random_key().toWif().substr(0, 45);
};

export const generateKeyFromPassword = (accountName, role, password) => {
  const seed = accountName + role + password;
  const privKey = PrivateKey.fromSeed(seed);
  const pubKey = privKey.toPublicKey().toString()

  return { privKey, pubKey };
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
    console.log(error);
    return {
      success: false,
      error
    };
  }
};

export const getAccountIdByOwnerPubkey = async ownerPubkey => {
  console.log('owner pub key: ', ownerPubkey)
  console.log(Apis.instance().db_api())
  const res = await Apis.instance().db_api().exec('get_key_references', [[ownerPubkey]]);
  console.log(res)
  return res ? res[0] : null;
};

const encodeBody = (params) => {
  return Object.keys(params).map((bodyKey) => {
    return encodeURIComponent(bodyKey) + '=' + encodeURIComponent(params[bodyKey]);
  }).join('&');
};

export const createAccount = async ({ name, activeKey, ownerKey, email }) => {
  const { faucetUrl } = config;
  try {
    const body = {
      name,
      email,
      active_key: activeKey.toPublicKey().toPublicKeyString(),
      owner_key: ownerKey.toPublicKey().toPublicKeyString()
    };
    const response = await fetch(faucetUrl, {
      method: 'post',
      mode: 'cors',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      body: encodeBody(body)
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
      error: 'Account creation error'
    };
  }
};

export default {
  suggestBrainkey,
  suggestPassword,
  generateKeyFromPassword,
  getUser,
  getAccountIdByOwnerPubkey,
  createAccount
};
