/* eslint-env jest */
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import assets from '../src/modules/assets.js';

jest.mock('../src/services/assets.js');

const localVue = createLocalVue();
localVue.use(Vuex);


describe('Assets module', () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        assets
      }
    });
  });

  it('has correct initial state', () => {
    expect(store.state.assets.assets).toEqual({});
    expect(store.state.assets.defaultAssetsIds).toEqual([]);
    expect(store.state.assets.defaultAssetsNames).toEqual(['BTS', 'OPEN.EOS', 'USD',
      'OPEN.OMG', 'CNY', 'OPEN.LTC', 'OPEN.EOS', 'TRFND', 'OPEN.BTC', 'ARISTO', 'ARCOIN']);
    expect(store.state.assets.pending).toBeFalsy();
  });

  it('has correct getters', () => {
    expect(store.getters['assets/getAssets']).toEqual({});
    expect(store.getters['assets/getDefaultAssetsIds']).toEqual([]);
    expect(store.getters['assets/getDefaultAssetsNames']).toEqual(['BTS', 'OPEN.EOS', 'USD',
      'OPEN.OMG', 'CNY', 'OPEN.LTC', 'OPEN.EOS', 'TRFND', 'OPEN.BTC', 'ARISTO', 'ARCOIN']);

    const testAssets = {
      '1.3.0': {
        symbol: 'BTS'
      },
      '1.3.113': {
        symbol: 'BTS'
      }
    };

    store.state.assets.assets = testAssets;
    expect(store.getters['assets/getAssets']).toEqual(testAssets);
    expect(store.getters['assets/getAssetById']('1.3.0')).toEqual(testAssets['1.3.0']);
    expect(store.getters['assets/getAssetById']('aaaa')).toBeFalsy();
  });

  it('fetches assets', done => {
    store.dispatch('assets/fetchAssets', ['1.3.0', '1.3.113']).then(() => {
      const recievedAssets = store.getters['assets/getAssets'];
      expect(recievedAssets).toBeDefined();
      expect(Object.keys(recievedAssets).length).toBe(2);
      expect(recievedAssets['1.3.0'].symbol).toBe('BTS');
      expect(recievedAssets['1.3.113'].symbol).toBe('CNY');
      done();
    });
  });

  it('fetches default assets', done => {
    store.dispatch('assets/fetchDefaultAssets').then(() => {
      const defaultAssetsIds = store.getters['assets/getDefaultAssetsIds'];
      expect(defaultAssetsIds).toEqual(['1.3.0', '1.3.1999', '1.3.121', '1.3.2001', '1.3.113',
        '1.3.859', '1.3.1893', '1.3.861', '1.3.2220', '1.3.2379']);
      done();
    });
  });
});
