import { ChainTypes } from 'bitsharesjs';

class SubscriptionBuilder {
  constructor(type, payload) {
    switch(type) {
      case 'userOperation': {
        return new UserOperation(payload);
        break;
      }
    }
  }
}

class UserOperation {
  constructor({ userId, callback }) {
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

  checkOperation(operation) {
    if (operation.id.includes('1.11.')){
      const _userOperationsCodes = [0, 1, 2, 4];
      const _opCode = operation.op[0];
       if (_userOperationsCodes.includes(_opCode)) {
        const usersIds = this._getOperationUserIds(operation);
        if (usersIds.includes(this._userId)) {
          return true;
        }
      }
    }
    return false;
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
    this._callback(operation);
  }

  getType() {
    return 'userOperation';
  }
}

export default SubscriptionBuilder