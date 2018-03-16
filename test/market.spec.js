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
  const market = new Market(createLimitOrderFee);
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
    // TODO: consider floats comparing
    expect(utils.calcPortfolioDistributionChange({
      '1.3.0': 0,
      '1.3.113': 400,
      '1.3.121': 100,
      '1.3.1999': 500
    }, {
      '1.3.0': 0.15,
      '1.3.113': 0.45,
      '1.3.121': 0.1,
      '1.3.1999': 0.3
    })).toEqual({
      sell: {
        '1.3.1999': 0.4
      },
      buy: {
        '1.3.0': 0.75,
        '1.3.113': 0.24999999999999992
      }
    });
  });
  test('samples distribution to specified accuracy', () => {
    expect(utils.distributionSampling(
      {
        '1.3.0': 0.5700268982667804,
        '1.3.113': 0.10582752186532557,
        '1.3.121': 0.000043214634294735743,
        '1.3.861': 0.00006169457659182669,
        '1.3.973': 0.06378792759388024,
        '1.3.1042': 0.00011144826739168692,
        '1.3.1578': 0.26011570718332416,
        '1.3.1999': 0.00002558761241135669
      },
      2
    )).toEqual({
      '1.3.113': 0.11,
      '1.3.973': 0.06,
      '1.3.1578': 0.26,
      '1.3.1042': 0,
      '1.3.861': 0,
      '1.3.121': 0,
      '1.3.0': 0.57,
      '1.3.1999': 0
    });
  });
});
