import * as actions from '../actions/account';
import * as types from '../mutations';

const initialState = {
  user_id: null,
  name: null,
  error: null
};

const mutations = {
  [types.ACCOUNT_CREATED]: (state, { name, id }) => {
    state.user_id = id;
    state.name = name;
  },
  [types.ACCOUNT_FETCHED]: (state, { name, id }) => {
    state.user_id = id;
    state.name = name;
  },
  [types.ACCOUNT_FETCH_ERROR]: (state, error) => {
    state.error = error;
  },
};

export default {
  state: initialState,
  actions,
  mutations
};
