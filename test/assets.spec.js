/* eslint-env jest */
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import wallet from '../src/modules/wallet.js';
import assets from '../src/modules/assets.js';
import apis from '../src/modules/apis.js';

const localVue = createLocalVue();
localVue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    wallet,
    assets,
    apis
  }
});

beforeAll(done => {
  store.dispatch('initApis', () => {
    console.log('initApis callback');
    done();
  });
});

describe('assets module', () => {
  it('test test', done => {
    done();
  });
});
