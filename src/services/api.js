import { Apis } from 'bitsharesjs-ws';
import User from './user';
import Assets from './assets';

export const initApis = (statusCallback) => {
  const wsString = 'wss://bitshares.openledger.info/ws';
  Apis.setRpcConnectionStatusCallback(statusCallback);
  return Apis.instance(wsString, true).init_promise;
};

export { User, Assets };
