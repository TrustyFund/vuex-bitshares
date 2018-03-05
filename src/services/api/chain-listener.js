/* eslint no-underscore-dangle: 0 */
import { Apis } from 'bitsharesjs-ws';
import { ChainTypes } from 'bitsharesjs';

/**
 * Subscribe to updates from bitsharesjs-ws
 */

class ChainListener {
  constructor() {
    this._signUpWaitingList = {};
    this._hasSignUpOperationsPending = false;
    this._enabled = false;
    this._user = {
      id: null,
      callback: null
    };
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
    }
  }
  enable() {
    if (this._enabled) this.disable();
    Apis.instance().db_api().exec('set_subscribe_callback', [this._mainCallback.bind(this), true]);
    this._enabled = true;
  }
  disable() {
    Apis.instance().db_api().exec('cancel_all_subscriptions', []).then(() => {
      this._enabled = false;
    });
  }
  _mainCallback(data) {
    data[0].forEach(operation => {
      if (typeof (operation) === 'object') this._operationCb(operation);
    });
  }
  _operationCb(operation) {
    if (this._hasSignUpOperationsPending && ChainListener._isSignUpOperation(operation)) {
      this._handleSignUpOperation(operation);
    }
    if (this._user.id && ChainListener._isUsersOperation(operation, this._userId)) {
      const usersIds = this._getOperationUserIds(operation);
      if (usersIds.includes(this._user.id)) this._handleUsersOperation(operation);
    }
  }
  _handleSignUpOperation(operation) {
    const payload = operation.op[1];
    const { name } = payload;
    const id = operation.result[1];
    console.log('new user signed up : ', name, id);
    console.log(operation);
    if (this._signUpWaitingList[name]) {
      this._signUpWaitingList[name].resolve(id);
      delete this._signUpWaitingList[name];
      this._checkForSignUpOperations();

    }
  }
  _getOperationUserIds(operation) {
    const [typeCode, payload] = operation.op;
    const operationType = this._operationTypes[typeCode];
    const pathToUserId = this._userFields[operationType];
    const usersIds = [payload[pathToUserId]];
    if (operationType === 'transfer') usersIds.push(payload.from);
    return usersIds;
  }
  _handleUsersOperation(operation) {
    console.log('new users operation detected: ', operation);
    this._user.callback(operation);
  }
  static _isSignUpOperation(operation) {
    return (operation.id && operation.id.includes('1.11.')
      && operation.op[0] === ChainTypes.operations.account_create);
  }
  static _isUsersOperation(operation) {
    const _userOperationsCodes = [0, 1, 2, 4];
    return (operation.id && operation.id.includes('1.11.')
      && _userOperationsCodes.includes(operation.op[0]));
  }
  _checkForSignUpOperations() {
    this._hasSignUpOperationsPending = !!(Object.keys(this._signUpWaitingList).length);
  }
  listenToSignupId({ name }) {
    console.log('started listening to sign up id : ', name);
    return new Promise((resolve) => {
      this._signUpWaitingList[name] = { resolve };
      this._hasSignUpOperationsPending = true;
    });
  }
  subscribeToUserOperations({ userId, callback }) {
    this._user = { id: userId, callback }
  }
  stopListetingToUserOperations() {
    this._user = { id: null, callback: null };
  }
}


export default new ChainListener();

