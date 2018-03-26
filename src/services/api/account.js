import { key } from 'bitsharesjs';
import { Apis } from 'bitsharesjs-ws';

export const suggestBrainkey = (dictionary) => {
  return key.suggest_brain_key(dictionary);
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
  const res = await Apis.instance().db_api().exec('get_key_references', [[ownerPubkey]]);
  return res ? res[0] : null;
};

const encodeBody = (params) => {
  return Object.keys(params).map((bodyKey) => {
    return encodeURIComponent(bodyKey) + '=' + encodeURIComponent(params[bodyKey]);
  }).join('&');
};

export const createAccount = async ({ name, activeKey, ownerKey }) => {
  const faucetUrl = 'http://localhost:3000/signup';
  try {
    const body = {
      name,
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
        success: true
      };
    }
    return {
      success: false,
      error: 'Account creation error'
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
  getUser,
  getAccountIdByOwnerPubkey,
  createAccount
};
