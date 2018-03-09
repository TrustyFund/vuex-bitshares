import { ChainTypes } from 'bitsharesjs';

class SignUp {
  constructor({ name, callback }) {
    this._name = name;
    this._callback = callback;
    this.type = 'userSignUp';
  }

  notify(operation) {
    this._callback(operation);
  }

  checkOperation(operation) {
    if (operation.id && operation.id.includes('1.11.')
      && operation.op[0] === ChainTypes.operations.account_create){
      const payload = operation.op[1];
      const { name } = payload;
      const id = operation.result[1];
      if (this._name === name) {
        return true;
      }
    }
    return false;
  }

  notify(operation) {
    this._callback(operation);
  }

  getType() {
    return this.type;
  }
}

class UserOperation {
  constructor({ userId, callback }) {
    this._userId = userId;
    this._callback = callback;
    this.type = 'userOperation';

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
    return this.type;
  }
}

class SubscriptionBuilder {
  constructor(type, payload) {
    switch (type) {
      case 'userOperation': return new UserOperation(payload);
      case 'userSignUp': return new SignUp(payload);
      default: break;
    }
  }
}

export default SubscriptionBuilder;
