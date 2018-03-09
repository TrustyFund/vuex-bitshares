/* eslint no-underscore-dangle: 0 */
import { Apis } from 'bitsharesjs-ws';
import SubscriptionBuilder from './subscription-builder';
/**
 * Subscribe to updates from bitsharesjs-ws
 */

class ChainListener {
  constructor() {
    this._subscribers = [];
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

  addSubscription(type, payload, wait = false) {
    if (wait) {
      return new Promise((resolve) => {
        payload.callback = (operation) => {
          this.deleteSubscription(type);
          resolve(operation.result[1]);
        };
        this._subscribers.push(new SubscriptionBuilder(type, payload));
      });
    }
    this._subscribers.push(new SubscriptionBuilder(type, payload));
    return true;
  }

  deleteSubscription(type) {
    let subscriptionIndex = -1;
    this._subscribers.forEach((sub, index) => {
      if (sub.getType() === type) {
        subscriptionIndex = index;
      }
    });
    if (subscriptionIndex > -1) {
      this._subscribers.splice(subscriptionIndex, 1);
    }
  }

  _mainCallback(data) {
    data[0].forEach(operation => {
      if (typeof (operation) === 'object') this._operationCb(operation);
    });
  }
  _operationCb(operation) {
    this._subscribers.forEach((subscriber) => {
      if (subscriber.checkOperation(operation)) {
        subscriber.notify(operation);
      }
    });
  }
}


export default new ChainListener();

