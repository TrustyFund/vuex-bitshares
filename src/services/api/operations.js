import { ChainTypes } from 'bitsharesjs';
import { Apis } from 'bitsharesjs-ws';
import API from '../api';


const Operations = {
  _operationTypes: {},

  prepareOperationTypes: () =>{
    Object.keys(ChainTypes.operations).forEach(name => {
      const code = ChainTypes.operations[name];
      Operations._operationTypes[code] = name;
    });    
  },

  _getOperationDate: async (operation) => {
    const ApiInstance = Apis.instance();
    const ApiObject = await ApiInstance.db_api().exec('get_objects', [['2.0.0']]);
    const ApiObjectDyn = await ApiInstance.db_api().exec('get_objects', [['2.1.0']]);
    const blockInterval = ApiObject[0].parameters.block_interval;
    const headBlock = ApiObjectDyn[0].head_block_number;
    const headBlockTime = new Date(ApiObjectDyn[0].time + 'Z');
    const secondsBelow = (headBlock - operation.block_num) * blockInterval;
    const date = new Date(headBlockTime - (secondsBelow * 1000));
    return date;
  },

  _checkIfBidOperation: async (operation) => {
    const ApiInstance = Apis.instance();
    const blockNum = operation.block_num;
    const trxInBlock = operation.trx_in_block;
    const transaction = await ApiInstance.db_api().exec('get_transaction', [blockNum, trxInBlock]);
    const amountAssetId = transaction.operations[0][1].amount_to_sell.asset_id;
    const feeAssetId = transaction.operations[0][1].fee.asset_id;
    return amountAssetId === feeAssetId;
  },

  _getOperationOtherUserName: async (userId, payload) => {
    const otherUserId = payload.to === userId ? payload.from : payload.to;
    const userRequest = await API.Account.getUser(otherUserId);
    return userRequest.success ? userRequest.data.account.name : '';
  },

  parseOperation: async (operation, userId) => {
    const [type, payload] = operation.op;
    const operationType = Operations._operationTypes[type];
    const date = await Operations._getOperationDate(operation);

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
      buyer: !!isBid,
      otherUserName
    };
  },

  parseOperations: async ({ operations, userId }) => {
    const parsedOperations = await Promise.all(operations.map(async operation => {
      return Operations.parseOperation(operation, userId);
    }));

    console.log(parsedOperations);

    const assetsIds = Operations._getOperationsAssetsIds(parsedOperations);

    return {
      operations: parsedOperations,
      assetsIds
    };
  },

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

  getAccountOperations: async ({ userId }) => {
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
  }
}

Operations.prepareOperationTypes();

export default Operations;
