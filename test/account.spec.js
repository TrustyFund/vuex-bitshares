/* eslint-env jest */

import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import account from '../src/modules/account.js';
import dictionary from './brainkey_dictionary.js';

jest.mock('../src/services/api/account.js');
jest.mock('../src/services/api/chain-listener.js');

// eslint-disable-next-line max-len
// const brainkey = 'glink omental webless pschent knopper brumous scarry were wasting isopod raper barbas maco kirn tegua mitome';
// const password = 'qwer1234';
// const testAccount = '1.2.383374';
// const testAccountName = 'anlopan364test2';
// const hobbitAccount = '1.2.512210';
// const hobbitAccountName = 'hobb1t';
// const ownerPubkey = 'BTS5AmuQyyhyzNyR5N3L6MoJUKiqZFgw7xTRnQr5XP5sLKbptCABX';

const name = 'hobb1t';
const password = 'qwer1234';
const brainkey = 'glink omental webless pschent knopper brumous scarry were' +
  ' wasting isopod raper barbas maco kirn tegua mitome';
const ownerPubkey = 'BTS5AmuQyyhyzNyR5N3L6MoJUKiqZFgw7xTRnQr5XP5sLKbptCABX';

const localVue = createLocalVue();
localVue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    account
  }
});

const initialState = JSON.parse(JSON.stringify(store.state));

describe('Account module: getters', () => {
  beforeEach(() => {
    store.replaceState(JSON.parse(JSON.stringify(initialState)));
  });

  test('has correct initial state', () => {
    expect(store.state.account).toEqual({
      passwordPubkey: null,
      encryptedBrainkey: null,
      brainkeyBackupDate: null,
      encryptionKey: null,
      created: null,
      aesPrivate: null,
      userId: null,
      error: null,
      pending: false
    });
  });

  test('has correct getters', () => {
    expect(store.getters['account/getBrainkey']).toEqual(null);
    expect(store.getters['account/getKeys']).toEqual(null);
    expect(store.getters['account/isLocked']).toBeTruthy();
    expect(store.getters['account/isValidPassword']('lalala')).toBeFalsy();

    store.state.account.userId = '1.2.3';
    expect(store.getters['account/getAccountUserId']).toEqual('1.2.3');

    store.state.account.pending = true;
    expect(store.getters['account/getAccountPendingState']).toBeTruthy();
  });
});

describe('Account module: actions', () => {
  beforeEach(() => {
    store.replaceState(JSON.parse(JSON.stringify(initialState)));
  });

  it('signs up', async done => {
    const result = await store.dispatch('account/signup', {
      name,
      password,
      dictionary: dictionary.en
    });

    expect(result.success).toBeTruthy();
    expect(store.getters['account/getBrainkey']).toBe(brainkey);
    expect(store.getters['account/getAccountUserId']).toBe('1.2.512210');
    expect(store.state.account.passwordPubkey).toBe('BTS8FMW7puctMywEDacAbGcX2H1A' +
      'a1Qk7xKtipV3TtBJnk5UTpyo8');

    const ownerKey = store.getters['account/getKeys'].owner;
    const computedOwnerPubkey = ownerKey.toPublicKey().toPublicKeyString();
    expect(computedOwnerPubkey).toBe(ownerPubkey);
    done();
  });

  it('doesnt sign up bad account name', async done => {
    const badName = 'notHobb1t';

    const result = await store.dispatch('account/signup', {
      name: badName,
      password,
      dictionary: dictionary.en
    });

    expect(result.success).toBeFalsy();
    expect(store.getters['account/getAccountUserId']).toBe(null);
    expect(store.getters['account/getBrainkey']).toBe(null);
    done();
  });

  it('logs in', async done => {
    const result = await store.dispatch('account/login', {
      password,
      brainkey
    });

    expect(result.success).toBeTruthy();
    const ownerKey = store.getters['account/getKeys'].owner;
    const computedOwnerPubkey = ownerKey.toPublicKey().toPublicKeyString();
    expect(store.getters['account/getBrainkey']).toBe(brainkey);
    expect(store.getters['account/getAccountUserId']).toBe('1.2.512210');
    expect(store.state.account.passwordPubkey).toBe('BTS8FMW7puctMywEDacAbGcX2H1A' +
      'a1Qk7xKtipV3TtBJnk5UTpyo8');
    expect(computedOwnerPubkey).toBe(ownerPubkey);
    done();
  });

  it('doesnt log in with bad brainkey', async done => {
    const badBrainkey = 'lalalalalalala';

    const result = await store.dispatch('account/login', {
      password,
      brainkey: badBrainkey
    });

    expect(result.success).toBeFalsy();
    done();
  });

  it('locks and unlocks wallet', async done => {
    await store.dispatch('account/login', {
      password,
      brainkey
    });

    expect(store.getters['account/isLocked']).toBeFalsy();
    store.dispatch('account/lockWallet');
    expect(store.getters['account/isLocked']).toBeTruthy();
    store.dispatch('account/unlockWallet', password);
    expect(store.getters['account/isLocked']).toBeFalsy();

    done();
  });

  it('checks username for existanse', async done => {
    const result = await store.dispatch('account/checkIfUsernameFree', {
      username: 'hobb1t'
    });
    expect(result).toBeFalsy();
    const newResult = await store.dispatch('account/checkIfUsernameFree', {
      username: 'originalName'
    });
    expect(newResult).toBeTruthy();
    done();
  });
});

// describe('account module', () => {
//   // it('creates wallet', async done => {
//   //   await store.dispatch('account/createWallet', { brainkey, password });
//   //   expect(store.getters['account/getBrainkey']).toBe(brainkey);
//   //   const ownerKey = store.getters['account/getKeys'].owner;
//   //   const computedOwnerPubkey = ownerKey.toPublicKey().toPublicKeyString();
//   //   expect(computedOwnerPubkey).toBe(ownerPubkey);
//   //   done();
//   // });

//   it('validates password', done => {
//     expect(store.getters['account/isValidPassword'](password)).toBe(true);
//     expect(store.getters['account/isValidPassword']('wrong password')).toBe(false);
//     done();
//   });

//   it('unlocks wallet', async done => {
//     await store.dispatch('account/unlockWallet', password);
//     expect(store.getters['account/getBrainkey']).toBe(brainkey);
//     expect(store.getters['account/isLocked']).toBe(false);
//     done();
//   });

//   it('locks wallet', async done => {
//     await store.dispatch('account/lockWallet');
//     expect(store.getters['account/isLocked']).toBe(true);
//     done();
//   });

//   it('checks existing accounts', async done => {
//     const acc = await getAccount(hobbitAccountName);
//     expect(acc).not.toBe(null);
//     const nonExistingAcc = await getAccount('definitely not existing account');
//     expect(nonExistingAcc).toBe(null);
//     done();
//   });

//   it('signs up', async done => {
//     // const generatedBrainkey = suggestBrainkey(dictionary.en);
//     const name = hobbitAccountName;
//     const { owner, active } = store.getters['wallet/getKeys'];
//     const walletOwnerPubkey = owner.toPublicKey().toPublicKeyString();
//     const activePubkey = active.toPublicKey().toPublicKeyString();

//     // simulate success response
//     global.fetch = () => {
//       return new Promise(resolve => {
//         const res = {
//           account: {
//             active_key: activePubkey,
//             memo_key: activePubkey,
//             name,
//             owner_key: walletOwnerPubkey,
//             referrer: 'referrer',
//             registrar: 'registrar'
//           }
//         };
//         const response = {
//           json: () => res
//         };
//         resolve(response);
//       });
//     };

//     await store.dispatch('account/signup', {
//       dictionary: dictionary.en,
//       // brainkey: generatedBrainkey,
//       password,
//       name
//     });

//     // await store.dispatch('account/createAccount', { name });
//     expect(store.state.account.error).toBeFalsy();
//     done();
//   });

//   it('logs in', async done => {
//     done();
//   });
// });
