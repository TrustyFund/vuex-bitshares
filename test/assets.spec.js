/* eslint-env jest */
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import assets from '../src/modules/assets.js';

jest.mock('../src/services/assets.js');

const localVue = createLocalVue();
localVue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    assets
  }
});

describe('assets vuex module', () => {
  it('fetches assets', () => {
    store.dispatch('assets/fetchAssets', [1, 2]).then(() => {
      expect(store.getters['assets/getAssets']).toEqual({
        '1.3.0': {
          symbol: 'BTS',
          id: '1.3.0'
        },
        1.2: {
          symbol: 'USD',
          id: '1.2'
        }
      });
    });
  });
});
