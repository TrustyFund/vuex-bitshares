/* eslint-env jest */
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import assets from '../src/modules/assets.js';

jest.mock('../src/services/api/assets.js');

const localVue = createLocalVue();
localVue.use(Vuex);

const initialState = { ...assets.state };


describe('Assets module: getters', () => {
  let store;

  beforeEach(() => {
    // todo: debug deep clone module
    store = new Vuex.Store({
      modules: {
        assets
      }
    });
  });

  test('has correct initial state', () => {
    expect(store.state.assets.assets).toEqual({});
    expect(store.state.assets.defaultAssetsIds).toEqual([]);
    expect(store.state.assets.pending).toBeFalsy();
  });

  test('has correct getters', () => {
    expect(store.getters['assets/getAssets']).toEqual({});
    expect(store.getters['assets/getDefaultAssetsIds']).toEqual([]);

    const testAssets = {
      '1.3.0': {
        symbol: 'BTS'
      },
      '1.3.113': {
        symbol: 'BTS'
      }
    };

    store.state.assets.defaultAssetsIds = ['1.3.0', '2.4.3'];
    expect(store.getters['assets/getDefaultAssetsIds']).toEqual(['1.3.0', '2.4.3']);

    store.state.assets.assets = testAssets;
    expect(store.getters['assets/getAssets']).toEqual(testAssets);
    expect(store.getters['assets/getAssetById']('1.3.0')).toEqual(testAssets['1.3.0']);
    expect(store.getters['assets/getAssetById']('aaaa')).toEqual({ precision: 1, symbol: '...' });
  });
});

describe('Assets module: mutations', () => {
  let state;

  beforeEach(() => {
    state = { ...initialState };
  });

  test('FETCH_ASSETS_REQUEST', () => {
    assets.mutations.FETCH_ASSETS_REQUEST(state);
    expect(state.pending).toBeTruthy();
  });
  test('FETCH_ASSETS_ERROR', () => {
    assets.mutations.FETCH_ASSETS_ERROR(state);
    expect(state.pending).toBeFalsy();
  });
  test('FETCH_ASSETS_COMPLETE', () => {
    const testAsset = {
      a: { name: 'bts' },
      b: { name: 'zxy' },
    };
    assets.mutations.FETCH_ASSETS_COMPLETE(state, { assets: testAsset });
    expect(state.pending).toBeFalsy();
    expect(state.assets).toEqual(testAsset);
  });
  test('SAVE_DEFAULT_ASSETS_IDS', () => {
    assets.mutations.SAVE_DEFAULT_ASSETS_IDS(state, { ids: ['a', 'b', 'c'] });
    expect(state.defaultAssetsIds).toEqual(['a', 'b', 'c']);
  });
});

describe('Assets module: actions', () => {
  let store;

  beforeEach(() => {
    // todo: debug deep clone module
    store = new Vuex.Store({
      modules: {
        assets
      }
    });
  });

  test('fetches assets', done => {
    // todo: remove
    store.state.assets.assets = {};
    expect(store.state.assets.assets).toEqual({});
    store.dispatch('assets/fetchAssets', { assets: ['1.3.0', '1.3.121'] }).then(() => {
      const recievedAssets = store.state.assets.assets;
      expect(recievedAssets).toBeDefined();
      expect(Object.keys(recievedAssets).length).toBe(2);
      expect(recievedAssets['1.3.0']).toEqual({
        id: '1.3.0',
        symbol: 'BTS',
        precision: 5,
        issuer: '1.2.3',
        options: {
          max_supply: '360057050210207',
          market_fee_percent: 0,
          max_market_fee: '1000000000000000',
          issuer_permissions: 0,
          flags: 0,
          core_exchange_rate: {
            base: {
              amount: 1,
              asset_id: '1.3.0'
            },
            quote: {
              amount: 1,
              asset_id: '1.3.0'
            }
          },
          whitelist_authorities: [],
          blacklist_authorities: [],
          whitelist_markets: [],
          blacklist_markets: [],
          description: '',
          extensions: []
        },
        dynamic_asset_data_id: '2.3.0'
      });
      expect(recievedAssets['1.3.121']).toEqual({
        id: '1.3.121',
        symbol: 'USD',
        precision: 4,
        issuer: '1.2.0',
        options: {
          max_supply: '1000000000000000',
          market_fee_percent: 10,
          max_market_fee: '1000000000000000',
          issuer_permissions: 511,
          flags: 129,
          core_exchange_rate: {
            base: {
              amount: 1069,
              asset_id: '1.3.121'
            },
            quote: {
              amount: 61434,
              asset_id: '1.3.0'
            }
          },
          whitelist_authorities: [],
          blacklist_authorities: [],
          whitelist_markets: [],
          blacklist_markets: [],
          description: {
            main: '1 United States dollar',
            market: ''
          },
          extensions: []
        },
        dynamic_asset_data_id: '2.3.121',
        bitasset_data_id: '2.4.21'
      });
      done();
    });
  });

  test('handles bad assets fetch request', done => {
    // todo: remove
    store.state.assets.assets = {};
    store.dispatch('assets/fetchAssets', { assets: ['hzhzhz'] }).then(response => {
      expect(response).toEqual({});
      expect(store.state.assets.assets).toEqual({});
      done();
    });
  });

  test('fetches default assets', done => {
    // todo: remove
    store.state.assets.assets = {};
    expect(store.state.assets.assets).toEqual({});
    store.dispatch('assets/fetchDefaultAssets').then(() => {
      const testDefaultAssetsIds = ['1.3.121', '1.3.861', '1.3.850', '1.3.858',
        '1.3.859', '1.3.1999', '1.3.973', '1.3.0', '1.3.2418'];
      const { defaultAssetsIds } = store.state.assets;
      expect(defaultAssetsIds.length).toBe(9);

      const defaultIdsInState = Object.keys(store.state.assets.assets);
      defaultAssetsIds.forEach(id => {
        expect(testDefaultAssetsIds).toContain(id);
        expect(defaultIdsInState).toContain(id);
      });
      done();
    });
  });
});
