/* eslint-env jest */
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import Assets from '../src/services/assets.js';

jest.mock('../src/services/assets.js');

const localVue = createLocalVue();
localVue.use(Vuex);

// const store = new Vuex.Store({
//   modules: {
//     assets
//   }
// });

describe('assets module', () => {
  it('test test', done => {
    done();
  });

  it('api mock works', async () => {
    const result = await Assets.fetch([1, 2]);
    expect(result[0].name).toBe('bts');
    expect(result[1].name).toBe('usd');
  });
});
