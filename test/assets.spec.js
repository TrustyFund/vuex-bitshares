/* eslint-env jest */
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import assets from '../src/modules/assets.js';
import Assets from '../src/modules/apis.js';


const localVue = createLocalVue();
localVue.use(Vuex);

// const store = new Vuex.Store({
//   modules: {
//     assets
//   }
// });

// beforeAll(done => {
  
// });

describe('assets module', () => {
  it('test test', done => {
    done();
  });
});
