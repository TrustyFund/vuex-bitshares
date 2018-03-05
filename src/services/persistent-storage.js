import Cookies from 'js-cookie';

// Persistent Storage for data cache management
const PersistentStorage = {
  saveUserData: ({ id, encryptedBrainkey, encryptionKey }) => {
    Cookies.set('BITSHARES_USER_ID', id, 7);
    Cookies.set('BITSHARES_USER_BRAINKEY', encryptedBrainkey, 7);
    Cookies.set('BITSHARES_ENCRYPTION_KEY', encryptionKey, 7);
  },
  getSavedUserData: () => {
    const userId = Cookies.get('BITSHARES_USER_ID');
    const encryptedBrainkey = Cookies.get('BITSHARES_USER_BRAINKEY');
    const encryptionKey = Cookies.get('BITSHARES_ENCRYPTION_KEY');
    if (!userId || !encryptedBrainkey || !encryptionKey) return null;
    if (typeof (userId) !== 'string') return null;
    return {
      userId,
      encryptedBrainkey,
      encryptionKey
    };
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
  }
};

export default PersistentStorage;
