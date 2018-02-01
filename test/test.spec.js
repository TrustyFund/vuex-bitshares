/* eslint-env jest */
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import wallet from '../src/modules/wallet.js';
import assets from '../src/modules/assets.js';
import apis from '../src/modules/apis.js';
import account from '../src/modules/account.js';
import * as AccountService from '../src/services/account.js';
import * as WalletService from '../src/services/wallet.js';
import dictionary from './brainkey_dictionary.js';

// eslint-disable-next-line max-len
const brainkey = 'glink omental webless pschent knopper brumous scarry were wasting isopod raper barbas maco kirn tegua mitome';
const password = 'qwer1234';
const testAccount = '1.2.383374';
const testAccountName = 'anlopan364test2';
const hobbitAccount = '1.2.512210';
const hobbitAccountName = 'hobb1t';
const ownerPubkey = 'BTS5AmuQyyhyzNyR5N3L6MoJUKiqZFgw7xTRnQr5XP5sLKbptCABX';

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
  });
});

describe('wallet module', () => {
  it('creates wallet', done => {
    store.dispatch('createWallet', { brainkey, password }).then(() => {
      expect(store.getters.getBrainkey).toBe(brainkey);
      const ownerKey = store.getters.getKeys.owner;
      const computedOwnerPubkey = ownerKey.toPublicKey().toPublicKeyString();
      expect(computedOwnerPubkey).toBe(ownerPubkey);
      done();
    });
  });

  it('validates password', done => {
    expect(store.getters.isValidPassword(password)).toBe(true);
    expect(store.getters.isValidPassword('wrong password')).toBe(false);
    done();
  });

  it('locks wallet', done => {
    expect(store.getters.isLocked).toBe(false);
    store.dispatch('lockWallet').then(() => {
      expect(store.getters.isLocked).toBe(true);
      done();
    });
  });

  it('unlocks wallet', done => {
    store.dispatch('unlockWallet', password).then(() => {
      const ownerKey = store.getters.getKeys.owner;
      const computedOwnerPubkey = ownerKey.toPublicKey().toPublicKeyString();
      expect(computedOwnerPubkey.substr(3)).toBe(ownerPubkey.substr(3));
      done();
    });
  });
});

describe('account module', () => {
  it('checks existing accounts', done => {
    const p1 = AccountService.isUsernameExists(hobbitAccountName).then(res => {
      expect(res).toBe(true);
    });
    const p2 = AccountService.isUsernameExists('definitely not existing account').then(res => {
      expect(res).toBe(false);
    });
    Promise.all([p1, p2]).then(() => {
      done();
    });
  });
  it('fetches wallet user', done => {
    const { owner } = store.getters.getKeys;
    const walletOwnerPubkey = owner.toPublicKey().toPublicKeyString();
    store.dispatch('fetchAccount', walletOwnerPubkey).then(() => {
      expect(store.state.account.userId).toBe(testAccount);
      expect(store.state.account.name).toBe(testAccountName);
      done();
    });
  });
  it('creates account', done => {
    const generatedBrainkey = WalletService.suggestBrainkey(dictionary.en);
    store.dispatch('createWallet', { generatedBrainkey, password }).then(() => {
      const { owner, active } = store.getters.getKeys;
      const walletOwnerPubkey = owner.toPublicKey().toPublicKeyString();
      const activePubkey = active.toPublicKey().toPublicKeyString();
      const name = hobbitAccountName;

      // simulate success response
      global.fetch = () => {
        return new Promise(resolve => {
          const res = {
            account: {
              active_key: activePubkey,
              memo_key: activePubkey,
              name,
              owner_key: walletOwnerPubkey,
              referrer: 'referrer',
              registrar: 'registrar'
            }
          };
          const response = {
            json: () => res
          };
          resolve(response);
        });
      };

      store.dispatch('createAccount', {
        activePubkey,
        ownerPubkey,
        name
      }).then(() => {
        expect(store.state.account.userId).toBe(hobbitAccount);
        expect(store.state.account.name).toBe(hobbitAccountName);
        done();
      });
    });
  });
});
