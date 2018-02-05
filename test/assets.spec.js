/* eslint-env jest */
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import assets from '../src/modules/assets.js';

jest.mock('../src/services/assets.js');

const localVue = createLocalVue();
localVue.use(Vuex);

const initialState = Object.assign({}, assets.state);

describe('Assets module: actions and getters', () => {
  let store;

  beforeEach(() => {
    // doesn't work somewhy.......
    store = new Vuex.Store({
      modules: {
        assets
      }
    });
  });

  test('has correct initial state', () => {
    expect(store.state.assets.assets).toEqual({});
    expect(store.state.assets.defaultAssetsIds).toEqual([]);
    expect(store.state.assets.defaultAssetsNames).toEqual(['BTS', 'OPEN.EOS', 'USD',
      'OPEN.OMG', 'CNY', 'OPEN.LTC', 'TRFND', 'OPEN.BTC', 'ARISTO', 'ARCOIN']);
    expect(store.state.assets.pending).toBeFalsy();
  });

  test('has correct getters', () => {
    expect(store.getters['assets/getAssets']).toEqual({});
    expect(store.getters['assets/getDefaultAssetsIds']).toEqual([]);
    expect(store.getters['assets/getDefaultAssetsNames']).toEqual(['BTS', 'OPEN.EOS', 'USD',
      'OPEN.OMG', 'CNY', 'OPEN.LTC', 'TRFND', 'OPEN.BTC', 'ARISTO', 'ARCOIN']);

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
    expect(store.getters['assets/getAssetById']('aaaa')).toBeFalsy();
  });

  test('fetches assets', done => {
    store.state.assets.assets = {};
    expect(store.state.assets.assets).toEqual({});
    store.dispatch('assets/fetchAssets', ['1.3.0', '1.3.113']).then(() => {
      const recievedAssets = store.state.assets.assets;
      expect(recievedAssets).toBeDefined();
      expect(Object.keys(recievedAssets).length).toBe(2);
      expect(recievedAssets['1.3.0'].symbol).toBe('BTS');
      expect(recievedAssets['1.3.113'].symbol).toBe('CNY');
      done();
    });
  });

  test('handles bad assets fetch request', done => {
    store.state.assets.assets = {};
    store.dispatch('assets/fetchAssets', null).then(response => {
      expect(response).toBeNull();
      expect(store.state.assets.assets).toEqual({});
      done();
    });
  });

  test('fetches default assets', done => {
    // store.state.assets = Object.assign({}, initialState);
    store.state.assets.assets = {};
    expect(store.state.assets.assets).toEqual({});
    store.dispatch('assets/fetchDefaultAssets').then(() => {
      const testDefaultAssetsIds = ['1.3.0', '1.3.113', '1.3.1999', '1.3.121', '1.3.2001',
        '1.3.859', '1.3.1893', '1.3.861', '1.3.2220', '1.3.2379'];
      const { defaultAssetsIds } = store.state.assets;
      expect(defaultAssetsIds.length).toBe(10);

      const defaultIdsInState = Object.keys(store.state.assets.assets);
      defaultAssetsIds.forEach(id => {
        expect(testDefaultAssetsIds).toContain(id);
        expect(defaultIdsInState).toContain(id);
      });
      done();
    });
  });
});

describe('Assets module: mutations', () => {
  let state;

  beforeEach(() => {
    state = Object.assign({}, initialState);
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

