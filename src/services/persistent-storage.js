import Cookies from 'js-cookie';

// Persistent Storage for data cache management
const PersistentStorage = {
  saveUserData: ({ id, encryptedBrainkey, encryptionKey, passwordPubkey }) => {
    Cookies.set('BITSHARES_USER_ID', id, 7);
    Cookies.set('BITSHARES_USER_BRAINKEY', encryptedBrainkey, 7);
    Cookies.set('BITSHARES_ENCRYPTION_KEY', encryptionKey, 7);
    Cookies.set('BITSHARES_PASSWORD_PUBKEY', passwordPubkey, 7);
  },
  getSavedUserData: () => {
    const userId = Cookies.get('BITSHARES_USER_ID');
    const encryptedBrainkey = Cookies.get('BITSHARES_USER_BRAINKEY');
    const encryptionKey = Cookies.get('BITSHARES_ENCRYPTION_KEY');
    const backupDate = Cookies.get('BACKUP_DATE');
    const passwordPubkey = Cookies.get('BITSHARES_PASSWORD_PUBKEY');
    if (!userId || !encryptedBrainkey || !encryptionKey || !passwordPubkey) return null;
    if (typeof (userId) !== 'string') return null;
    return {
      userId,
      encryptedBrainkey,
      encryptionKey,
      backupDate,
      passwordPubkey
    };
  },
  clearSavedUserData: () => {
    Cookies.remove('BITSHARES_USER_ID');
    Cookies.remove('BITSHARES_USER_BRAINKEY');
  },
  saveNodesData: ({ data }) => {
    Cookies.set('BITSHARES_NODES', data);
  },
  getSavedNodesData: () => {
    const cachedData = Cookies.getJSON('BITSHARES_NODES');
    if (typeof (cachedData) === 'object' && cachedData !== null) {
      return cachedData;
    }
    return {};
  },
  saveBackupDate: ({ date, userId }) => {
    let backupDateArray = Cookies.get('BACKUP_DATE');
    console.log(backupDateArray);
    if (backupDateArray === undefined) {
      backupDateArray = [{ userId, date }];
    } else {
      try {
        const backupDateFromString = JSON.parse(backupDateArray);
        console.log(backupDateFromString);
        // const foundObj = backupDateFromString.find((item, index) => {
        //   if (item.userId === userId) {
        //     console.log('found same user');
        //     backupDateFromString[index].date = date;
        //     return true;
        //   }
        //   return false;
        // });
        const foundObj = backupDateFromString.some(item => item.userId === userId);
        console.log('foundObj', foundObj);
        if (!foundObj) {
          console.log('not found obj');
          backupDateFromString.push({ userId, date });
          backupDateArray = JSON.stringify(backupDateFromString);
        }
      } catch (ex) {
        console.log(ex);
        console.log('parsing exeption');
        backupDateArray = [{ userId, date }];
      }
    }
    console.log(backupDateArray);
    Cookies.set('BACKUP_DATE', backupDateArray);
  },

};

export default PersistentStorage;
