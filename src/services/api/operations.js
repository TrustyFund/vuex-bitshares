/* eslint no-underscore-dangle: 0 */
import { ChainTypes } from 'bitsharesjs';
import { Apis } from 'bitsharesjs-ws';
import { getUser } from './account.js';
import { getParameters } from './parameters.js';

// Service for dealing with operations (transactions)
const Operations = {
  _operationTypes: {},

  // Prepares object with code : operation's name format
  prepareOperationTypes: () => {
    Object.keys(ChainTypes.operations).forEach(name => {
      const code = ChainTypes.operations[name];
      Operations._operationTypes[code] = name;
    });
  },

  // Gets operation's data based on it's block number
  _getOperationDate: (operation, Parameters, ApiObjectDyn, operationType) => {
    const blockInterval = Parameters.block_interval;
    const headBlock = ApiObjectDyn[0].head_block_number;
    const headBlockTime = new Date(ApiObjectDyn[0].time + 'Z');
    const secondsBelow = (headBlock - operation.block_num) * blockInterval;
    const date = new Date(headBlockTime - (secondsBelow * 1000));
    if (operationType === 'fill_order') date.setSeconds(date.getSeconds() + 1);
    return date;
  },

  // Used for place order and fill order operations. Determines if user is a seller or buyer
  _checkIfBidOperation: async (operation) => {
    const ApiInstance = Apis.instance();
    const blockNum = operation.block_num;
    const trxInBlock = operation.trx_in_block;
    const transaction = await ApiInstance.db_api().exec('get_transaction', [blockNum, trxInBlock]);
    // console.log(transaction);
    // console.log(transaction.operations[0][1]);
    // console.log(transaction.operations[0][1].amount_to_sell);
    const amountAssetId = transaction.operations[0][1].amount_to_sell.asset_id;
    const feeAssetId = transaction.operations[0][1].fee.asset_id;
    return amountAssetId === feeAssetId;
  },

  // User for transfer operations. Determines if user received or sent
  _getOperationOtherUserName: async (userId, payload) => {
    const otherUserId = payload.to === userId ? payload.from : payload.to;
    const userRequest = await getUser(otherUserId);
    return userRequest.success ? userRequest.data.account.name : '';
  },

  // Parses operation for improved format
  _parseOperation: async (operation, userId, Parameters, ApiObjectDyn) => {
    const [type, payload] = operation.op;
    const operationType = Operations._operationTypes[type];
    const date = Operations._getOperationDate(operation, Parameters, ApiObjectDyn, operationType);

    let isBid = false;
    let otherUserName = null;

    if (operationType === 'fill_order' || operationType === 'limit_order_create') {
      isBid = await Operations._checkIfBidOperation(operation);
    }

    if (operationType === 'transfer') {
      otherUserName = await Operations._getOperationOtherUserName(userId, payload);
    }

    return {
      id: operation.id,
      type: operationType,
      payload,
      date,
      buyer: isBid,
      otherUserName
    };
  },

  // Parses array of operations, return array of parsed operations and array of assets ids
  // that were user in it
  parseOperations: async ({ operations, userId }) => {
    const ApiInstance = Apis.instance();
    const Parameters = await getParameters();
    const ApiObjectDyn = await ApiInstance.db_api().exec('get_objects', [['2.1.0']]);

    const operationTypes = [0, 1, 2, 4];
    const filteredOperations = operations.filter(op => operationTypes.includes(op.op[0]));

    const parsedOperations = await Promise.all(filteredOperations.map(async operation => {
      return Operations._parseOperation(operation, userId, Parameters, ApiObjectDyn);
    }));

    const assetsIds = Operations._getOperationsAssetsIds(parsedOperations);

    return {
      operations: parsedOperations,
      assetsIds
    };
  },

  // retrieves array of assets ids that were used in operations
  _getOperationsAssetsIds: (parsedOperations) => {
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
  },

  // fetches user's operations
  getUserOperations: async ({ userId, limit }) => {
    try {
      const response = await Apis.instance().history_api().exec(
        'get_account_history',
        [userId, '1.11.9999999', limit, '1.11.0']
      );
      if (response && typeof (response) === 'object') {
        const parsedOperations = await Operations.parseOperations({ operations: response, userId });
        return {
          success: true,
          data: parsedOperations
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
  }
};

Operations.prepareOperationTypes();

export default Operations;
