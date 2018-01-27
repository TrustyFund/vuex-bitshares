import { Apis } from 'bitsharesjs-ws';
import * as User from './user';

export const initApis = (statusCallback) => {
  const wsString = 'wss://bitshares.openledger.info/ws';
  Apis.setRpcConnectionStatusCallback(statusCallback);
  return Apis.instance(wsString, true).init_promise;
};

export const getAssets = (assets) => {
  return new Promise((resolve, reject) => {
    Apis.instance().db_api().exec('lookup_asset_symbols', [assets])
      .then(assetObjects => {
        resolve(assetObjects);
      })
      .catch(error => {
        reject(error);
      });
  });
};


export const fetchStats = (base, quote, days, bucketSize) => {
  return new Promise((resolve, reject) => {
    const endDate = new Date();
    const startDate = new Date(endDate - (1000 * 60 * 60 * 24 * days));
    const endDateISO = endDate.toISOString().slice(0, -5);
    const startDateISO = startDate.toISOString().slice(0, -5);

    Apis.instance().history_api().exec(
      'get_market_history',
      [base.id, quote.id, bucketSize, startDateISO, endDateISO]
    ).then((result) => {
      resolve(result);
    })
      .catch((error) => {
        reject(error);
      });
  });
};


export { User };
