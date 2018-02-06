/* eslint-env jest */
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import portfolio from '../src/modules/portfolio.js';

jest.mock('../src/services/assets.js');

const localVue = createLocalVue();
localVue.use(Vuex);

const initialState = Object.assign({}, portfolio.state);


describe('Portfolio module: getters', () => {
  let store;

  beforeEach(() => {
    // todo: doesn't work somewhy, debug
    store = new Vuex.Store({
      modules: {
        portfolio
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

  beforeEach(() => {
    state = Object.assign({}, initialState);
  });

  test('FETCH_PORTFOLIO_ASSET_REQUEST', () => {
    portfolio.mutations.FETCH_PORTFOLIO_ASSET_REQUEST(state, {
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
    portfolio.mutations.FETCH_PORTFOLIO_ASSET_ERROR(state, {
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
    portfolio.mutations.FETCH_PORTFOLIO_ASSET_COMPLETE(state, {
      id: '1.2.3',
      data: testData
    });

    expect(state.list['1.2.3']).toEqual(testData);
  });
});

// describe('Assets module: actions', () => {
//   let store;

//   beforeEach(() => {
//     // doesn't work somewhy.......
//     store = new Vuex.Store({
//       modules: {
//         portfolio
//       }
//     });
//   });

//   test('fetches portfolio data', done => {

//   });
// });
