export const types = {
  ACCOUNT_CLOUD_LOGIN: 'ACCOUNT_CLOUD_LOGIN'
};

export const mutations = {
  [types.ACCOUNT_CLOUD_LOGIN]: (state, { userId, keys }) => {
    state.userId = userId;
    state.keys = keys;
    state.userType = 'password';
  },
};

