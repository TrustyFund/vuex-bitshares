/* eslint-env jest */
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import transactions from '../src/modules/transactions';
import account from '../src/modules/acc';

jest.mock('../src/services/api/transactions.js');

const localVue = createLocalVue();
localVue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    transactions,
    account
  }
});


const password = 'qwer1234';
const brainkey = 'glink omental webless pschent knopper brumous scarry were'
                  + ' wasting isopod raper barbas maco kirn tegua mitome';

const initialState = JSON.parse(JSON.stringify(store.state));

describe('Transactions module: mutations', () => {
  let state;

  beforeEach(() => {
    state = { ...initialState };
  });

  test('TRANSFER_ASSET_REQUEST', () => {
    transactions.mutations.TRANSFER_ASSET_REQUEST(state);
    expect(state.transactionsProcessing).toBeTruthy();
  });
  test('TRANSFER_ASSET_ERROR', () => {
    transactions.mutations.TRANSFER_ASSET_ERROR(state);
    expect(state.transactionsProcessing).toBeFalsy();
  });
  test('TRANSFER_ASSET_COMPLETE', () => {
    transactions.mutations.TRANSFER_ASSET_COMPLETE(state);
    expect(state.transactionsProcessing).toBeFalsy();
  });
});

describe('Transactions module: actions', () => {
  beforeEach(() => {
    store.replaceState(JSON.parse(JSON.stringify(initialState)));
  });

  it('Creates transfer transaction', async done => {
    await store.dispatch('account/brainkeyLogin', {
      password,
      brainkey
    });
    const memo = 'test_memo';
    await store.dispatch('transactions/transferAsset', {
      to: 'hobb1t',
      assetId: '1.3.0',
      amount: 1,
      memo
    });
    expect(store.state.transactions.pending).toBeFalsy();
    expect(store.state.transactions.error).toEqual(null);
    done();
  });
});
