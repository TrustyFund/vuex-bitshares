import { key, TransactionBuilder } from 'bitsharesjs';
import API from './src/services/api';
import * as utils from './src/utils';
import { Apis } from 'bitsharesjs-ws';

const brainkey = 'glink omental webless pschent knopper brumous scarry were wasting isopod raper barbas maco kirn tegua mitome';
const testAccount = '1.2.383374';
const k = key.get_brainPrivateKey(brainkey, 0);

const showBalance = (balances, assets) => {
  balances.forEach(({ asset_type, balance }) => {
    const asset = assets.find(a => a.id == asset_type);
    console.log(asset.symbol, ' ', asset.id ,': ', balance / 10 ** asset.precision);
  })
}

console.warn = () => {}
const main = async () => {
  await Apis.instance("wss://bitshares.openledger.info/ws", true).init_promise;
  let { data: { balances }} = await API.Account.getUser(testAccount);
  const assets = await Apis.instance().db_api().exec('lookup_asset_symbols', [balances.map(b => b.asset_type)]);
  showBalance(balances, assets);
  
  const [baseAsset] = assets;
  const market = new API.Market(92);

  await Promise.all(
    balances.filter(({ asset_type }) => asset_type != baseAsset.id)
      .map(({ asset_type }) => market.subscribeToMarket(asset_type, baseAsset.id))
  );

  const baseBalances = balances.reduce(
    (res, { asset_type, balance }) => {
      const asset = assets.find(a => a.id == asset_type);
      return Object.assign(res, { [asset_type] :  market.calcExchangeRate(asset, baseAsset, balance) });
    },
    {});

  const distributionUpdate = balances.reduce(
    (res, { asset_type, balance }) => Object.assign(res, { [asset_type] : 0 }),
    {}
  );
  //distributionUpdate['1.3.0'] = 1;
  distributionUpdate['1.3.113'] = 0.4;
  distributionUpdate['1.3.121'] = 0.1;
  distributionUpdate['1.3.1999'] = 0.5;

  const update = utils.calcPortfolioDistributionChange(baseBalances, distributionUpdate);
  console.log('need update: ', update);

  const toSell = Object.keys(update.sell).map(asset_id => ({
    asset: assets.find(a => a.id == asset_id),
    balance: Math.floor(update.sell[asset_id] * balances.find(({ asset_type }) => asset_type == asset_id).balance)
  }));

  const sellOrders = await market.getExchangeToBaseOrders(toSell, baseAsset, testAccount);
  console.log('sell orders: ', sellOrders);
  let baseAssetExchangeAmount = sellOrders.reduce(
    (res, order) => {
      const { options: { market_fee_percent }} = assets.find(a => a.id == order.min_to_receive.asset_id);
      return res += Math.floor(order.min_to_receive.amount * (1 - market_fee_percent / 10000));
    },
    0
  );
  if (update.sell[baseAsset.id]) {
    baseAssetExchangeAmount += Math.floor(baseBalances[baseAsset.id] * update.sell[baseAsset.id]);
  }
  console.log('exchange base asset amount: ',baseAssetExchangeAmount);
  const toBuy = Object.keys(update.buy).map(asset_id => ({
    asset: assets.find(a => a.id == asset_id),
    share: update.buy[asset_id]
  }));

  const buyOrders = await market.getExchangeToDistributionOrders(baseAsset, baseAssetExchangeAmount, toBuy, testAccount);
  console.log('buy orders: ', buyOrders);

  const exchangeResult = buyOrders.reduce(
    (res, order ) => {
      const { options: { market_fee_percent }} = assets.find(a => a.id == order.min_to_receive.asset_id);
      return Object.assign(res, { [order.min_to_receive.asset_id]: Math.floor(order.min_to_receive.amount * (1 - market_fee_percent / 10000)) });
    },
    {}
  );
  console.log('exchange result: ',exchangeResult);

  if (sellOrders.length) {
    const sellTr = new TransactionBuilder();
    sellOrders.forEach(o => sellTr.add_type_operation('limit_order_create', o));
    API.Transactions.signTransaction(sellTr, {active: k, owner: k});
    await sellTr.set_required_fees()
    console.log(await sellTr.broadcast());
  }

  if (buyOrders.length) {
    const buyTr = new TransactionBuilder();
    buyOrders.forEach(o => buyTr.add_type_operation('limit_order_create', o));
    API.Transactions.signTransaction(buyTr, {active: k, owner: k});
    await buyTr.set_required_fees()
    console.log(await buyTr.broadcast());
  }

  let { data: { balances: b2 }} = await API.Account.getUser(testAccount);
  showBalance(b2, assets);

}
main().catch(console.error);