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
