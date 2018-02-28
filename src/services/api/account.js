import { key, ChainTypes } from 'bitsharesjs';
import { Apis } from 'bitsharesjs-ws';

export const suggestBrainkey = (dictionary) => {
  return key.suggest_brain_key(dictionary);
};

export const parseOperations = (operations) => {
  const operationTypes = {};
  console.log(ChainTypes);

  Object.keys(ChainTypes.operations).forEach(name => {
    const code = ChainTypes.operations[name];
    operationTypes[code] = name;
  });

  return operations.map(operation => {
    const [type, payload] = operation.op;

    // time calc
    // const blockId = operation.block_num;
    // const block_interval = ChainTypes.get("parameters").get("block_interval");
    // const head_block = dynGlobalObject.get("head_block_number");
    // const head_block_time = new Date(dynGlobalObject.get("time") + "Z");
    // const seconds_below = (head_block - block_number) * block_interval;
    // return new Date(head_block_time - seconds_below * 1000);

    return {
      id: operation.id,
      type: operationTypes[type],
      payload
    };
  });
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


export const getAccountOperations = async ({ userId }) => {
  try {
    const response = await Apis.instance().history_api().exec(
      'get_account_history',
      [userId, '1.11.9999999', 100, '1.11.0']
    );
    if (response && typeof (response) === 'object') {
      return {
        success: true,
        data: response
      };
    }
    return {
      success: false,
      error: 'Error fetching account operations'
    };
  } catch (error) {
    return {
      success: false,
      error
    };
  }
};

export default {
  suggestBrainkey,
  getUser,
  getAccountIdByOwnerPubkey,
  createAccount,
  getAccountOperations,
  parseOperations
};
