import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import wallet from '../src/modules/wallet.js';
import assets from '../src/modules/assets.js';
import apis from '../src/modules/apis.js';
import account from '../src/modules/account.js';
import * as AccountService from '../src/services/account.js'; 

const brainkey = 'glink omental webless pschent knopper brumous scarry were wasting isopod raper barbas maco kirn tegua mitome';
const password = 'qwer1234';
const bts_asset = '1.3.0';
const test_account = '1.2.383374';
const test_account_name = 'anlopan364test2';
const hobbit_account = '1.2.512210';
const hobbit_account_name = 'hobb1t';
const transfer_amount = 10;
const owner_pubkey = 'BTS5AmuQyyhyzNyR5N3L6MoJUKiqZFgw7xTRnQr5XP5sLKbptCABX';

const localVue = createLocalVue();
localVue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    wallet,
    assets,
    apis,
    account
  }
});

beforeAll(done => {
  store.dispatch('initApis', () => {
    console.log('initApis callback');
    done();
  })
});

describe('wallet module', () => {

  it('creates wallet', done => {
    store.dispatch('createWallet', {brainkey, password}).then(() => {
      expect(store.getters.getBrainkey).toBe(brainkey);
      const owner_key = store.getters.getKeys.owner;
      const computed_owner_pubkey = owner_key.toPublicKey().toPublicKeyString();
      expect(computed_owner_pubkey).toBe(owner_pubkey);
      done();
    });
  });

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
});

describe('account module', () => {
  it('checks existing accounts', done => {
    const p1 = AccountService.isUsernameExists(hobbit_account_name).then( res => {
      expect(res).toBe(true);
    });
    const p2 = AccountService.isUsernameExists('definitely not existing account').then( res => {
      expect(res).toBe(false);
    });
    Promise.all([p1,p2]).then(() => {
      done()
    });
  });
  it('fetches wallet user', done => {
    const {owner} = store.getters.getKeys;
    const owner_pubkey = owner.toPublicKey().toPublicKeyString();
    store.dispatch('fetchAccount', owner_pubkey).then( res => {
      expect(store.state.account.user_id).toBe(test_account);
      expect(store.state.account.name).toBe(test_account_name);
      done();
    });
  });
  it('creates account', done => {
    const brainkey = store.getters.suggestBrainkey(dictionary.en);
    store.dispatch('createWallet', {brainkey, password}).then(() => {
      const {owner, active} = store.getters.getKeys;
      const owner_pubkey = owner.toPublicKey().toPublicKeyString();
      const active_pubkey = active.toPublicKey().toPublicKeyString();
      const name = hobbit_account_name;

      //simulate success response
      global.fetch = () => { 
        return new Promise(resolve => {
          const res = {
            account: {
              active_key: active_pubkey, 
              memo_key: active_pubkey, 
              name: name, 
              owner_key: owner_pubkey, 
              referrer: 'referrer', 
              registrar: 'registrar'
            }
          }
          const response = {
            json: () => res
          };
          resolve(response);
        });
      };

      store.dispatch('createAccount', {
        active_pubkey: active_pubkey,
        owner_pubkey: owner_pubkey,
        name: name
      }).then(() => {
        expect(store.state.account.user_id).toBe(hobbit_account);
        expect(store.state.account.name).toBe(hobbit_account_name);
        done();
      })
    });
  });
});
