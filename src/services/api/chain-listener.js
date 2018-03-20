/* eslint no-underscore-dangle: 0 */
import { Apis } from 'bitsharesjs-ws';
/**
 * Subscribe to updates from bitsharesjs-ws
 */

class ChainListener {
  constructor() {
    this._subscribers = [];
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

  processSubscription(subscription) {
    return new Promise((resolve) => {
      const wrapped = (result) => {
        this.deleteSubscription(subscription.getType());
        resolve(result);
      };
      subscription.setCallback(wrapped);
      this._subscribers.push(subscription);
    });
  }

  addSubscription(subscription) {
    this._subscribers.push(subscription);
    return true;
  }

  deleteSubscription(subscription) {
    let subscriptionIndex = -1;

    let typeToRemove = '';
    if (typeof subscription === 'string') {
      typeToRemove = subscription;
    } else {
      typeToRemove = subscription.getType();
    }

    this._subscribers.forEach((sub, index) => {
      if (sub.getType() === typeToRemove) {
        subscriptionIndex = index;
      }
    });
    if (subscriptionIndex > -1) {
      this._subscribers.splice(subscriptionIndex, 1);
    }
  }

  _mainCallback(data) {
    data[0].forEach(operation => {
      this._subscribers.forEach((subscriber) => {
        subscriber.notify(operation);
      });
    });
  }
}


export default new ChainListener();

