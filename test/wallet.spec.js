/* eslint-env jest */

import { key, Aes } from 'bitsharesjs';
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import wallet from '../src/modules/wallet.js';
import { getAccount, suggestBrainkey } from '../src/services/wallet.js';
import dictionary from './brainkey_dictionary.js';

jest.mock('bitsharesjs-ws');

// eslint-disable-next-line max-len
const brainkey = 'glink omental webless pschent knopper brumous scarry were wasting isopod raper barbas maco kirn tegua mitome';
// eslint-disable-next-line max-len
const hobbitBrainkey = 'pheon dasi costar paler cooing pondman panurgy burton grike sculpt midnoon samara dermis derrick kurung femoral';
const password = 'qwer1234';
// const testAccount = '1.2.383374';
// const testAccountName = 'anlopan364test2';
const hobbitAccount = '1.2.512210';
const hobbitAccountName = 'hobb1t';
const hobbitMemo = 'BTS7jdBe1Yz9S6wc9VhD41M9PJ1JmP6EdbvBdcy6z8XGVbEr1WoCD';
const ownerPubkey = 'BTS5AmuQyyhyzNyR5N3L6MoJUKiqZFgw7xTRnQr5XP5sLKbptCABX';

const localVue = createLocalVue();
localVue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    wallet
  }
});

describe('wallet module', () => {
  it('creates wallet', async done => {
    await store.dispatch('wallet/createWallet', { brainkey, password });
    expect(store.getters['wallet/getBrainkey']).toBe(brainkey);
    const ownerKey = store.getters['wallet/getKeys'].owner;
    const computedOwnerPubkey = ownerKey.toPublicKey().toPublicKeyString();
    expect(computedOwnerPubkey).toBe(ownerPubkey);
    done();
  });

  it('validates password', done => {
    expect(store.getters['wallet/isValidPassword'](password)).toBe(true);
    expect(store.getters['wallet/isValidPassword']('wrong password')).toBe(false);
    done();
  });

  it('unlocks wallet', async done => {
    await store.dispatch('wallet/unlockWallet', password);
    expect(store.getters['wallet/getBrainkey']).toBe(brainkey);
    expect(store.getters['wallet/isLocked']).toBe(false);
    done();
  });

  it('locks wallet', async done => {
    await store.dispatch('wallet/lockWallet');
    expect(store.getters['wallet/isLocked']).toBe(true);
    done();
  });

  it('checks existing accounts', async done => {
    const acc = await getAccount(hobbitAccountName);
    expect(acc).not.toBe(null);
    const nonExistingAcc = await getAccount('definitely not existing account');
    expect(nonExistingAcc).toBe(null);
    done();
  });

  it('creates account', async done => {
    const generatedBrainkey = suggestBrainkey(dictionary.en);
    await store.dispatch('wallet/createWallet', { brainkey: generatedBrainkey, password });
    const { owner, active } = store.getters['wallet/getKeys'];
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


    await store.dispatch('wallet/createAccount', { name });
    expect(store.state.wallet.userId).toBe(hobbitAccount);
    done();
  });

  it('creates transfer transaction', async done => {
    await store.dispatch('wallet/createWallet', { brainkey, password });
    const memo = 'test_memo';
    const { message, nonce } = store.getters['wallet/encryptMemo'](memo, hobbitMemo);

    const testActiveKey = await store.getters['wallet/getKeys'].active;
    const hobbitActiveKey = key.get_brainPrivateKey(hobbitBrainkey, 1);
    const decrypted = Aes.decrypt_with_checksum(
      testActiveKey,
      hobbitActiveKey.toPublicKey(),
      nonce,
      message
    );
    expect(decrypted.toString()).toBe(memo);
    done();
  });
});
