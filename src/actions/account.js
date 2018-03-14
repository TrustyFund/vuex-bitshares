import { PrivateKey, key, Aes } from 'bitsharesjs';
import * as types from '../mutations';
import config from '../../config';
// import { getAccountIdByOwnerPubkey, getAccount } from '../services/wallet.js';
import API from '../services/api';
import PersistentStorage from '../services/persistent-storage';

const OWNER_KEY_INDEX = 1;
const ACTIVE_KEY_INDEX = 0;


/**
 * Function to convert array of balances to object with keys as assets ids
 * @param {Array} balancesArr - array of balance objects
 */
const balancesToObject = (balancesArr) => {
  const obj = {};
  balancesArr.forEach(item => {
    obj[item.asset_type] = item;
  });
  return obj;
};

// helper fync
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

/**
 * Unlocks user's wallet via provided password
 * @param {string} password - user password
 */
export const unlockWallet = ({ commit, state }, password) => {
  const passwordAes = Aes.fromSeed(password);
  const encryptionPlainbuffer = passwordAes.decryptHexToBuffer(state.encryptionKey);
  const aesPrivate = Aes.fromSeed(encryptionPlainbuffer);
  commit(types.ACCOUNT_UNLOCK_WALLET, aesPrivate);
};

/**
 * Locks user's wallet
 */
export const lockWallet = ({ commit }) => {
  commit(types.ACCOUNT_LOCK_WALLET);
};

/**
 * Creates account & wallet for user
 * @param {string} name - user name
 * @param {string} password - user password
 * @param {string} dictionary - string to generate brainkey from
 */
export const signup = async (state, { name, password, dictionary }) => {
  const { commit } = state;
  commit(types.ACCOUNT_SIGNUP_REQUEST);
  const brainkey = API.Account.suggestBrainkey(dictionary);
  console.log(brainkey);
  const result = await API.Account.createAccount({
    name,
    activeKey: key.get_brainPrivateKey(brainkey, ACTIVE_KEY_INDEX),
    ownerKey: key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX),
    referrer: config.referrer || ''
  });
  console.log('Account created : ', result.success);
  if (result.success) {
    const userId = await API.ChainListener.addSubscription('userSignUp', { name }, true);
    const wallet = createWallet({ password, brainkey });
    console.log(userId);
    commit(types.ACCOUNT_SIGNUP_COMPLETE, { wallet, userId });
    PersistentStorage.saveUserData({
      id: userId,
      encryptedBrainkey: wallet.encryptedBrainkey,
      encryptionKey: wallet.encryptionKey,
      passwordPubkey: wallet.passwordPubkey
    });
    return { success: true };
  }
  commit(types.ACCOUNT_SIGNUP_ERROR, { error: result.error });
  return {
    success: false,
    error: result.error
  };
};

//  write backup brainkey date to Cookie
export const storeBackupDate = (state, { date, userId }) => {
  const { commit } = state;
  PersistentStorage.saveBackupDate({
    date, userId
  });
  commit(types.STORE_BACKUP_DATE, date, userId);
};

/**
 * Logs in & creates wallet
 * @param {string} password - user password
 * @param {string} brainkey - user brainkey
 */
export const login = async (state, { password, brainkey }) => {
  const { commit } = state;
  commit(types.ACCOUNT_LOGIN_REQUEST);
  const wallet = createWallet({ password, brainkey });

  const ownerKey = key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX);
  const ownerPubkey = ownerKey.toPublicKey().toPublicKeyString();
  const userId = await API.Account.getAccountIdByOwnerPubkey(ownerPubkey);
  const id = userId && userId[0];
  if (id) {
    PersistentStorage.saveUserData({
      id,
      encryptedBrainkey: wallet.encryptedBrainkey,
      encryptionKey: wallet.encryptionKey,
      passwordPubkey: wallet.passwordPubkey
    });
    commit(types.ACCOUNT_LOGIN_COMPLETE, { wallet, userId: id });
    return {
      success: true
    };
  }
  commit(types.ACCOUNT_LOGIN_ERROR, { error: 'Login error' });
  return {
    success: false,
    error: 'Login error'
  };
};

/**
 * Log out
 */
export const logout = ({ commit }) => {
  console.log('logout');
  commit(types.ACCOUNT_LOGOUT);
  PersistentStorage.clearSavedUserData();
};

/**
 * Gets user's data from storage and saves it
 */
export const checkCachedUserData = ({ commit }) => {
  const data = PersistentStorage.getSavedUserData();
  let backupDate;
  if (data) {
    try {
      const backupArray = JSON.parse(data.backupDate);
      if (backupArray instanceof Array) {
        backupArray.forEach((item) => {
          if (item.userId === data.userId) {
            backupDate = item.date;
          }
        });
      }
    } catch (ex) {
      backupDate = null;
    }
    commit(types.SET_ACCOUNT_USER_DATA, {
      userId: data.userId,
      encryptedBrainkey: data.encryptedBrainkey,
      encryptionKey: data.encryptionKey,
      backupDate,
      passwordPubkey: data.passwordPubkey
    });
  }
};

/**
 * Checks username for existance
 * @param {string} username - name of user to fetch
 */
export const checkIfUsernameFree = async (state, { username }) => {
  const result = await API.Account.getUser(username);
  return !result.success;
};


export const fetchCurrentUser = async (store) => {
  const { commit, getters } = store;
  const userId = getters.getAccountUserId;
  if (!userId) return;
  commit(types.FETCH_CURRENT_USER_REQUEST);
  const result = await API.Account.getUser(userId);
  if (result.success) {
    const user = result.data;
    result.data.balances = balancesToObject(result.data.balances);
    commit(types.FETCH_CURRENT_USER_COMPLETE, { data: result.data });
  } else {
    commit(types.FETCH_CURRENT_USER_ERROR);
  }
  return result;
}