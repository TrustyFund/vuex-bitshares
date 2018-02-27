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
  static _isSignUpOperation(operation) {
    return (operation.id && operation.id.includes('1.11.')
      && operation.op[0] === ChainTypes.operations.account_create);
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
  listenToUserOperations({ id, callback }) {
    // this._enable
  }
}


export default new ChainListener();

