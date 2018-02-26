import { key } from 'bitsharesjs';
import { Apis } from 'bitsharesjs-ws';

export const suggestBrainkey = (dictionary) => {
  return key.suggest_brain_key(dictionary);
};

export const getAccount = nameOrId => {
  return Apis.instance().db_api().exec('get_full_accounts', [[nameOrId], false])
    .then(([res]) => {
      if (res) {
        const [, { account }] = res;
        return account;
      }
      return null;
    });
};

export const getAccountIdByOwnerPubkey = async ownerPubkey => {
  const res = await Apis.instance().db_api().exec('get_key_references', [[ownerPubkey]]);
  return res ? res[0] : null;
};

export const createAccount = async ({ name, ownerKey, activeKey, referrer }) => {
  const faucetUrl = 'https://faucet.bitshares.eu/onboarding';
  try {
    const response = await fetch(faucetUrl + '/api/v1/accounts', {
      method: 'post',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        account: {
          name,
          owner_key: ownerKey.toPublicKey().toPublicKeyString(),
          active_key: activeKey.toPublicKey().toPublicKeyString(),
          memo_key: activeKey.toPublicKey().toPublicKeyString(),
          refcode: null,
          referrer
        }
      })
    });
    const result = await response.json();
    if (!result || (result && result.error)) {
      return {
        success: false,
        error: result.error.base[0]
      };
    }
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: 'Account creation error'
    };
  }
};

export default {
  suggestBrainkey, getAccount, getAccountIdByOwnerPubkey, createAccount
};
