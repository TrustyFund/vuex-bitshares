/* eslint-env jest */
import { Apis } from 'bitsharesjs-ws';
import Market from '../src/services/api/market.js';
import * as utils from '../src/utils';

const btsId = '1.3.0';
const eosId = '1.3.1999';
const createLimitOrderFee = 92;
const bts = {
  id: '1.3.0',
  symbol: 'BTS',
  precision: 5,
  options: {
    market_fee_percent: 0,
    core_exchange_rate: {
      base: {
        amount: 1,
        asset_id: '1.3.0'
      },
      quote: {
        amount: 1,
        asset_id: '1.3.0'
      }
    }
  }
};

const eos = {
  id: '1.3.1999',
  symbol: 'OPEN.EOS',
  precision: 6,
  options: {
    market_fee_percent: 10,
    core_exchange_rate: {
      base: {
        amount: 2,
        asset_id: '1.3.0'
      },
      quote: {
        amount: 1,
        asset_id: '1.3.1999'
      }
    },
    extensions: []
  }
};

const order1 = {
  id: '1',
  expiration: '2020-01-01T00:00:00',
  seller: 'seller',
  for_sale: 200,
  sell_price: {
    base: { amount: 400, asset_id: btsId },
    quote: { amount: 200, asset_id: eosId }
  },
  deferred_fee: createLimitOrderFee
};

const order2 = {
  id: '2',
  expiration: '2020-01-01T00:00:00',
  seller: 'seller',
  for_sale: 500,
  sell_price: {
    base: { amount: 900, asset_id: '1.3.0' },
    quote: { amount: 500, asset_id: '1.3.1999' }
  },
  deferred_fee: createLimitOrderFee
};


describe('market service', () => {
  const market = Market;
  test('subscribes to market', async done => {
    await market.subscribeToMarket(btsId, eosId);
    expect(market.getLimitOrders(btsId, eosId))
      .toEqual([]);
    Apis.addOrder(order1);
    expect(market.getLimitOrders(btsId, eosId))
      .toEqual([order1]);
    const initialAmount = order1.for_sale;
    Apis.fillOrder(order1.id, 10);
    const [order] = market.getLimitOrders(btsId, eosId);
    expect(order.for_sale).toEqual(initialAmount - 10);
    order1.for_sale = initialAmount;
    Apis.deleteOrder(order1.id);
    expect(market.getLimitOrders(btsId, eosId))
      .toEqual([]);
    done();
  });
  test('calculates fees', () => {
    expect(market.getExchangeFees(eos, bts)).toEqual({
      marketFeePercent: 0,
      transactionFee: createLimitOrderFee / 2
    });
    expect(market.getExchangeFees(bts, eos)).toEqual({
      marketFeePercent: 0.001,
      transactionFee: createLimitOrderFee
    });
  });
  test('gets orders for exchange', () => {
    Apis.addOrder(order2);
    Apis.addOrder(order1);
    expect(market.getExchangeOrders(eos, bts, 50)).toEqual([{
      amount: 50 - market.getExchangeFees(eos, bts).transactionFee,
      order: order1
    }]);
  });
  test('calculates distributions to fit updates', () => {
    const balances = {
      bts: 250,
      usd: 250,
      cny: 250,
      eos: 250
    };
    const update = {
      bts: 0.5,
      usd: 0,
      cny: 0.5,
      eos: 0
    };
    expect(utils.calcPortfolioDistributionChange(balances, update)).toEqual({
      sell: {
        usd: 1,
        eos: 1
      },
      buy: {
        bts: 0.5,
        cny: 0.5
      }
    });
  });
});
