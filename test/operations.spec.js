/* eslint-env jest */
import { createLocalVue } from 'vue-test-utils';
import Vuex from 'vuex';
import operations from '../src/modules/operations.js';
import assets from '../src/modules/assets.js';

jest.mock('../src/services/api/operations.js');
jest.mock('../src/services/api/assets.js');
jest.mock('../src/services/api/chain-listener.js');

const localVue = createLocalVue();
localVue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    operations,
    assets
  }
});

const initialState = JSON.parse(JSON.stringify(store.state));

describe('Operations module: getters', () => {
  beforeEach(() => {
    store.replaceState(JSON.parse(JSON.stringify(initialState)));
  });

  test('has correct initial state', () => {
    expect(store.state.operations).toEqual({
      list: [],
      pending: false,
      error: false,
      subscribed: false
    });
  });

  test('has correct getters', () => {
    expect(store.getters['operations/getOperations']).toEqual([]);
    expect(store.getters['operations/isFetching']).toBeFalsy();
    expect(store.getters['operations/isError']).toBeFalsy();
    expect(store.getters['operations/isSubscribed']).toBeFalsy();

    store.state.operations.list = [1, 2, 3];
    expect(store.getters['operations/getOperations']).toEqual([1, 2, 3]);

    store.state.operations.pending = true;
    expect(store.getters['operations/isFetching']).toBeTruthy();

    store.state.operations.error = true;
    expect(store.getters['operations/isError']).toBeTruthy();

    store.state.operations.subscribed = true;
    expect(store.getters['operations/isSubscribed']).toBeTruthy();
  });
});


describe('Operations module: mutations', () => {
  const operationsModule = { ...operations };
  let state;

  beforeEach(() => {
    state = { ...operations.state };
  });

  test('FETCH_USER_OPERATIONS_REQUEST', () => {
    operationsModule.mutations.FETCH_USER_OPERATIONS_REQUEST(state, { userId: '1' });
    expect(state.pending).toBeTruthy();
  });
  test('FETCH_USER_OPERATIONS_ERROR', () => {
    operationsModule.mutations.FETCH_USER_OPERATIONS_ERROR(state, { error: 'error' });
    expect(state.pending).toBeFalsy();
    expect(state.error).toBeTruthy();
  });
  test('FETCH_USER_OPERATIONS_COMPLETE', () => {
    operationsModule.mutations.FETCH_USER_OPERATIONS_COMPLETE(state, {
      operations: [1, 2, 3]
    });
    expect(state.pending).toBeFalsy();
    expect(state.error).toBeFalsy();
    expect(state.list).toEqual([1, 2, 3]);
  });
  test('ADD_USER_OPERATION', () => {
    state.list = [1, 2];
    operationsModule.mutations.ADD_USER_OPERATION(state, {
      operation: { name: 'test' }
    });
    expect(state.list).toEqual([{ name: 'test' }, 1, 2]);
  });
  test('SUBSCRIBE_TO_USER_OPERATIONS', () => {
    operationsModule.mutations.SUBSCRIBE_TO_USER_OPERATIONS(state);
    expect(state.subscribed).toBeTruthy();
  });
  test('UNSUBSCRIBE_FROM_USER_OPERATIONS', () => {
    state.subscribed = true;
    operationsModule.mutations.UNSUBSCRIBE_FROM_USER_OPERATIONS(state);
    expect(state.subscribed).toBeFalsy();
  });
});

describe('Operations module: actions', () => {
  beforeEach(() => {
    store.replaceState(JSON.parse(JSON.stringify(initialState)));
  });

  it('fetches user operations', async done => {
    const result = await store.dispatch('operations/fetchUserOperations', {
      userId: '1.2.3',
      limit: 5
    });
    expect(result.success).toBeTruthy();
    expect(store.getters['operations/getOperations']).toEqual([{
      id: '1111'
    }, {
      id: '2222'
    }, {
      id: '3333'
    }, {
      id: '4444'
    }, {
      id: '5555'
    }]);
    expect(store.getters['operations/isFetching']).toBeFalsy();
    expect(store.getters['operations/isError']).toBeFalsy();
    done();
  });
  it('handles error when fetching user operations', async done => {
    const result = await store.dispatch('operations/fetchUserOperations', {
      userId: 'bad-id',
      limit: 52
    });
    expect(result.success).toBeFalsy();
    expect(store.getters['operations/getOperations']).toEqual([]);
    expect(store.getters['operations/isFetching']).toBeFalsy();
    expect(store.getters['operations/isError']).toBeTruthy();
    done();
  });
  it('subscribes to user operations and receives updates', async done => {
    store.dispatch('operations/subscribeToUserOperations', {
      userId: '1.2.3',
    });
    expect(store.getters['operations/isSubscribed']).toBeTruthy();
    setTimeout(() => {
      expect(store.getters['operations/getOperations']).toEqual([{ id: 'test-update-operation' }]);
      done();
    }, 0);
  });
  it('fetches & subscribes/unsubscribes to user operations t', async done => {
    store.dispatch('operations/fetchAndSubscribe', {
      userId: '1.2.3',
      limit: 5
    });
    setTimeout(() => {
      expect(store.getters['operations/getOperations']).toEqual([{
        id: 'test-update-operation'
      }, {
        id: '1111'
      }, {
        id: '2222'
      }, {
        id: '3333'
      }, {
        id: '4444'
      }, {
        id: '5555'
      }]);
      expect(store.getters['operations/isSubscribed']).toBeTruthy();
      store.dispatch('operations/unsubscribeFromUserOperations');
      expect(store.getters['operations/isSubscribed']).toBeFalsy();
      done();
    }, 0);
  });
});
