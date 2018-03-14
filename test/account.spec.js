/* eslint-env jest */
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import account from '../src/modules/account.js';
import dictionary from './brainkey_dictionary.js';

jest.mock('../src/services/api/account.js');
jest.mock('../src/services/api/chain-listener.js');
jest.mock('../src/services/persistent-storage.js');

// const testAccount = '1.2.383374';
// const testAccountName = 'anlopan364test2';

// const hobbitAccount = '1.2.512210';
// const hobbitAccountName = 'hobb1t';

const name = 'hobb1t';
const password = 'qwer1234';
const brainkey = 'glink omental webless pschent knopper brumous scarry were' +
  ' wasting isopod raper barbas maco kirn tegua mitome';
const ownerPubkey = 'BTS5AmuQyyhyzNyR5N3L6MoJUKiqZFgw7xTRnQr5XP5sLKbptCABX';

const localVue = createLocalVue();
const brainkeyBackupDate = '2018-03-13T16:20:00.396Z';
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
      pending: false,
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

    store.state.account.error = 'error msg';
    expect(store.getters['account/getAccountError']).toBe('error msg');
  });
});

describe('Account module: mutations', () => {
  const accountModule = { ...account };
  let state;

  beforeEach(() => {
    state = { ...account.state };
  });

  test('ACCOUNT_SIGNUP_REQUEST', () => {
    accountModule.mutations.ACCOUNT_SIGNUP_REQUEST(state);
    expect(state.pending).toBeTruthy();
  });

  test('ACCOUNT_SIGNUP_ERROR', () => {
    state.pending = true;
    accountModule.mutations.ACCOUNT_SIGNUP_ERROR(state, { error: '123' });
    expect(state.pending).toBeFalsy();
    expect(state.error).toBe('123');
  });

  test('ACCOUNT_SIGNUP_COMPLETE', () => {
    state.pending = true;
    accountModule.mutations.ACCOUNT_SIGNUP_COMPLETE(state, {
      userId: '1.2.3',
      wallet: {
        passwordPubkey: 'aaaaa',
        encryptedBrainkey: 'bbbb',
        encryptionKey: 'cccc',
        aesPrivate: 'dddd'
      }
    });
    expect(state.pending).toBeFalsy();
    expect(state.passwordPubkey).toBe('aaaaa');
    expect(state.encryptedBrainkey).toBe('bbbb');
    expect(state.encryptionKey).toBe('cccc');
    expect(state.aesPrivate).toBe('dddd');
    expect(state.error).toBe(null);
    expect(state.userId).toBe('1.2.3');
    expect(state.brainkeyBackupDate).toBe(null);
  });

  test('ACCOUNT_LOGIN_REQUEST', () => {
    accountModule.mutations.ACCOUNT_LOGIN_REQUEST(state);
    expect(state.pending).toBeTruthy();
  });

  test('ACCOUNT_LOGIN_ERROR', () => {
    accountModule.mutations.ACCOUNT_LOGIN_ERROR(state, { error: '123' });
    expect(state.pending).toBeFalsy();
    expect(state.error).toBe('123');
  });

  test('ACCOUNT_LOGIN_COMPLETE', () => {
    state.pending = true;
    accountModule.mutations.ACCOUNT_LOGIN_COMPLETE(state, {
      userId: '1.2.3',
      wallet: {
        passwordPubkey: 'aaaaa',
        encryptedBrainkey: 'bbbb',
        encryptionKey: 'cccc',
        aesPrivate: 'dddd'
      }
    });
    expect(state.pending).toBeFalsy();
    expect(state.passwordPubkey).toBe('aaaaa');
    expect(state.encryptedBrainkey).toBe('bbbb');
    expect(state.encryptionKey).toBe('cccc');
    expect(state.aesPrivate).toBe('dddd');
    expect(state.error).toBe(null);
    expect(state.userId).toBe('1.2.3');
  });

  test('STORE_BACKUP_DATE', () => {
    accountModule.mutations.STORE_BACKUP_DATE(state, brainkeyBackupDate);
    expect(state.brainkeyBackupDate).toBe(brainkeyBackupDate);
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
    expect(store.getters['account/getBrainkey']).toBe(brainkey);

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

  it('gets user data from storage', () => {
    store.dispatch('account/checkCachedUserData');
    expect(store.state.account.userId).toBe('1.2.512210');
  });

  it('logs out', () => {
    store.state.account.userId = '1.2.3';
    store.state.encryptedBrainkey = '3333';
    store.state.aesPrivate = '4444';
    store.dispatch('account/logout');
    expect(store.state.account).toEqual(account.state);
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
