/* eslint-env jest */
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import assets from '../src/modules/assets.js';
import portfolio from '../src/modules/portfolio.js';

jest.mock('../src/services/api/assets.js');

const localVue = createLocalVue();
localVue.use(Vuex);

const initialState = { ...portfolio.state };


describe('Portfolio module: getters', () => {
  let store;

  beforeEach(() => {
    // todo: debug module clone
    store = new Vuex.Store({
      modules: {
        portfolio: { ...portfolio }
      }
    });
  });

  test('has correct initial state', () => {
    expect(store.state.portfolio.list).toEqual({});
  });

  test('has correct getters', () => {
    expect(store.getters['portfolio/getPortfolioList']).toEqual({});
  });
});

describe('Portfolio module: mutations', () => {
  let state;
  const portfolioModule = { ...portfolio };

  beforeEach(() => {
    state = { ...initialState };
  });

  test('FETCH_PORTFOLIO_ASSET_REQUEST', () => {
    portfolioModule.mutations.FETCH_PORTFOLIO_ASSET_REQUEST(state, {
      id: '1.2.3',
      name: 'testName',
      balance: 100
    });


    expect(state.list['1.2.3']).toEqual({
      name: 'testName',
      balance: 100,
      balanceBase: 0,
      balanceFiat: 0,
      change: 0,
      fetching: true
    });
  });

  test('FETCH_PORTFOLIO_ASSET_ERROR', () => {
    portfolioModule.mutations.FETCH_PORTFOLIO_ASSET_ERROR(state, {
      id: '1.2.3'
    });

    expect(state.list['1.2.3'].fetching).toBeFalsy();
    expect(state.list['1.2.3'].error).toBeTruthy();
  });

  test('FETCH_PORTFOLIO_ASSET_COMPLETE', () => {
    const testData = {
      name: 'testAsset',
      balance: 200,
      balanceBase: 300,
      balanceFiat: 400,
      change: 123
    };
    portfolioModule.mutations.FETCH_PORTFOLIO_ASSET_COMPLETE(state, {
      id: '1.2.3',
      data: testData
    });

    expect(state.list['1.2.3']).toEqual(testData);
  });

  test('RESET_PORTFOLIO_STATE', () => {
    state.list = { 1: { name: '123' } };
    portfolioModule.mutations.RESET_PORTFOLIO_STATE(state);
    expect(state.list).toEqual({});
  });
});

describe('Portfolio module: actions', () => {
  const store = new Vuex.Store({
    modules: {
      portfolio,
      assets
    }
  });

  beforeEach(() => {
    store.state.assets = { ...assets.state };
    store.state.portfolio = { ...portfolio.state };
  });

  test('fetches portfolio data', async (done) => {
    const assetsIds = ['1.3.0', '1.3.861', '1.3.113', '1.3.121'];
    const expectedResultData = {
      '1.3.0': {
        balance: 623.00001,
        balanceBase: 623.00001,
        balanceFiat: 132.09227588838945,
        change: 91.707991220226,
        name: 'BTS',
      },
      '1.3.113': {
        balance: 10,
        balanceBase: 7.189,
        balanceFiat: 1.52425578831312,
        change: -1.972656040401887,
        name: 'CNY',
      },
      '1.3.121': {
        balance: 0,
        balanceBase: 0,
        balanceFiat: 0,
        change: -47.83733355949453,
        name: 'USD',
      },
      '1.3.861': {
        balance: 0.011,
        balanceBase: 11.383235599999999,
        balanceFiat: 2.413543295734034,
        change: 38.14479407907683,
        name: 'OPEN.BTC',
      },
      '1.3.1893': {
        balance: 0,
        balanceBase: 0,
        balanceFiat: 0,
        change: 0,
        error: true,
        fetching: false,
        name: 'TRFND',
      },
      '1.3.1999': {
        balance: 0,
        balanceBase: 0,
        balanceFiat: 0,
        change: 0,
        error: true,
        fetching: false,
        name: 'OPEN.EOS',
      },
      '1.3.2001': {
        balance: 0,
        balanceBase: 0,
        balanceFiat: 0,
        change: 0,
        error: true,
        fetching: false,
        name: 'OPEN.OMG',
      },
      '1.3.2379': {
        balance: 0,
        balanceBase: 0,
        balanceFiat: 0,
        change: 0,
        error: true,
        fetching: false,
        name: 'ARCOIN',
      },
      '1.3.859': {
        balance: 0,
        balanceBase: 0,
        balanceFiat: 0,
        change: 0,
        error: true,
        fetching: false,
        name: 'OPEN.LTC',
      }
    };
    //  todo: remove
    store.state.portfolio.list = {};
    await store.dispatch('assets/fetchDefaultAssets');
    await store.dispatch('assets/fetchAssets', assetsIds);
    await store.dispatch('portfolio/fetchPortfolioData', {
      balances: {
        '1.3.0': {
          balance: 62300001
        },
        '1.3.113': {
          balance: 100000
        },
        '1.3.861': {
          balance: 1100000
        },
        '1.3.121': {
          balance: 0
        }
      },
      baseId: '1.3.0',
      fiatId: '1.3.121',
      days: 7
    });
    expect(store.getters['portfolio/getPortfolioList']).toEqual(expectedResultData);
    done();
  });
});
