/* eslint no-underscore-dangle: 0 */
/* eslint camelcase: 0 */

import { ChainTypes } from 'bitsharesjs';

const { object_type } = ChainTypes;

const history = parseInt(object_type.operation_history, 10);
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
  SignUp,
  UserOperations
};

export default Subscriptions;
