import { key } from 'bitsharesjs';
import API from '../../services/api';
import { types } from './mutations';

const OWNER_KEY_INDEX = 1;
const ACTIVE_KEY_INDEX = 0;

const actions = {
  /**
   * Logs in with password
   * @param {string} name - username
   * @param {string} password - user password
   */
  cloudLogin: async ({ commit }, { name, password }) => {
    const { privKey: activeKey } = API.Account.utils.generateKeyFromPassword(
      name,
      'owner',
      password
    );
    const { privKey: ownerKey } = API.Account.utils.generateKeyFromPassword(
      name,
      'active',
      password
    );

    // const { active, owner } = API.Account.utils.generateKeysFromPassword({ name, password })

    const ownerPubkey = ownerKey.toPublicKey().toPublicKeyString('BTS')
    console.log(ownerPubkey)
    const userId = await API.Account.getAccountIdByOwnerPubkey(ownerPubkey);
    console.log(userId)
    const id = userId && userId[0];
    if (id) {
      const keys = { active: activeKey, owner: ownerKey };
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
    const wallet = API.Account.utils.createWallet({ password, brainkey });
    
    const ownerKey = key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX);
    const ownerPubkey = ownerKey.toPublicKey().toPublicKeyString('BTS');
    const userId = await API.Account.getAccountIdByOwnerPubkey(ownerPubkey);
    const id = userId && userId[0];

    if (id) {
      const userType = 'wallet';
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