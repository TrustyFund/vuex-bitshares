import { Apis } from 'bitsharesjs-ws';
import API from './src/services/api';
import * as utils from './src/utils/market.js';
import { key, TransactionBuilder } from 'bitsharesjs';

const findAsset = (assetId) => {
  return (asset) => asset.id === assetId;
};

const brainkey = 'glink omental webless pschent knopper brumous scarry were wasting isopod raper barbas maco kirn tegua mitome';
const testAccount = '1.2.383374';
const k = key.get_brainPrivateKey(brainkey, 0);

const createOrder = ({ sell, receive, userId}) => {
  const expiration = new Date();
  expiration.setYear(expiration.getFullYear() + 5);
  return {
    seller: userId,
    amount_to_sell: sell,
    min_to_receive: receive,
    expiration,
    fill_or_kill: true
  };
}

const processOrders = async (orders) => {
  const transaction = new TransactionBuilder();
  orders.forEach(o => transaction.add_type_operation('limit_order_create', o));
  API.Transactions.signTransaction(transaction, {active: k, owner: k});
  await transaction.set_required_fees()
  console.log(await transaction.broadcast());
}

const main = async () => {
  await Apis.instance("wss://ws.winex.pro ", true).init_promise;
  API.ChainListener.enable();
  const baseId = '1.3.0';

  const balancesObject = {};
  const baseBalances = {};
  balancesObject['1.3.0'] = 100000000;
  balancesObject['1.3.1999'] = 0;
  balancesObject['1.3.973'] = 0;

  baseBalances['1.3.0'] = 100000000;
  baseBalances['1.3.1999'] = 0;
  baseBalances['1.3.973'] = 0;


  console.log("BALANCES", balancesObject, '\n\n');

  const balancesPromises = [];
  Object.keys(balancesObject).forEach((assetId) => {
    if (assetId !== baseId){
      const callback = (assetId, baseValue) => {
        baseBalances[assetId] = baseValue;
      }
      balancesPromises.push(API.Market.subscribeToExchangeRate(assetId, balancesObject[assetId], callback));
    }
  });

  await Promise.all(balancesPromises);

  const update = {};
  update['1.3.1999'] = 0.5;
  update['1.3.973'] = 0.5;
  
  //console.log("BASE BALANCES", baseBalances);
  
  console.log("DISTR",utils.distributionFromBalances(baseBalances));
  const result = utils.getValuesToUpdate(balancesObject, baseBalances, update);
  console.log(result);

  let sellOrders = [];
  let buyOrders = [];

  Object.keys(result.sell).forEach((assetId) => {
    const toSell = result.sell[assetId];
    let toReceive = API.Market.calcExchangeRate(assetId, 'sell', toSell);
    const fee = API.Market.getFee(assetId);
    if (toReceive > fee) {
      toReceive -= fee;
      const orderObject = {
        sell: {
          asset_id: assetId, 
          amount: toSell
        },
        receive: {
          asset_id: baseId,
          amount: toReceive
        },
        userId: testAccount
      }
      const order = createOrder(orderObject);
      sellOrders.push(order);
    }
  });
 //console.log("SELL ORDERS: ", sellOrders);

  if (sellOrders.length) {
    //await processOrders(sellOrders);
  }

  Object.keys(result.buy).forEach((assetId) => {
    let toSellBase = result.buy[assetId];
    const fee = API.Market.getFee(assetId);
    if (toSellBase > fee){
      toSellBase -= fee;
      const toReceive = API.Market.calcExchangeRate(assetId, 'buy', toSellBase);
      const orderObject = {
        sell: {
          asset_id: baseId, 
          amount: toSellBase
        },
        receive: {
          asset_id: assetId,
          amount: toReceive
        },
        userId: testAccount
      }
      const order = createOrder(orderObject);
      buyOrders.push(order);
    }
  });
  console.log("BUY ORDERS: ", buyOrders);

  if (buyOrders.length) {
    //await processOrders(buyOrders);
  }

  let { data: { balances: b2 }} = await API.Account.getUser(testAccount);
}

const test = async () => {
  await Apis.instance("wss://bitshares.openledger.info/ws", true).init_promise;
  const baseId = '1.3.0';
  
  const quoteId = '1.3.1999';
  const baseAmount = 100000;
  const quoteAmount = 25799;


  const callback = (assetId, amount) => {
    const toReceive = API.Market.calcExchangeRate(assetId, 'buy', baseAmount);
    console.log("SELL EOS: ", quoteAmount, amount);
    console.log("BUY EOS: ", baseAmount, toReceive);
  }
  await API.Market.subscribeToExchangeRate(quoteId, quoteAmount, callback)
}
 
main().catch(console.error);

