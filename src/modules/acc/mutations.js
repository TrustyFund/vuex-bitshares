export const types = {
  ACCOUNT_CLOUD_LOGIN: 'ACCOUNT_CLOUD_LOGIN',
  ACCOUNT_BRAINKEY_LOGIN: 'ACCOUNT_BRAINKEY_LOGIN',
  ACCOUNT_LOGOUT: 'ACCOUNT_LOGOUT',
  ACCOUNT_SIGNUP_PASSWORD: 'ACCOUNT_SIGNUP_PASSWORD',
  ACCOUNT_SIGNUP_PRIVATE_KEY: 'ACCOUNT_SIGNUP_PRIVATE_KEY',
};

export const mutations = {
  [types.ACCOUNT_CLOUD_LOGIN]: (state, { userId, keys }) => {
    state.userId = userId;
    state.keys = keys;
    state.userType = 'password';
  },
  [types.ACCOUNT_BRAINKEY_LOGIN]: (state, { wallet, userId }) => {
    state.userId = userId;
    state.passwordPubkey = wallet.passwordPubkey;
    state.encryptedBrainkey = wallet.encryptedBrainkey;
    state.encryptionKey = wallet.encryptionKey;
    state.aesPrivate = wallet.aesPrivate;
    state.userType = 'wallet';
  }
};

