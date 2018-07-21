import Cookies from 'js-cookie';

// Persistent Storage for data cache management
const PersistentStorage = {
  set(key, data) {
    Cookies.set(key, data, { expires: 365 });
  },
  get(key) {
    return Cookies.get(key);
  },
  getJSON(key) {
    return Cookies.getJSON(key);
  },
  remove(key) {
    return Cookies.remove(key);
  },
  saveUserData: ({ id, encryptedBrainkey, encryptionKey, passwordPubkey, userType }) => {
    Cookies.set('BITSHARES_USER_ID', id, { expires: 365 });
    Cookies.set('BITSHARES_USER_BRAINKEY', encryptedBrainkey, { expires: 365 });
    Cookies.set('BITSHARES_ENCRYPTION_KEY', encryptionKey, { expires: 365 });
    Cookies.set('BITSHARES_PASSWORD_PUBKEY', passwordPubkey, { expires: 365 });
    Cookies.set('BITSHARES_LOGIN_TYPE', userType, { expires: 365 });
  },
  getSavedUserData: () => {
    const userId = Cookies.get('BITSHARES_USER_ID');
    const encryptedBrainkey = Cookies.get('BITSHARES_USER_BRAINKEY');
    const encryptionKey = Cookies.get('BITSHARES_ENCRYPTION_KEY');
    const backupDate = Cookies.get('BACKUP_DATE');
    const passwordPubkey = Cookies.get('BITSHARES_PASSWORD_PUBKEY');
    const userType = Cookies.get('BITSHARES_LOGIN_TYPE');

    if (!userId || !encryptedBrainkey || !encryptionKey || !passwordPubkey) return null;
    if (typeof (userId) !== 'string') return null;
    return {
      userId,
      encryptedBrainkey,
      encryptionKey,
      backupDate,
      passwordPubkey,
      userType
    };
  },
  clearSavedUserData: () => {
    Cookies.remove('BITSHARES_USER_ID');
    Cookies.remove('BITSHARES_USER_BRAINKEY');
  },
  saveNodesData: ({ data }) => {
    Cookies.set('BITSHARES_NODES', data, { expires: 1 });
  },
  getSavedNodesData: () => {
    const cachedData = Cookies.getJSON('BITSHARES_NODES');
    if (typeof (cachedData) === 'object' && cachedData !== null) {
      return cachedData;
    }
    return null;
  },
  getOpenledgerAddresses: () => {
    const cachedData = Cookies.getJSON('BITSHARES_OPENLEDGER_ADDRESSES');
    if (typeof (cachedData) === 'object' && cachedData !== null) {
      return cachedData;
    }
    return {};
  },
  setOpenledgerAddresses: (data) => {
    console.log('SET COOKIES', data);
    Cookies.set('BITSHARES_OPENLEDGER_ADDRESSES', data, { expires: 60 });
  },
  saveBackupDate: ({ date, userId }) => {
    let backupDateArray = Cookies.get('BACKUP_DATE');
    if (backupDateArray === undefined) {
      backupDateArray = [{ userId, date }];
    } else {
      try {
        const backupDateFromString = JSON.parse(backupDateArray);
        const foundObj = backupDateFromString.some(item => item.userId === userId);
        if (!foundObj) {
          backupDateFromString.push({ userId, date });
          backupDateArray = JSON.stringify(backupDateFromString);
        }
      } catch (ex) {
        backupDateArray = [{ userId, date }];
      }
    }
    Cookies.set('BACKUP_DATE', backupDateArray, { expires: 365 });
  },

};

export default PersistentStorage;
