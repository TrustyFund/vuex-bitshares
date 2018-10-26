// temp
import { Aes } from 'bitsharesjs';

import API from '../../services/api';
import { types } from './mutations';

// utils func -> move to utils
const balancesToObject = (balancesArr) => {
  const obj = {};
  balancesArr.forEach(item => {
    obj[item.asset_type] = item;
  });
  return obj;
};


const actions = {
  /**
   * Logs in with password
   * @param {string} name - username
   * @param {string} password - user password
   */
  cloudLogin: async ({ commit }, { name, password }) => {
    // keys: { active, owner }
    const keys = API.Account.utils.generateKeysFromPassword({ name, password });
    const ownerPubkey = keys.owner.toPublicKey().toPublicKeyString('BTS');
    const userId = await API.Account.getAccountIdByOwnerPubkey(ownerPubkey);
    const id = userId && userId[0];
    if (id) {
      commit(types.ACCOUNT_CLOUD_LOGIN, { keys, userId: id });
      return { error: false };
    }
    return {
      error: true,
      message: 'Invalid username or password'
    };
  },

  /**
   * Logs in with brainkey & creates wallet
   * @param {string} password - user password
   * @param {string} brainkey - user brainkey
   */
  brainkeyLogin: async ({ commit }, { password, brainkey }) => {
    const userId = await API.Account.getAccountIdByBrainkey(brainkey);
    const id = userId && userId[0];

    if (id) {
      const wallet = API.Account.utils.createWallet({ password, brainkey });
      commit(types.ACCOUNT_BRAINKEY_LOGIN, {
        userId: id,
        wallet
      });
      return { error: false };
    }
    return { error: true };
  },

  /**
  * Logs in with brainkey & creates wallet
  * @param {string} backup - parsed backup file
  * @param {string} password - password
  */
  fileLogin: async ({ commit }, { backup, password }) => {
    const restored = await API.Backup.restoreBackup({ backup, password });
    if (!restored.success) return { success: false, error: restored.error };
    const {
      wallet: [wallet],
      linked_accounts: [{ name }]
    } = restored.wallet;

    const passwordAes = Aes.fromSeed(password);
    const encryptionPlainbuffer = passwordAes.decryptHexToBuffer(wallet.encryption_key);
    const aesPrivate = Aes.fromSeed(encryptionPlainbuffer);

    const brainkey = aesPrivate.decryptHexToText(wallet.encrypted_brainkey);

    const newWallet = API.Account.utils.createWallet({ password, brainkey });

    const user = await API.Account.getUser(name);
    if (user.success) {
      commit(types.ACCOUNT_BRAINKEY_LOGIN, {
        userId: user.data.account.id,
        wallet: newWallet
      });
      return { success: true };
    }
    return { success: false, error: 'No such user' };
  },

  /**
   * Signs up and logs in with username and password
   * @param {string} name - username
   * @param {string} password - user password
   */
  signupWithPassword: async ({ commit }, { name, password }) => {
    const keys = API.Account.utils.generateKeysFromPassword({ name, password });
    const result = await API.Account.createAccount({
      name,
      activeKey: keys.active,
      ownerKey: keys.owner
    });

    if (result.success) {
      const userId = result.id;
      const userType = 'password';

      commit(types.ACCOUNT_CLOUD_LOGIN, { keys, userId, userType });
      return { error: false };
    }

    return {
      error: true,
      message: result.error
    };
  },

  /**
 * Creates account & wallet for user
 * @param {string} name - user name
 * @param {string} password - user password
 * @param {string} dictionary - string to generate brainkey from
 */
  signupBrainkey: async ({ commit }, { name, password, dictionary, email }) => {
    const brainkey = API.Account.utils.suggestBrainkey(dictionary);
    const result = await API.Account.createAccountBrainkey({
      name,
      email,
      brainkey
    });
    if (result.success) {
      const userId = result.id;
      const wallet = API.Account.utils.createWallet({ password, brainkey });
      commit(types.ACCOUNT_SIGNUP, { wallet, userId });

      return { error: false };
    }
    return {
      error: true,
      message: result.error
    };
  },

  logout: ({ commit }) => {
    commit(types.ACCOUNT_LOGOUT);
  },

  fetchCurrentUser: async (store) => {
    const { commit, getters } = store;
    const userId = getters.getAccountUserId;
    if (!userId) return;
    const result = await API.Account.getUser(userId);
    if (result.success) {
      const user = result.data;
      result.data.balances = balancesToObject(user.balances);
      commit(types.FETCH_CURRENT_USER, { data: user });
    }
  }
};


export default actions;
