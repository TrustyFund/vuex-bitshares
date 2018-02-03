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
  })
});

describe('wallet module', () => {
  const brainkey = 'glink omental webless pschent knopper brumous scarry were wasting isopod raper barbas maco kirn tegua mitome';
  const password = 'qwer1234';
  const bts_asset = '1.3.0';
  const test_account = '1.2.383374';
  const hobbit_account = '1.2.512210';
  const transfer_amount = 10;
  const owner_pubkey = 'BTS5AmuQyyhyzNyR5N3L6MoJUKiqZFgw7xTRnQr5XP5sLKbptCABX';

  it('creates wallet', done => {
    store.dispatch('createWallet', {brainkey, password}).then(() => {
      expect(store.getters.getBrainkey).toBe(brainkey);
      const owner_key = store.getters.getKeys.owner;
      const computed_owner_pubkey = owner_key.toPublicKey().toPublicKeyString();
      expect(computed_owner_pubkey).toBe(owner_pubkey);
      done();
    });
  }, 20000);

  it('validates password', done => {
    expect(store.getters.isValidPassword(password)).toBe(true);
    expect(store.getters.isValidPassword("wrong password")).toBe(false);
    done()
  });

  it('locks wallet', done => {
    expect(store.getters.isLocked).toBe(false);
    store.dispatch('lockWallet').then(() => {
      expect(store.getters.isLocked).toBe(true);
      done();
    })
  });

  it('unlocks wallet', done => {
    store.dispatch('unlockWallet', password).then(() => {
      const owner_key = store.getters.getKeys.owner;
      const computed_owner_pubkey = owner_key.toPublicKey().toPublicKeyString();
      expect(computed_owner_pubkey.substr(3)).toBe(owner_pubkey.substr(3));
      done();
    })
  });

  it('fetches wallet user', done => {
    expect(store.state.wallet.user_id).toBe(test_account);
    done();
  });
});