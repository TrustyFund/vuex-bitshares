import { key, ChainTypes } from 'bitsharesjs';
import { Apis } from 'bitsharesjs-ws';

export const suggestBrainkey = (dictionary) => {
  return key.suggest_brain_key(dictionary);
};


const getOperationsAssetsIds = (parsedOperations) => {
  function addNewId(array, id) {
    if (array.indexOf(id) === -1) array.push(id);
  }

  return parsedOperations.reduce((result, operation) => {
    switch (operation.type) {
      case 'transfer':
        addNewId(result, operation.payload.amount.asset_id);
        break;
      case 'fill_order':
        addNewId(result, operation.payload.pays.asset_id);
        addNewId(result, operation.payload.receives.asset_id);
        break;
      case 'limit_order_create':
        addNewId(result, operation.payload.amount_to_sell.asset_id);
        addNewId(result, operation.payload.min_to_receive.asset_id);
        break;
      default:
    }
    return result;
  }, []);
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

export const parseOperations = async ({ operations, userId }) => {
  const operationTypes = {};

  Object.keys(ChainTypes.operations).forEach(name => {
    const code = ChainTypes.operations[name];
    operationTypes[code] = name;
  });

  // computing date time for operation via block number
  const ApiInstance = Apis.instance();
  const ApiObject = await ApiInstance.db_api().exec('get_objects', [['2.0.0']]);
  const ApiObjectDyn = await ApiInstance.db_api().exec('get_objects', [['2.1.0']]);
  const blockInterval = ApiObject[0].parameters.block_interval;
  const headBlock = ApiObjectDyn[0].head_block_number;
  const headBlockTime = new Date(ApiObjectDyn[0].time + 'Z');

  const parsedOperations = await Promise.all(operations.map(async operation => {
    const [type, payload] = operation.op;
    const operationType = operationTypes[type];

    const secondsBelow = (headBlock - operation.block_num) * blockInterval;
    const date = new Date(headBlockTime - (secondsBelow * 1000));
    let isBid = false;
    let otherUserName = null;

    if (operationType === 'fill_order' || operationType === 'limit_order_create') {
      const blockNum = operation.block_num;
      const trxInBlock = operation.trx_in_block;
      const transaction = await ApiInstance.db_api().exec('get_transaction', [blockNum, trxInBlock]);
      isBid = transaction.operations[0][1].amount_to_sell.asset_id === transaction.operations[0][1].fee.asset_id;
    }

    if (operationType === 'transfer') {
      const otherUserId = payload.to === userId ? payload.from : payload.to;
      const userRequest = await getUser(otherUserId);
      if (userRequest.success) otherUserName = userRequest.data.account.name;
    }

    return {
      id: operation.id,
      type: operationType,
      payload,
      date,
      buyer: !!isBid,
      otherUserName
    };
  }));

  console.log(parsedOperations);

  const assetsIds = getOperationsAssetsIds(parsedOperations);

  return {
    operations: parsedOperations,
    assetsIds
  };
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
