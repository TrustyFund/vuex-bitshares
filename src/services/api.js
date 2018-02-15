import { Apis } from 'bitsharesjs-ws';
import User from './user';
import Assets from './assets';

const API = {
  /**
   * Initializes bitshares apis
   * @param {function} statusCallback - callback function for status update
   */
  initApis: (statusCallback) => {
    const wsString = 'wss://bitshares.openledger.info/ws';
    Apis.setRpcConnectionStatusCallback(statusCallback);
    return Apis.instance(wsString, true).init_promise;
  },
  User,
  Assets
};

export default API;
