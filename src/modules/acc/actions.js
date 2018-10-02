import { PrivateKey, key, Aes } from 'bitsharesjs';
import API from '../../services/api';
import { types } from './mutations';

const OWNER_KEY_INDEX = 1;
const ACTIVE_KEY_INDEX = 0;

// helper func
const createWallet = ({ brainkey, password }) => {
  const passwordAes = Aes.fromSeed(password);
  const encryptionBuffer = key.get_random_key().toBuffer();
  const encryptionKey = passwordAes.encryptToHex(encryptionBuffer);
  const aesPrivate = Aes.fromSeed(encryptionBuffer);

  const normalizedBrainkey = key.normalize_brainKey(brainkey);
  const encryptedBrainkey = aesPrivate.encryptToHex(normalizedBrainkey);
  const passwordPrivate = PrivateKey.fromSeed(password);
  const passwordPubkey = passwordPrivate.toPublicKey().toPublicKeyString();

  const result = {
    passwordPubkey,
    encryptionKey,
    encryptedBrainkey,
    aesPrivate,
  };

  return result;
};



const actions = {
  /**
   * Logs in with password
   * @param {string} name - username
   * @param {string} password - user password
   */
  cloudLogin: async ({ commit }, { name, password }) => {
    
    const { privKey: activeKey } = API.Account.generateKeyFromPassword(
      name,
      'owner',
      password
    );
    const { privKey: ownerKey } = API.Account.generateKeyFromPassword(
      name,
      'active',
      password
    );

    const ownerPubkey = ownerKey.toPublicKey().toPublicKeyString('BTS')
    const userId = await API.Account.getAccountIdByOwnerPubkey(ownerPubkey);

    const id = userId && userId[0];
    if (id) {
      const keys = {
        active: activeKey,
        owner: ownerKey
      };

      const userType = 'password';
      console.log('123')
      commit(types.ACCOUNT_CLOUD_LOGIN, { keys, userId: id });
      return {
        error: false
      };
    }
    return {
      error: 'Invalid username or password'
    };
  },

  /**
   * Logs in & creates wallet
   * @param {string} password - user password
   * @param {string} brainkey - user brainkey
   */
  brainkeyLogin: async (state, { password, brainkey }) => {
    console.log(password, brainkey)
    const { commit } = state;
    const wallet = createWallet({ password, brainkey });

    const ownerKey = key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX);
    const ownerPubkey = ownerKey.toPublicKey().toPublicKeyString('BTS');

    const userId = await API.Account.getAccountIdByOwnerPubkey(ownerPubkey);
    const id = userId && userId[0];
    if (id) {
      const userType = 'wallet';
      // PersistentStorage.saveUserData({
      //   id,
      //   encryptedBrainkey: wallet.encryptedBrainkey,
      //   encryptionKey: wallet.encryptionKey,
      //   passwordPubkey: wallet.passwordPubkey,
      //   userType
      // });
      commit(types.ACCOUNT_BRAINKEY_LOGIN, { wallet, userId: id });
      return { error: false };
    }
    return { error: true };
  }
}


export default actions