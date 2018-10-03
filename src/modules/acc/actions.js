import API from '../../services/api';
import { types } from './mutations';

const actions = {
  /**
   * Logs in with password
   * @param {string} name - username
   * @param {string} password - user password
   */
  cloudLogin: async ({ commit }, { name, password }) => {
    // keys: { active, owner }
    const keys = API.Account.utils.generateKeysFromPassword({ name, password })
    const ownerPubkey = keys.owner.toPublicKey().toPublicKeyString('BTS')
    const userId = await API.Account.getAccountIdByOwnerPubkey(ownerPubkey);
    console.log(userId)
    const id = userId && userId[0];
    if (id) {
      const userType = 'password';
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
    console.log(password, brainkey)
    const userId = await API.Account.getAccountIdByBrainkey(brainkey)
    const id = userId && userId[0];
    
    if (id) {
      const userType = 'wallet';
      const wallet = API.Account.utils.createWallet({ password, brainkey });
      commit(types.ACCOUNT_BRAINKEY_LOGIN, {
        userId: id,
        wallet
      });
      return { error: false };
    }
    return { error: true };
  },

  logout: ({ commit }) => {
    commit(types.ACCOUNT_LOGOUT);
  }
}


export default actions