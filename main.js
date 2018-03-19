import { Apis } from 'bitsharesjs-ws';
import API from './src/services/api';
import * as utils from './src/utils/index.js';

const testAccount = '1.2.383374';

const main = async () => {
  await Apis.instance("wss://bitshares.openledger.info/ws", true).init_promise;
  let { data: { balances }} = await API.Account.getUser(testAccount);

  const market = new API.Market('1.3.0');

  const baseBalances = {};
  const balancesObject = {};
  balances.forEach(({ asset_type, balance }) => {
    baseBalances[asset_type] = 0;
    balancesObject[asset_type] = balance;
  });

  const balancesPromises = [];
  Object.keys(balancesObject).forEach((assetId) => {
    const callback = (assetId, baseValue) => {
      baseBalances[assetId] = baseValue;
    }
    balancesPromises.push(market.subscribeToExchangeRate(assetId, balancesObject[assetId], callback));
  });

  await Promise.all(balancesPromises);

  const update = {};
  update['1.3.1999'] = 0.1;
  update['1.3.113'] = 0.4;
  update['1.3.121'] = 0.4;
  console.log("BASE BALANCES", baseBalances);
  console.log("BALANCES", balancesObject);
  const result = utils.getOrdersToUpdate(balancesObject, baseBalances, update);
  console.log(result);

}
main().catch(console.error);