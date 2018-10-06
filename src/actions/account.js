import { PrivateKey, key, Aes } from 'bitsharesjs';
import * as types from '../mutations';
import API from '../services/api';
import PersistentStorage from '../services/persistent-storage';

if (window && window.crypto) {
  // eslint-disable-next-line
  window.crypto.randomBytes = require('randombytes');
}

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

export const { suggestPassword } = API.Account;

export const loginWithPassword = async ({ commit }, { name, password }) => {
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

  const ownerPubkey = ownerKey.toPublicKey().toPublicKeyString('BTS');
  const userId = await API.Account.getAccountIdByOwnerPubkey(ownerPubkey);

  const id = userId && userId[0];
  if (id) {
    const keys = {
      active: activeKey,
      owner: ownerKey
    };

    const userType = 'password';
    PersistentStorage.saveUserData({ id, userType });

    commit(types.ACCOUNT_PASSWORD_LOGIN_COMPLETE, { keys, userId: id });
    return {
      success: true
    };
  }
  commit(types.ACCOUNT_LOGIN_ERROR, { error: 'Login error' });
  return {
    success: false,
    error: 'Invalid username or password'
  };
};

export const restoreBackup = async ({ commit }, { backup, password }) => {
  const restored = await API.Backup.restoreBackup({ backup, password });
  console.log('restored', restored);
  if (!restored.success) {
    commit(types.ACCOUNT_LOGIN_ERROR, { error: 'Login error' });
    return { success: false, error: restored.error };
  }

  console.log('Restored action', restored);

  const {
    wallet: [wallet],
    linked_accounts: [{ name }]
  } = restored.wallet;

  const passwordAes = Aes.fromSeed(password);
  const encryptionPlainbuffer = passwordAes.decryptHexToBuffer(wallet.encryption_key);
  const aesPrivate = Aes.fromSeed(encryptionPlainbuffer);

  const brainkey = aesPrivate.decryptHexToText(wallet.encrypted_brainkey);

  const newWallet = createWallet({ password, brainkey });

  const user = await API.Account.getUser(name);
  if (user.success) {
    const userType = 'wallet';
    PersistentStorage.saveUserData({
      id: user.data.account.id,
      encryptedBrainkey: newWallet.encryptedBrainkey,
      encryptionKey: newWallet.encryptionKey,
      passwordPubkey: newWallet.passwordPubkey,
      userType
    });

    commit(types.ACCOUNT_LOGIN_COMPLETE, { wallet: newWallet, userId: user.data.account.id });
    return { success: true };
  }
  commit(types.ACCOUNT_LOGIN_ERROR, { error: 'Login error' });
  return { success: false, error: 'No such user' };
};

export const signupWithPassword = async ({ commit }, { name, password }) => {
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

  const result = await API.Account.createAccount({
    name,
    activeKey,
    ownerKey,
  });

  if (result.success) {
    const userId = result.id;
    const keys = {
      active: activeKey,
      owner: ownerKey
    };

    const userType = 'password';
    PersistentStorage.saveUserData({
      id: userId,
      userType
    });

    commit(types.ACCOUNT_PASSWORD_LOGIN_COMPLETE, { keys, userId });
    return { success: true };
  }

  commit(types.ACCOUNT_SIGNUP_ERROR, { error: result.error });
  return {
    success: false,
    error: result.error
  };
};

/**
 * Creates account & wallet for user
 * @param {string} name - user name
 * @param {string} password - user password
 * @param {string} dictionary - string to generate brainkey from
 */
export const signup = async (state, { name, password, dictionary, email }) => {
  const { commit } = state;
  commit(types.ACCOUNT_SIGNUP_REQUEST);
  const brainkey = API.Account.utils.suggestBrainkey(dictionary);
  const result = await API.Account.createAccount({
    name,
    email,
    activeKey: key.get_brainPrivateKey(brainkey, ACTIVE_KEY_INDEX),
    ownerKey: key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX),
  });
  console.log('Account created : ', result);
  if (result.success) {
    const userId = result.id;
    const wallet = createWallet({ password, brainkey });
    commit(types.ACCOUNT_SIGNUP_COMPLETE, { wallet, userId });

    const userType = 'wallet';
    PersistentStorage.saveUserData({
      id: userId,
      encryptedBrainkey: wallet.encryptedBrainkey,
      encryptionKey: wallet.encryptionKey,
      passwordPubkey: wallet.passwordPubkey,
      userType
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
  console.log(password, brainkey);
  const { commit } = state;
  commit(types.ACCOUNT_LOGIN_REQUEST);
  // to be able to update pending state instantly
  // await new Promise(resolve => { setTimeout(resolve, 1); });
  const wallet = createWallet({ password, brainkey });

  const ownerKey = key.get_brainPrivateKey(brainkey, OWNER_KEY_INDEX);
  const ownerPubkey = ownerKey.toPublicKey().toPublicKeyString('BTS');
  console.log(ownerPubkey);

  const userId = await API.Account.getAccountIdByOwnerPubkey(ownerPubkey);
  const id = userId && userId[0];
  if (id) {
    const userType = 'wallet';
    PersistentStorage.saveUserData({
      id,
      encryptedBrainkey: wallet.encryptedBrainkey,
      encryptionKey: wallet.encryptionKey,
      passwordPubkey: wallet.passwordPubkey,
      userType
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
  commit(types.CLEAR_CURRENT_USER_WALLET_DATA);
  PersistentStorage.clearSavedUserData();
};

// clears current user data (balances, acount, etc)
export const clearCurrentUserData = ({ commit }) => {
  commit(types.CLEAR_CURRENT_USER_DATA);
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
      passwordPubkey: data.passwordPubkey,
      userType: data.userType
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
    result.data.balances = balancesToObject(user.balances);
    commit(types.FETCH_CURRENT_USER_COMPLETE, { data: user });
  } else {
    commit(types.FETCH_CURRENT_USER_ERROR);
  }
};
