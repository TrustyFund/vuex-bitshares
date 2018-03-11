/* eslint no-underscore-dangle: 0 */
/* eslint camelcase: 0 */

import { ChainTypes, ChainValidation } from 'bitsharesjs';

const { object_type } = ChainTypes;

const limit_order = parseInt(object_type.limit_order, 10);
const history = parseInt(object_type.operation_history, 10);
const order_prefix = '1.' + limit_order + '.';
const history_prefix = '1.' + history + '.';

class Subscription {
  constructor(type) {
    this.type = type;
    this._callback = () => {};
  }
  setCallback(callback) {
    this._callback = callback;
  }

  getType() {
    return this.type;
  }

  notify(operation) {
    this._callback(operation);
  }
}

class Market extends Subscription {
  constructor({ base, quote, callback }) {
    super('market' + base + quote, callback);
    this._callback = callback;
  }

  notify(obj) {
    if (ChainValidation.is_object_id(obj)) {
      if (obj.search(order_prefix) === 0) {
        this._callback('deleteOrder', obj);
      }
    } else {
      if (obj.id && obj.id.startsWith(history_prefix)) {
        const [type] = obj.op;
        if (type === ChainTypes.operations.fill_order) {
          this._callback('fillOrder', obj);
        }
      }

      if (obj.id && obj.id.startsWith(order_prefix)) {
        this._callback('newOrder', obj);
      }
    }
  }
}

class SignUp extends Subscription {
  constructor({ name }) {
    super('userSignUp');
    this.name = name;
  }

  notify(operation) {
    if (operation.id && operation.id.startsWith(history_prefix)
      && operation.op[0] === ChainTypes.operations.account_create) {
      const payload = operation.op[1];
      const { name } = payload;
      if (this.name === name) {
        this._callback(operation.result[1]);
      }
    }
  }
}

class UserOperations extends Subscription {
  constructor({ userId, callback }) {
    super('userOperation');
    this._userId = userId;
    this._callback = callback;

    this._operationTypes = {};
    Object.keys(ChainTypes.operations).forEach(name => {
      const code = ChainTypes.operations[name];
      this._operationTypes[code] = name;
    });

    this._userFields = {
      transfer: 'to',
      fill_order: 'account_id',
      limit_order_create: 'seller',
      limit_order_cancel: 'fee_paying_account'
    };
  }

  _getOperationUserIds(operation) {
    const [typeCode, payload] = operation.op;
    const operationType = this._operationTypes[typeCode];
    const pathToUserId = this._userFields[operationType];
    const usersIds = [payload[pathToUserId]];
    if (operationType === 'transfer') usersIds.push(payload.from);
    return usersIds;
  }

  notify(operation) {
    if (operation.id && operation.id.startsWith(history_prefix)) {
      const _userOperationsCodes = [0, 1, 2, 4];
      const _opCode = operation.op[0];
      if (_userOperationsCodes.includes(_opCode)) {
        const usersIds = this._getOperationUserIds(operation);
        if (usersIds.includes(this._userId)) {
          this._callback(operation);
        }
      }
    }
  }
}

const Subscriptions = {
  Market,
  SignUp,
  UserOperations
};

export default Subscriptions;
